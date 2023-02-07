const fs = require('fs');
const path = require('path');
const { DNSMASQ_CONF_FILE, HOSTAPD_CONFIG_FILE } = require('../../Helpers/constants');
const  {restartService}  = ('../../Helpers/restartServices');


// TODO: At change should restart service and return status 

function getPassAndSSID() {
    // Read the configuration file
    let config = fs.readFileSync(HOSTAPD_CONFIG_FILE, 'utf8');

    // Extract the values of the "ssid" and "wpa_passphrase" parameters
    let ssid = config.match(/ssid=(\S+)/);
    let wpa_passphrase = config.match(/wpa_passphrase=(\S+)/);
    if (ssid && wpa_passphrase) {
        ssid = ssid[1];
        wpa_passphrase = wpa_passphrase[1];
    } else {
        return { error: "one or both parameters not found" }
    }
    // Return the values as an object
    return { ssid, wpa_passphrase };
}



function updatePassAndSSID(ssid, wpa_passphrase) {

    if (wpa_passphrase.length < 6) {
        return { error: true, message: "Password must be at least 6 characters" }
    }
    currentConfig = getPassAndSSID()
    if (currentConfig.ssid === ssid && currentConfig.wpa_passphrase === wpa_passphrase) {
        return { error: true, message: "SSID and password already use this values" }
    }
    // Read the configuration file
    let config = fs.readFileSync(HOSTAPD_CONFIG_FILE, 'utf8');

    // Replace the old values with the new ones
    config = config.replace(/ssid=\S+/g, `ssid=${ssid}`);
    config = config.replace(/wpa_passphrase=\S+/g, `wpa_passphrase=${wpa_passphrase}`);

    // Write the updated content back to the file
    fs.writeFileSync(HOSTAPD_CONFIG_FILE, config, 'utf8');
    console.log(config);
    return { error: false, message: "Changes applied successfully" }
}


function addMACAddress(mac_add) {

    mac_add.forEach(mac => {

        // Read the current contents of the file
        let config = fs.readFileSync(DNSMASQ_CONF_FILE, 'utf8');
        // Append the new MAC address to the end of the file
        config += `\ndhcp-mac=set:blocked,${mac}`;
        // Write the updated configuration back to the file
        fs.writeFileSync(DNSMASQ_CONF_FILE, config);
    })

    //restartService('dnsmasq');
    console.log(`MAC address ${mac_add} added to configuration file and DHCP server restarted.`);
    
}

function removeMACAddress(mac) {

    // Read the current contents of the file
    let config = fs.readFileSync(DNSMASQ_CONF_FILE, 'utf8');
    // Remove the MAC address from the configuration
    config = config.replace(`\ndhcp-mac=set:blocked,${mac}`, "");
    // Write the updated configuration back to the file
    fs.writeFileSync(DNSMASQ_CONF_FILE, config);
    // Restart the DHCP server
    //restartService('dnsmasq');
    console.log(`MAC address ${mac} removed from configuration file and DHCP server restarted.`);
}


function getBlockedMACAddresses() {

    // Read the current contents of the file
    let config = fs.readFileSync(DNSMASQ_CONF_FILE, 'utf8');
    // Create a regular expression to match the blocked MAC addresses
    const macRegex = /dhcp-mac=set:blocked,([\w:]+)/g;
    // Use the regular expression to find all blocked MAC addresses in the configuration
    let match;
    let blockedMACs = []
    while ((match = macRegex.exec(config)) !== null) {
        blockedMACs.push({
            "mac": match[1]
        })
    }
    return blockedMACs;
}



module.exports = {
    updatePassAndSSID, getPassAndSSID, getBlockedMACAddresses, addMACAddress,removeMACAddress
}