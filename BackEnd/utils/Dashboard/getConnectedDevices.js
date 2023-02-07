const util = require('util');
const { executeCommand } = require('../../Helpers/executeCommand');
const exec = util.promisify(require('child_process').exec)
const { DNSMASQ_LEASES_FILE } = require('../../Helpers/constants')

function extractDeviceInfo(string_devices) {

    let devices = []

    //get the content of the file line by line into a new array called "lines"
    lines = string_devices.split('\n')
    //Do for each line
    lines.forEach(item => {
        //split every content of the line with space
        line = item.split(" ")
        //Due the structure of the line, we extract the information for every device
        lease_time = line[0]
        mac = line[1]
        ip = line[2]
        host = line[3] === '*' ? 'Unknown' : line[3]
        //append the information for the device to json array
        devices.push({
            lease_time: lease_time,
            mac: mac,
            ip: ip,
            host: host
        })
    })

    //returns the devices that has connected. The recovered devices are not necessarily connected at this time
    return devices
}

async function isHostUp(ip) {
    // Define the command to check if the given IP is reachable
    const command = `ping -c 1 -W 0.2 ${ip}`;
  
    // Execute the command and capture its output
    const { stdout, stderr } = await exec(command);
  
    // If there is an error, return false
    if (stderr) {
      return false;
    }
  
    // Otherwise, the host is reachable and return true
    return true;
  }


async function getDevices() {
    let activeDevices = [];
    const command = `sudo cat ${DNSMASQ_LEASES_FILE}`;

    // Execute the command and store the result in 'stdout'
    const stdout = await executeCommand(command);

    if (stdout) {
        // Extract device information from the 'stdout' result
        const devices = extractDeviceInfo(stdout);

        // Create a promise that will resolve with the active devices array
        const finishGettingDevices = new Promise((resolve, reject) => {
            let id = 0;
            devices.forEach(async (item, index, array) => {
                try {
                    // Check if the device's IP is online
                    const isIpOnline = await isHostUp(item.ip);

                    // If the IP is online, add the device to the active devices array
                    if (isIpOnline) {
                        item.id = ++id;
                        activeDevices.push(item);
                    }
                } catch (error) {
                    // Log the error
                    console.error(error);
                }

                // Resolve the promise with the active devices array
                if (index === array.length - 1) resolve(activeDevices);
            });
        });

        return finishGettingDevices;
    }
}

module.exports = {
    isHostUp,
    getDevices,
}