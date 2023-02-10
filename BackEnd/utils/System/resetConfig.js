const mongoose = require('mongoose');
const { execSync } = require('child_process');
const User = require('../../Database/Model/User');
const { DNSMASQ_CONF_FILE, DNSMASQ_LEASES_FILE, DNSMASQ_STATIC_LEASES_FILE, 
    HOSTS_FILE, HOSTAPD_CONFIG_FILE, DDCLIENT_CONF_FILE,DDCLIENT_CONF_DEFAULT_FILE,
    DNSMASQ_CONF_DEFAULT_FILE,HOSTAPD_CONFIG_DEFAULT_FILE } = require('../../Helpers/constants');

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
                if (elem.name !== 'users')
                    mongoose.connection.db.dropCollection(elem.name);
            });
        });

        //Add the default user
        await User.create({ username: 'admin', password: 'admin' })

        // Flush all the iptables rules
        execSync('sudo iptables -F');

        // Flush all the rules from nat table
        execSync('sudo iptables -t nat -F');

        // Configure the ip forwaridng 
        execSync('sudo iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE');
        // Save the rules
        execSync('sudo netfilter-persistent save')

        // Reset the dnsmasq configuration file
        execSync(`sudo cp  -f ${DNSMASQ_CONF_DEFAULT_FILE}  ${DNSMASQ_CONF_FILE}`)
        // Reset hostpad configuration file
        execSync(`sudo cp -f ${HOSTAPD_CONFIG_DEFAULT_FILE} ${HOSTAPD_CONFIG_FILE}`)
        // Reset ddclient configuration
        execSync(`sudo cp -f ${DDCLIENT_CONF_DEFAULT_FILE} ${DDCLIENT_CONF_FILE}`)

        // Removes from hosts file everything related to easyAP metadata
        execSync(`sudo sed -i '/#EasyAP config/d' ${HOSTS_FILE}`)

        // Remove all the content from configuration files
        // Remove all device's leases from configuration file
        execSync(`sudo sed -i 's/.*//g' ${DNSMASQ_LEASES_FILE}`)
        // Remove all static ips from static leases 
        execSync(`sudo sed -i 's/.*//g' ${DNSMASQ_STATIC_LEASES_FILE}`)

    } catch (err) {
        error = true;
        message = `An error occurred: ${err.message}`;
    }
    // return an object with a success property and a message property
    return { success, message };
}


module.exports = {
    resetConfiguration
}