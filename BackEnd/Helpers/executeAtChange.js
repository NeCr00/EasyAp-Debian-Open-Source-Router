//This function is triggered when a change is made to the corresponding file
// This function is called when a device is connected to the access point
// Checks the /var/lib/misc/dnsmasq.leases for changes and adds a device to the data usage

const fs = require('fs');

function executeFunctionAtChange() {
    fs.watch('/Users/necro/Documents/Raspberry-Pi-Wireless-AP-Software/BackEnd/utils/Settings/config.txt', (eventType, filename) => {
        if (eventType === 'change') {
            console.log(`config.txt has been changed`);
            // trigger your desired action here
            //Add the function that initializes the data usage for the device
        }
    });
}

module.exports = { executeFunctionAtChange };