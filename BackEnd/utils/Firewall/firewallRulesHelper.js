const util = require('util');
const Firewall = require('../../Database/Model/Firewall');
const exec = util.promisify(require('child_process').exec)
const { executeCommand } = require('../../Helpers/executeCommand');
const { IPTABLES_LOG_FILE } = require('../../Helpers/constants');



async function ruleOrNameAlreadyExists(rule, name) {

    //Validate the user input:
    //Checks if the rule name already exists
    let nameAlreadyExists = await Firewall.findOne({ $or: [{ ruleName: name }, { ruleCommand: rule }] })

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
    console.log('ttttttt', chain)
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
    try {
      // Create an empty array to store the rules that need to be updated
      let updateRulesStatus = [];
  
      // Loop through each rule in the input array
      for (let i = 0; i < rules.length; i++) {
        let rule = rules[i];
  
        // Check if the rule exists in the database with the same status
        let ruleExists = await Firewall.exists({
          ruleName: rule.rule_name,
          status: rule.status,
        });
  
        // If the rule does not exist or the status has changed, add it to the updateRulesStatus array
        if (!ruleExists) {
          let get_rule = await Firewall.findOne({ ruleName: rule.rule_name });
          updateRulesStatus.push({
            ruleName: rule.rule_name,
            status: rule.status,
            command: get_rule.ruleCommand,
          });
        }
      }
  
      // Loop through the rules that need to be updated
      for (let i = 0; i < updateRulesStatus.length; i++) {
        let rule = updateRulesStatus[i];
  
        // If the status is true, execute the rule command
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
        // If the status is false, delete the rule
        else {
          command = rule.command;
          const deleteCommand = command.replace(/(-A|-I)\s*/, "-D ");
          exec("sudo " + deleteCommand, async (error, stdout, stderr) => {
            if (error) {
              console.log(`Error deleting rule: ${error}`);
              return false;
            }
          });
        }
  
        // Update the status of the rule in the database
        let updateStatus = await Firewall.findOneAndUpdate(
          { ruleName: rule.ruleName },
          { status: rule.status },
          { new: true }
        );
        console.log(updateStatus);
      }
  
      // Return success message if all rules were updated successfully
      return {
        error: false,
        message: "Rules updated successfully.",
      };
    } catch (error) {
      // Return error message if any error occurred
      return {
        error: true,
        message: error.message,
      };
    }
  }

async function deleteFirewallRules(rules) {
    try {
        for (let item of rules) {
            console.log('rrrrrrrrrrrrrrrrrrrrrrr',item)
            item = item.deletedRule;

            // Find the rule in the database
            let rule = await Firewall.findOne({ ruleName: item });
            if (!rule) {
                throw new Error(`No rule found with name ${item}`);
            }

            let command = rule.ruleCommand;
            // Modify the command to delete the rule
            let deleteCommand = command.replace(/(-A|-I)\s*/, "-D ");

            if (rule.status) {
                try {
                    // Execute the command to delete the rule
                    await exec(`sudo ${deleteCommand}`);
                    // Delete the rule from the database
                    let deleteRule = await Firewall.deleteMany({ ruleName: item });
                    console.log(`Rule ${item} deleted successfully`);
                    console.log(deleteRule);
                } catch (error) {
                    // Throw a new error with the message
                    throw new Error(`Error deleting rule: ${error.message}`);
                }
            } else {
                // If the rule is already disabled, delete it from the database
                let deleteRule = await Firewall.deleteMany({ ruleName: item });
                console.log(`Rule ${item} deleted successfully`);
                console.log(deleteRule);
            }
        }
    } catch (error) {
        // Catch any other errors that might occur and return the error message
        console.error(error.message);
        return error.message;
    }
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

    let output = await executeCommand(`sudo tail -n 1000 ${IPTABLES_LOG_FILE} | tac`)
    return output.stdout
}


module.exports = { getFirewallLogs, applyFirewallRule, getFirewallRules, setCustomFirewallRule, deleteFirewallRules, updateRulesStatus }