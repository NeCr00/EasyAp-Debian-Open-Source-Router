const util = require('util');
const exec = util.promisify(require('child_process').exec)
const { DNSMASQ_LEASES_FILE } = require('../../Helpers/constants')
const { readFileSync } = require('fs');

function extractDeviceInfo(string_devices) {
    let currentTimeSeconds = new Date() / 1000
    let devices = []
    //get the content of the file line by line into a new array called "lines"
    lines = string_devices.split('\n')
    //Do for each line
    lines.forEach(item => {
        //split every content of the line with space
        line = item.split(" ")
        //Due the structure of the line, we extract the information for every device
        leaseTime = line[0]
        mac = line[1]
        ip = line[2]
        host = line[3] === '*' ? 'Unknown' : line[3]

        //calucate the hour remaining for lease time
        totalRemainingLeaseSeconds = leaseTime - currentTimeSeconds
        leaseTimeHour = Math.floor((totalRemainingLeaseSeconds) / 3600)
        leasTimeMinutes = Math.floor((totalRemainingLeaseSeconds % 3600) / 60);
        
        //append the information for the device to json array
        devices.push({
            lease_time: `${leaseTimeHour}h ${leasTimeMinutes}m`,
            mac: mac,
            ip: ip,
            host: host
        })
    })

    //returns the devices that has connected. The recovered devices are not necessarily connected at this time
    return devices
}


async function isHostUp(ipAddress) {
    return new Promise((resolve, reject) => {
        exec('sudo arp -a -i wlan0', (error, stdout) => {
            if (error) {
                reject(error);
            }


            let lines = stdout.split('\n');
            let found = false;
            let active = false;

            for (let line of lines) {
                if (line.includes(ipAddress) && !line.includes('<incomplete>')) {

                    found = true;
                    break;
                }
            }

            if (found) {
                resolve(true);
            }
            else {
                resolve(false);
            }
        });
    });
}

async function getDevices() {
    let activeDevices = [];
    let filePath = DNSMASQ_LEASES_FILE

    let fileContent = readFileSync(filePath, 'utf-8')

    if (fileContent) {
        // Extract device information from the 'stdout' result
        let devices = extractDeviceInfo(fileContent);

        // Create a promise that will resolve with the active devices array
        let finishGettingDevices = new Promise((resolve, reject) => {
            let id = 0;
            devices.forEach(async (item, index, array) => {
                try {
                    // Check if the device's IP is online
                    let isIpOnline = await isHostUp(item.ip);

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