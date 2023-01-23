const util = require('util');
const Firewall = require('../Database/Model/Firewall');
const exec = util.promisify(require('child_process').exec)
const readLastLines = require('read-last-lines');

function setFirewallRule() {

}


function setCustomFirewallRule() {

}


function updateCollectionsRules() {

}


async function getFirewallRules() {
    let rules = []
    let firewallRules = await Firewall.find({})

    firewallRules.forEach((rule, index) => rules.push({
        "id": index,
        "rule_name": rule.ruleName,
        "status": rule.status ? "1" : "0"
    }))

    return rules
}


async function getFirewallLogs() {

    let logs = "Logs are not available for the moment."

    return new Promise((resolve, reject) => {
        readLastLines.read('/var/log/iptables.log', 10)
        .then((lines) => {
            if (lines){
                resolve(lines)
            }
            else{
                resolve(logs)
            }
        });
    })

}


//TODO: we have to specify if the firewallLogs activation should be configured by function or from bash
async function enableFirwallLogs() {

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

module.exports = { getFirewallLogs,getFirewallRules }