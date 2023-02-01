
const { exec } = require('child_process');
const IpForwarding = require('../../Database/Model/IPForwarding')

async function ruleExists(internalIP, internalPort, externalPort) {
    const rule = await IpForwarding.findOne({
        internalIP: internalIP,
        internalPort: internalPort,
        externalPort: externalPort
    });
    return rule !== null;
}


async function getAllRules() {
    const rules = await IpForwarding.find({});
    const formattedRules = rules.map(rule => ({
        internal_ip: rule.internalIP,
        internal_port: rule.internalPort,
        external_port: rule.externalPort,
        status: rule.status
    }));
    return formattedRules;
}

async function forwardPort(interface, internalPort, machineIP, externalPort) {

    isAlreadyExists = ruleExists(machineIP, internalPort, externalPort)
    if (isAlreadyExists) {
        return { error: true, messsage: 'Rule already exists' }
    }
    const command = `iptables -t nat -A PREROUTING -i ${interface} -p tcp  --dport ${internalPort} -j DNAT --to ${machineIP}:${externalPort}`;
    exec(command, async (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error}`);
            return;
        }
        //insert into the database
        appendRule = await IpForwarding.create({
            internalIP: machineIP,
            internalPort: internalPort,
            externalPort: externalPort,
            status: true,
            IPForwardingCommand: command
        })

        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
    });
}


async function removeForwardPort(interface, internalPort, machineIP, externalPort) {
    await IpForwarding.findOne({
        internalIP: machineIP,
        internalPort: internalPort,
        externalPort: externalPort
    }, (error, result) => {
        if (error) {
            console.error(`Error: ${error}`);
            return;
        }

        if (!result) {
            console.error(`No rule found for the specified parameters.`);
            return;
        }

        const command = `iptables -t nat -D PREROUTING -i ${interface} -p tcp  --dport ${internalPort} -j DNAT --to ${machineIP}:${externalPort}`;
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error: ${error}`);
                return;
            }
            result.remove((error) => {
                if (error) {
                    console.error(`Error: ${error}`);
                    return;
                }
                console.log(`IP forwarding rule removed from iptables and database.`);
            });
        });
    });
}

async function changeStatusIPForwarding(interface, internalPort, machineIP, externalPort, status) {
    // Find the rule in the collection
    let rule = await IpForwarding.findOne({
        internalIP: machineIP,
        internalPort: internalPort,
        externalPort: externalPort
    });

    if (status) {
        // If the rule exists but its status is false, insert it again
        if (rule && !rule.status) {
            const command = rule.IPForwardingCommand;
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error: ${error}`);
                    return;
                }
                // Update the status in the collection
                rule.status = true;
                rule.save();
                console.log(`stdout: ${stdout}`);
                console.error(`stderr: ${stderr}`);
            });
        }
    } else {
        // If the rule exists, delete it
        if (rule && rule.status) {
            const command = `iptables -t nat -D PREROUTING -i ${interface} -p tcp  --dport ${internalPort} -j DNAT --to ${machineIP}:${externalPort}`;
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error: ${error}`);
                    return;
                }
                // Update the status in the collection
                rule.status = false;
                rule.save();
                console.log(`stdout: ${stdout}`);
                console.error(`stderr: ${stderr}`);
            });
        }
    }
}





module.exports = {
    forwardPort, removeForwardPort, changeStatusIPForwarding,getAllRules
}