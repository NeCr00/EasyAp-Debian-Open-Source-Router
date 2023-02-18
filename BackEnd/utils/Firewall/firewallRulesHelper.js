const util = require('util');
const Firewall = require('../../Database/Model/Firewall');
const exec = util.promisify(require('child_process').exec)
const { executeCommand } = require('../../Helpers/executeCommand');
const { IPTABLES_LOG_FILE } = require('../../Helpers/constants');

async function ruleOrNameAlreadyExists(rule, name) {
    //Checks if the rule name already exists
    let nameAlreadyExists = await Firewall.findOne({ $or: [{ ruleName: name }, { ruleCommand: rule }] })
    console.log(nameAlreadyExists)
    if (nameAlreadyExists) {
        console.log('Rule or Name already exists')
        return true
    }
    else {
        return false
    }
}

async function applyFirewallRule(options) {

    let chain = options.chain.toUpperCase();
    console.log('ttttttt',chain)
    if (!["INPUT", "FORWARD", "OUTPUT"].includes(chain)) {
        console.log("Invalid chain");
        return { error: true, message: 'Invalid Chain' };
    }

    let command = `iptables -I ${chain}`;

    // Check if IP source is a range or a single IP
    if (options.ip_source) {
        if (options.ip_source.includes("-")) {
            ipRange = options.ip_source.split("-");
            ipRange[0] = ipRange[0].replace(/\s+/g, ''); //remove spaces
            ipRange[1] = ipRange[1].replace(/\s+/g, '');
            command += ` -s ${ipRange[0]}-${ipRange[1]}`;
        } else {
            options.ip_source = options.ip_source.replace(/\s+/g, '');
            command += ` -s ${options.ip_source}`;
        }
    }

    // Check if IP dest is a range or a single IP
    if (options.ip_dest) {
        if (options.ip_dest.includes("-")) {
            ipRange = options.ip_dest.split("-");
            ipRange[0] = ipRange[0].replace(/\s+/g, ''); //remove spaces
            ipRange[1] = ipRange[1].replace(/\s+/g, '');
            command += ` -d ${ipRange[0]}-${ipRange[1]}`;
        } else {
            options.ip_dest = options.ip_dest.replace(/\s+/g, '');
            command += ` -d ${options.ip_dest}`;
        }
    }

    if (options.protocol && options.protocol !== "TCP/UDP") {
        command += ` -p ${options.protocol}`;
    }
    else {
        return { error: true, message: 'Please specify a protocol' };
    }

    // Check if port source is a range or a single port
    if (options.port_source) {
        const portRange = options.port_source.split("-").map(p => p.trim());
        const sportOption = portRange.length === 2 ? `--sport ${portRange[0]}:${portRange[1]}` : `--sport ${portRange[0]}`;
        command += ` ${sportOption}`;
    }

    // Check if port dest is a range or a single port
    if (options.port_dest) {
        const portRange = options.port_dest.split("-").map(p => p.trim());
        const dportOption = portRange.length === 2 ? `--dport ${portRange[0]}:${portRange[1]}` : `--dport ${portRange[0]}`;
        command += ` ${dportOption}`;
    }

   



    if (options.action === "Allow") {
        command += " -j ACCEPT";
    } else if (options.action === "Deny") {
        command += " -j DROP";
    } else {
        console.log("Invalid action");
        return { error: true, message: 'Invalid Action' };
    }


    // Checks if the rule already exists
    let exists = await ruleOrNameAlreadyExists(command, options.rule_name)

    return new Promise((resolve, reject) => {
        //if doesnt exists, it applied
        if (!exists) {
            exec('sudo ' + command, async (err, stdout, stderr) => {
                if (err) {
                    console.error(err);
                    resolve({ error: true, message: 'Something went wrong with Iptables' })

                }
                else {
                    //if the iptables command applied, the command is placed on the collection
                    //a remove of spaces in name of the rule
                    options.rule_name = options.rule_name.replace(/\s/g, '');
                    let insertedRule = await Firewall.create({
                        ruleName: options.rule_name,
                        ruleCommand: command,
                        status: true
                    });
                    console.log("Rule has been applied");
                    resolve({ error: false, message: 'Firewall Rule has been applied' })
                    return false;
                }
            })
        }
        else {
            console.log("Rule or Name already exists")
            resolve({ error: true, message: 'Rule Name Already Exists !' })
            return true
        }
    })
}

