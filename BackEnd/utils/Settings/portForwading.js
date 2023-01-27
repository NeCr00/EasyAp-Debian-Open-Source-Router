
const { exec } = require('child_process');

function forwardPort(interface, protocol, accessPointIP, internalPort, machineIP, externalPort) {
    const command = `iptables -t nat -A PREROUTING -i ${interface} -p ${protocol} -d ${accessPointIP} --dport ${internalPort} -j DNAT --to ${machineIP}:${externalPort}`;
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
    });
}




module.exports = {
    forwardPort
}