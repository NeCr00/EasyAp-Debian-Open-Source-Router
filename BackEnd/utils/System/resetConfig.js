const mongoose = require('mongoose');
const { execSync } = require('child_process');

const { executeCommand } = require('../../Helpers/executeCommand');
const { insertDefaultUser } = require('../../Helpers/defaultUser')
const { initializeTrafficMonitorData } = require('../Dashboard/networkTrafficMonitor')
const { DNSMASQ_CONF_FILE, DNSMASQ_LEASES_FILE, DNSMASQ_STATIC_LEASES_FILE,
    HOSTAPD_CONFIG_FILE, DDCLIENT_CONF_FILE, DDCLIENT_CONF_DEFAULT_FILE,
    DNSMASQ_CONF_DEFAULT_FILE, HOSTAPD_CONFIG_DEFAULT_FILE, DHCPCD_CONF_FILE, DHCPCD_CONF_DEFAULT_FILE } = require('../../Helpers/constants');

async function resetConfiguration() {
    let error = false;
    let message = '';
    try {
        // Get an array of all the collections in the "easyap" database
        mongoose.connection.db.listCollections().toArray(function (err, names) {
            if (err) {
                throw err;
            }
            // Loop through the array and drop each collection
            names.forEach(function (elem) {

                mongoose.connection.db.dropCollection(elem.name);
            });
        });


        // Flush all the iptables rules
        execSync('sudo iptables -F');

        // Flush all the rules from nat table
        execSync('sudo iptables -t nat -F');

        // Configure the ip forwaridng 
        execSync('sudo iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE');
        // Save the rules
        execSync('sudo netfilter-persistent save')

        // Reset the dnsmasq configuration file
        execSync(`sudo cp -f ${DNSMASQ_CONF_DEFAULT_FILE}  ${DNSMASQ_CONF_FILE}`)
        // Reset hostpad configuration file
        execSync(`sudo cp -f ${HOSTAPD_CONFIG_DEFAULT_FILE} ${HOSTAPD_CONFIG_FILE}`)
        // Reset ddclient configuration
        execSync(`sudo cp -f ${DDCLIENT_CONF_DEFAULT_FILE} ${DDCLIENT_CONF_FILE}`)

        execSync(`sudo cp -f ${DHCPCD_CONF_DEFAULT_FILE} ${DHCPCD_CONF_FILE}`)

        // Removes all zones from bind
        // execSync(`sudo rm /etc/bind/zones/*`)

        // Remove all the content from configuration files
        // Remove all device's leases from configuration file
        execSync(`sudo sed -i 's/.*//g' ${DNSMASQ_LEASES_FILE}`)
        // Remove all static ips from static leases 
        execSync(`sudo sed -i 's/.*//g' ${DNSMASQ_STATIC_LEASES_FILE}`)

        await executeCommand('sudo systemctl restart dhcpcd')
        await executeCommand('sudo systemctl restart dnsmasq')
        await executeCommand('sudo systemctl restart hostapd')

        await executeCommand('sudo systemctl restart NetworkManager')
        await executeCommand('sudo systemctl restart dhcpcd')
        await executeCommand('sudo systemctl restart dnsmasq')
        await executeCommand('sudo systemctl restart hostapd')

        await insertDefaultUser()
        await initializeTrafficMonitorData()


    } catch (err) {
        error = true;
        message = `An error occurred: ${err.message}`;
        console.log(message);
        return { error, message };
    }
    // return an object with a success property and a message property
    return { 'error': false, 'message': 'Changes applied successfully' };
}


module.exports = {
    resetConfiguration
}