const util = require('util');
const Firewall = require('../Database/Model/Firewall');
const exec = util.promisify(require('child_process').exec)
const readLastLines = require('read-last-lines');
const e = require('express');



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

    options.chain = options.chain === 'Input' ? 'INPUT' : 'OUTPUT';

    let command = ` iptables  -A ${options.chain}`;


    // Check if IP is a range or a single IP
    if (options.ip.includes("-")) {
        ipRange = options.ip.split("-");
        ipRange[0] = ipRange[0].replace(/\s+/g, ''); //remove spaces
        ipRange[1] = ipRange[1].replace(/\s+/g, '');
        if (options.chain === "OUTPUT") {
            command += ` -m iprange --dst-range '+ ${ipRange[0]}-${ipRange[1]}`;
        } else {
            command += ` -m iprange --src-range ${ipRange[0]}-${ipRange[1]}`;
        }
    } else {
        options.ip = options.ip.replace(/\s+/g, '');
        if (options.chain === "OUTPUT") {
            command += ` -m iprange --dst-range ${options.ip}-${options.ip}`;
        } else {
            command += ` -m iprange --src-range ${options.ip}-${options.ip}`;
        }
    }

    if (options.mac && options.chain === "INPUT") {
        command += ` -m mac --mac-source ${options.mac}`;
    }
    else if (options.mac) {
        command += ` -m mac --mac-destination ${options.mac}`;
    }

    if (options.protocol && options.protocol !== "TCP/UDP") {

        command += ` -p ${options.protocol}`;
    }


    // Check if port is a range or a single port
    if (options.port.includes("-")) {
        portRange = options.port.split("-");
        portRange[0] = portRange[0].replace(/\s+/g, ''); //remove spaces
        portRange[1] = portRange[1].replace(/\s+/g, '');
        if (options.chain === "INPUT") {
            command += ` --sport ${portRange[0]}:${portRange[1]}`;
        }
        else {
            command += ` --dport ${options.port}`;
        }

    } else {

        command += ` --dport ${options.port}`;
    }


    if (options.action === "Allow") {
        command += " -j ACCEPT";
    } else if (options.action === "Deny") {
        command += " -j DROP";
    } else {
        console.log("Invalid action");
        return false;
    }
    // Checks if the rule already exists
    let exists = await ruleOrNameAlreadyExists(command, options.rule_name)

    return new Promise((resolve, reject) => {
        //if doesnt exists, it applied
        if (!exists) {
            exec('sudo ' + command, async (err, stdout, stderr) => {
                if (err) {
                    console.error(err);
                    resolve(true)
                    return true;
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
                    resolve(false)
                    return false;
                }
            })
        }
        else {
            console.log("Rule or Name already exists")
            resolve(true)
            return true
        }
    })
}

async function setCustomFirewallRule(rule, name) { //finished

    let exists = await ruleOrNameAlreadyExists(rule, name);

    if (exists) {
        console.log('Rule or Name already exists')
        return false
    }


    command = rule
    // run the `ls` command using exec

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
            const deleteCommand = command.replace(/-A\s*/, "-D ");
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


async function getFirewallRules() {  //Finished
    let rules = []
    let firewallRules = await Firewall.find({})

    firewallRules.forEach((rule, index) => rules.push({
        "id": index,
        "rule_name": rule.ruleName,
        "status": rule.status ? "1" : "0"
    }))

    return rules
}


async function getFirewallLogs() { //Finished

    let logs = "Logs are not available for the moment."

    // Crashes the server if file doesn't exist
    // Maybe use tail instead 
    return new Promise((resolve, reject) => {
        readLastLines.read('/var/log/iptables.log', 10)
            .then((lines) => {
                if (lines) {
                    resolve(lines)
                }
                else {
                    resolve(logs)
                }
            });
    })
}


//TODO: we have to specify if the firewallLogs activation should be configured by function or from bash
async function enableFirewallLogs() {

    command = 'sudo vi /etc/syslog.conf >> kern.warning /var/log/iptables.log'
    // run the `ls` command using exec
    const { stdout, stderr } = await exec(command);

    if (stderr) {
        //console.log('stderr:', stderr);
        console.log('cannot enable firewall logs')
    }
    else {
        //console.log('stdout:', stdout);
        command = 'sudo service rsyslog restart'
        const { output, error } = await exec(command)
        if (error) {
            console.log('cannot enable firewall logs')
        }
        else {
            console.log('Firwall Logs Enabled at /var/log/iptables.log')
        }
    }

}

module.exports = { getFirewallLogs, applyFirewallRule, getFirewallRules, setCustomFirewallRule, deleteFirewallRules, updateRulesStatus }