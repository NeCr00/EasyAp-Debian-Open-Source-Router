
const { exec } = require('child_process');
const PortForwarding = require('../../Database/Model/PortForwarding')
const {getGatewayAddress} = require('../DHCP/getDHCPConfigs')
const { INTERFACE, ROUTER_INTERFACE} = require('../../Helpers/constants')

async function ruleExists(internalIP, internalPort, externalPort) {
    return await PortForwarding.findOne({
        internalIP: internalIP,
        internalPort: internalPort,
        externalPort: externalPort
    });

}


async function getAllRules() {
    const rules = await PortForwarding.find({});
    const formattedRules = rules.map(rule => ({
        internal_ip: rule.internalIP,
        internal_port: rule.internalPort,
        external_port: rule.externalPort,
        status: rule.status
    }));

    return formattedRules;
}

async function forwardPort(internalPort, machineIP, externalPort, addEntry) {
    return new Promise(async (resolve, reject) => {
        try {
            // Initialize the error flag to false
            let error = false;
            console.log(internalPort, machineIP, externalPort);

            // Check if the rule already exists
            isAlreadyExists = await ruleExists(machineIP, internalPort, externalPort);

            // If the rule already exists, return error message
            if (isAlreadyExists && addEntry) {
                resolve({ error: true, message: 'Rule already exists' });
            }

            // Define the first iptables command
            let command1 = `sudo iptables -t nat -A PREROUTING -i ${ROUTER_INTERFACE} -p tcp  --dport ${internalPort} -j DNAT --to-destination ${machineIP}:${externalPort}`;
            // Define the second iptables command
            let command2 = `sudo iptables -t nat -A POSTROUTING -o ${INTERFACE} -p tcp --dport ${internalPort} -d ${machineIP} -j SNAT --to-source ${getGatewayAddress}`;



            // Execute the first iptables command
            exec(command1, async (error, stdout, stderr) => {
                // If an error occurs, set the error flag to true and return
                if (error) {
                    console.error(`Error: ${error}`);
                    error = true;
                    resolve({ error: error });

                }
                // Execute the second iptables command
                exec(command2, async (error, stdout, stderr) => {
                    // If an error occurs, set the error flag to true and return
                    if (error) {
                        console.error(`Error: ${error}`);
                        error = true;
                        resolve({ error: error });

                    }
                    if (addEntry) {
                        // Insert the rule into the database
                        let appendRule = await PortForwarding.create({
                            internalIP: machineIP,
                            internalPort: internalPort,
                            externalPort: externalPort,
                            status: true,
                            IPForwardingCommand: `${command1}\n${command2}`
                        });
                    }

                    console.log(`stdout: ${stdout}`);
                    console.error(`stderr: ${stderr}`);
                });
            });

            // Return the error flag
            resolve({ error: false });
        } catch (err) {
            console.error(`Error: ${err}`);
            resolve({ error: true });
        }
    })

}





async function removeForwardPort(internalPort, machineIP, externalPort, removeEntry) {
    return new Promise(async (resolve, reject) => {

        try {
            let query = PortForwarding.findOne({
                internalIP: machineIP,
                internalPort: internalPort,
                externalPort: externalPort
            });

            let result = await query.exec();
            let error = false;

            if (!result) {
                console.error(`No rule found for the specified parameters.`);
                resolve({ error: true });
            }

            let command1 = `sudo iptables -t nat -D PREROUTING -i ${ROUTER_INTERFACE} -p tcp  --dport ${internalPort} -j DNAT --to-destination ${machineIP}:${externalPort}`;
            exec(command1, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error: ${error}`);
                    resolve({ error: true });
                }

                let command2 = `sudo iptables -t nat -D POSTROUTING -o ${INTERFACE} -p tcp --dport ${internalPort} -d ${machineIP} -j SNAT --to-source 192.168.4.1`;
                exec(command2, (error, stdout, stderr) => {
                    if (error) {
                        console.error(`Error: ${error}`);
                        resolve({ error: true });
                    }

                    if (removeEntry) {
                        result.remove((error) => {
                            if (error) {
                                console.error(`Error: ${error}`);
                                resolve({ error: true });
                            }
                            console.log(`IP forwarding rules removed from iptables and database.`);
                        });
                    }

                });
            });

            resolve({ error: false });
        } catch (err) {
            console.log(err)
            resolve({ error: true })
        }
    })

}








async function changeStatusIPForwarding(internalPort, machineIP, externalPort, status) {

    return new Promise(async (resolve, reject) => {
        try {
            console.log(11111111)
            // Find the rule in the collection
            let rule = await PortForwarding.findOne({
                internalIP: machineIP,
                internalPort: internalPort,
                externalPort: externalPort
            });
            console.log('test1', rule)
            // if the saved rule status is different, status of rule should be changed
            if (rule.status !== status && status) {
                console.log('3131231231231')
                //if the new status is true, we should enable the rule
                output = await forwardPort(internalPort, machineIP, externalPort, false)
                console.log('test1', output)
                if (output.error) {
                    resolve({ error: true })
                } else {
                    await PortForwarding.findOneAndUpdate({
                        internalIP: machineIP,
                        internalPort: internalPort,
                        externalPort: externalPort
                    }, { status: true }, { new: true })
                }
            }
            else if (rule.status !== status && status === false) {
                //if the new status is false, we should disable the rule
                output = await removeForwardPort(internalPort, machineIP, externalPort, false)
                console.log('test2', output)
                if (output.error) {
                    resolve({ error: true })
                } else {
                    await PortForwarding.findOneAndUpdate({
                        internalIP: machineIP,
                        internalPort: internalPort,
                        externalPort: externalPort
                    }, { status: false }, { new: true })
                }
            }

            resolve({ error: false })


        } catch (err) {
            resolve({ error: true });

        }
    })

}





module.exports = {
    forwardPort, removeForwardPort, changeStatusIPForwarding, getAllRules
}