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


async function isHostUp(ipAddress, mac) {
    return new Promise((resolve, reject) => {

        exec("sudo hostapd_cli -i wlan0 all_sta | grep -oE '([[:xdigit:]]{2}:){5}[[:xdigit:]]{2}' | sort -u", (error, stdout) => {

            let lines = stdout.split('\n');
            let found = false;
            let active = false;
            for (let line of lines) {
                if (line.match(mac) && mac !== '' && mac) {
                    found = true;
                    break;
                }
            }

            if (found) {
                console.log('found')
                resolve(true);
            } else {
                resolve(false);
            }

        })
    });
}

//get Static Ips

async function getStaticDevices(activeDevices) {
    return new Promise((resolve, reject) => {
      // Get a list of MAC addresses from hostapd_cli
      exec("sudo hostapd_cli -i wlan0 all_sta | grep -oE '([[:xdigit:]]{2}:){5}[[:xdigit:]]{2}' | sort -u", (error, stdout) => {
        let macList = stdout.trim().split('\n');
        let devices = [];
  
        // Get the ARP table for the wlan0 interface
        exec("sudo arp -a -i wlan0", (error, stdout) => {
          const arpTable = stdout.trim().split('\n');
          for (let arpEntry of arpTable) {
            
            let fields = arpEntry.trim().split(/\s+/);

            const ipAddressRegex = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;
            let match = arpEntry.match(ipAddressRegex);

            let ip = match[0]
            let mac = fields[3]; // Use the fourth field for MAC address (the format of the arp output may differ)
            
            // Check if the MAC address is in the macList
            if (macList.includes(mac)) {
              let existingDevice = activeDevices.find(device => device.mac === mac);
              if (existingDevice) {
                // If an existing device is found with the same MAC address, update its IP address
                console.log("Found existing device");
                existingDevice.ip = ip;
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
          resolve(activeDevices);
        });
      });
    });
  }
  


async function getDevices() {
    let activeDevices = [];
    let filePath = DNSMASQ_LEASES_FILE

    let fileContent = await readFileSync(filePath, 'utf-8')

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
                    activeDevices = await getStaticDevices(activeDevices)
                    resolve(activeDevices);
                }
            });


        });

        return finishGettingDevices;
    }
}



module.exports = {
    isHostUp,
    getDevices,
}