async function setCustomFirewallRule(rule, name) {

    let exists = await ruleOrNameAlreadyExists(rule, name);

    if (exists) {
        console.log('Rule or Name already exists')
        return false
    }

    command = rule

    return new Promise((resolve, reject) => {
        exec('sudo ' + command, async (err, stdout, stderr) => {
            if (err) {
                //console.log('stderr:', stderr);
                console.log('cannot add custom firewall rule ', err)
                resolve(false)
                return false
            }

            else {

                let insertedRule = await Firewall.create({
                    ruleName: name,
                    ruleCommand: rule,
                    status: true
                });
                resolve(true)
                return true
            }

        })
    })

}

async function updateRulesStatus(rules) {

    rules.forEach(async function (rule) {

        let updateRulesStatus = []
        let ruleExists = await Firewall.exists({ ruleName: rule.rule_name, status: rule.status })
        if (!ruleExists) {
            //This means that the rule exists but the status had been changed
            let get_rule = await Firewall.findOne({ ruleName: rule.rule_name })
            updateRulesStatus.push({ ruleName: rule.rule_name, status: rule.status, command: get_rule.ruleCommand })
        }

        if (updateRulesStatus) {
            updateRulesStatus.forEach(async rule => {
                console.log(1, rule)

                if (rule.status) {
                    exec(rule.command, (error, stdout, stderr) => {
                        if (error) {
                            console.log(`error: ${error.message}`);
                            return;
                        }
                        if (stderr) {
                            console.log(`stderr: ${stderr}`);
                            return;
                        }
                        console.log(`stdout: ${stdout}`);
                    });
                }
                else {
                    command = rule.command;
                    const deleteCommand = command.replace(/-A\s*/, "-D ");
                    // Execute the command using the exec function
                    exec('sudo ' + deleteCommand, async (error, stdout, stderr) => {
                        if (error) {
                            console.log(`Error deleting rule: ${error}`);
                            return false
                        }
                    });
                }



                let updateStatus = await Firewall.findOneAndUpdate({ ruleName: rule.ruleName }, { status: rule.status }, { new: true })
                console.log(updateStatus)
            })
        }
    })

}

async function deleteFirewallRules(rules) {
    rules.forEach(async item => {
        item = item.deletedRule
        try {
            // Search the database for the specified rule name
            const rule = await Firewall.findOne({ name: item });
            if (!rule) {
                throw new Error(`No rule found with name ${item}`);
            }
            // Retrieve the iptables command for the rule
            const command = rule.ruleCommand;
            // Modify the command to delete the rule
            let deleteCommand = command.replace(/(-A|-I)\s*/, "-D ");
            //deleteCommand = command.replace(/-I\s*/, "-D ");
            // Execute the command using the exec function
            exec('sudo ' + deleteCommand, async (error, stdout, stderr) => {
                if (error) {
                    console.log(`Error deleting rule: ${error}`);
                    return false
                }
                console.log(item)
                deleteRule = await Firewall.deleteMany({ ruleName: item })
                console.log(`Rule ${item} deleted successfully`);
                console.log(deleteRule)
            });
        } catch (error) {
            console.error(error);
        }
    })
}

async function getFirewallRules() {
    let rules = []
    let firewallRules = await Firewall.find({})

    firewallRules.forEach((rule, index) => rules.push({
        "id": index,
        "rule_name": rule.ruleName,
        "command": rule.ruleCommand,
        "status": rule.status ? "1" : "0"
    }))

    return rules
}

async function getFirewallLogs() {

    let output = await executeCommand(`sudo tail -n 10 ${IPTABLES_LOG_FILE}`)
    return output.stdout
}


module.exports = { getFirewallLogs, applyFirewallRule, getFirewallRules, setCustomFirewallRule, deleteFirewallRules, updateRulesStatus }