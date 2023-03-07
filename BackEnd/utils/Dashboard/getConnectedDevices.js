const util = require('util');
const exec = util.promisify(require('child_process').exec)
const { DNSMASQ_LEASES_FILE } = require('../../Helpers/constants')
const { readFileSync } = require('fs');
const { INTERFACE, DNSMASQ_STATIC_LEASES_FILE} = require('../../Helpers/constants')

function extractDeviceInfo(string_devices) {
    let currentTimeSeconds = new Date() / 1000;
    let devices = [];
    //get the content of the file line by line into a new array called "lines"
    lines = string_devices.split('\n');
    //Do for each line
    lines.forEach(item => {
        //split every content of the line with space
        try {
            line = item.split(" ");
            //Due the structure of the line, we extract the information for every device
            leaseTime = line[0];
            mac = line[1];
            ip = line[2];
            host = line[3] === '*' ? 'Unknown' : line[3];

            //calucate the hour remaining for lease time
            totalRemainingLeaseSeconds = leaseTime - currentTimeSeconds;
            leaseTimeHour = Math.floor((totalRemainingLeaseSeconds) / 3600);
            leasTimeMinutes = Math.floor((totalRemainingLeaseSeconds % 3600) / 60);

            //append the information for the device to json array
            devices.push({
                lease_time: `${leaseTimeHour}h ${leasTimeMinutes}m`,
                mac: mac,
                ip: ip,
                host: host
            });
        } catch (error) {
            console.error('Error occurred while processing line:', item);
            console.error(error);
        }
    });

    //returns the devices that has connected. The recovered devices are not necessarily connected at this time
    return devices;
}


async function isHostUp(ipAddress, mac) {
    return new Promise((resolve, reject) => {

        // Execute the command to get connected devices
        exec(`sudo hostapd_cli -i ${INTERFACE} all_sta | grep -oE '([[:xdigit:]]{2}:){5}[[:xdigit:]]{2}' | sort -u`, async (error, stdout) => {

            try {
                // Split the output by line
                let lines = stdout.split('\n');
                let found = false;

                // Check if the MAC address is in the list of connected devices
                for (let line of lines) {
                    if (line.match(mac) && mac !== '' && mac) {
                        found = true;
                        break;
                    }
                }

                if (found) {
                    console.log('Device is connected')
                    resolve(true);
                } else {
                    console.log('Device is not connected')
                    resolve(false);
                }
            } catch (err) {
                console.error(`Error in isHostUp: ${err}`);
                resolve(err);
            }

        })
    });
}

//get Static Ips

async function getStaticDevices(activeDevices) {

    return new Promise((resolve, reject) => {

        // Get a list of MAC addresses from hostapd_cli
        try {
            exec(`sudo hostapd_cli -i ${INTERFACE} all_sta | grep -oE '([[:xdigit:]]{2}:){5}[[:xdigit:]]{2}' | sort -u`, (error, stdout) => {
                try {
                    let macList = stdout.trim().split('\n');
                    let devices = [];
                    console.log('mac list: ' + macList)
                    if (macList.length > 0) {
                        // Get the ARP table for the  interface
                        exec(`sudo arp -a -i ${INTERFACE}`, (error, stdout) => {
                            try {
                                const arpTable = stdout.trim().split('\n');
                                for (let arpEntry of arpTable) {
                                    let fields = arpEntry.trim().split(/\s+/);
                                    const ipAddressRegex = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;
                                    let match = arpEntry.match(ipAddressRegex);
                                    if (match !== null) {
                                        let ip = match[0]
                                        let mac = fields[3]; // Use the fourth field for MAC address (the format of the arp output may differ)
                                        // Check if the MAC address is in the macList
                                        if (macList.includes(mac)) {
                                            let existingDevice = activeDevices.find(device => device.mac === mac);
                                            if (existingDevice) {
                                                // If an existing device is found with the same MAC address, update its IP address
                                                console.log("Found existing device");
                                                existingDevice.ip = ip;
                                                if(getStaticDevicesDnsmasqFile(ip)){
                                                    existingDevice.lease_time = 'Infinity'
                                                }

                                            } else {
                                                // If an existing device is not found with the same MAC address, add a new device to the activeDevices array
                                                console.log("Adding new device");
                                                activeDevices.push({
                                                    lease_time: `Infinity`,
                                                    mac: mac,
                                                    ip: ip,
                                                    host: 'Unknown'
                                                });
                                            }
                                        }
                                    }
                                }
                                resolve(activeDevices);
                            } catch (err) {
                                console.log('Cannot parse the ARP table or something went wrong')
                                resolve([]);
                            }
                        });
                    } else {
                        console.log("No active devices")
                        resolve([]);
                    }
                } catch (err) {
                    console.log('Cannot parse the macList or something went wrong')
                    resolve([]);
                }
            });
        } catch (err) {
            console.log('Cannot execute hostapd_cli command or something went wrong')
            resolve([]);
        }

    });
    
}

function getStaticDevicesDnsmasqFile(ip){

    const dnsmasqStaticFile = DNSMASQ_STATIC_LEASES_FILE
    let  staticFile =  readFileSync(dnsmasqStaticFile, 'utf-8');

    lines = staticFile.split('\n');

    for (line of lines){

        if (line.includes(ip)){
            return true;
        }
    }

    return false;
}




async function getDevices() {
    let activeDevices = [];
    let filePath = DNSMASQ_LEASES_FILE

    try {
        let fileContent = await readFileSync(filePath, 'utf-8');

        if (fileContent) {
            // Extract device information from the 'stdout' result
            let devices = await extractDeviceInfo(fileContent);

            // Create a promise that will resolve with the active devices array
            let finishGettingDevices = new Promise((resolve, reject) => {
                let id = 0;

                //check which dynamic ip addresses 
                devices.forEach(async (item, index, array) => {
                    try {
                        // Check if the device's IP is online
                        let isIpOnline = await isHostUp(item.ip, item.mac);

                        // If the IP dynamuic ip is online, add the device to the active devices array
                        if (isIpOnline) {
                            item.id = ++id;
                            activeDevices.push(item);
                        }
                    } catch (error) {
                        // Log the error
                        console.error(error);
                    }

                    // Resolve the promise with the active devices array
                    if (index === array.length - 1) {
                        try {
                            activeDevices = await getStaticDevices(activeDevices);
                            resolve(activeDevices);
                        } catch (err) {
                            console.error("Cannot get static devices or something went wrong:", err);
                            resolve(err);
                        }
                    }
                });
            });

            return finishGettingDevices;
        }
    } catch (err) {
        console.error("Cannot read DNSMASQ_LEASES_FILE or something went wrong:", err);
        return activeDevices;
    }
}



module.exports = {
    isHostUp,
    getDevices,
}