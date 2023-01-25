const fs = require('fs');

function getPassAndSSID() {
    // Read the configuration file
    let config = fs.readFileSync(__dirname+'/config.txt', 'utf8');
    
    // Extract the values of the "ssid" and "wpa_passphrase" parameters
    let ssid = config.match(/ssid=(\S+)/);
    let wpa_passphrase = config.match(/wpa_passphrase=(\S+)/);
    if(ssid && wpa_passphrase){
      ssid=ssid[1];
      wpa_passphrase=wpa_passphrase[1];
    }else{
      return {error:"one or both parameters not found"}
    }
    // Return the values as an object
    return { ssid, wpa_passphrase };
  }



function updatePassAndSSID(ssid, wpa_passphrase) {

    if (wpa_passphrase.length<6){
        return {error:true,message:"Password must be at least 6 characters"}
    }
    currentConfig = getPassAndSSID()
  if(currentConfig.ssid === ssid && currentConfig.wpa_passphrase === wpa_passphrase){
    return {error:true,message:"SSID and password already use this values"}
  }
  // Read the configuration file
  let config = fs.readFileSync('config.txt', 'utf8');
  
  // Replace the old values with the new ones
  config = config.replace(/ssid=\S+/g, `ssid=${ssid}`);
  config = config.replace(/wpa_passphrase=\S+/g, `wpa_passphrase=${wpa_passphrase}`);
  
  // Write the updated content back to the file
  fs.writeFileSync('config.txt', config, 'utf8');

    return {error:false,message:"Changes applied successfully"}
}



function addMACAddress(mac) {
    // Configuration file path
    const configFile = '/etc/dnsmasq.conf';

    // Read the current contents of the file
    let config = fs.readFileSync(configFile, 'utf8');
    // Append the new MAC address to the end of the file
    config += `\ndhcp-mac=set:allowed,${mac}`;
    // Write the updated configuration back to the file
    fs.writeFileSync(configFile, config);
    // Restart the DHCP server
    //require('child_process').execSync('service dnsmasq restart');
    console.log(`MAC address ${mac} added to configuration file and DHCP server restarted.`);
}

function removeMACAddress(mac) {
    // Configuration file path
    const configFile = '/etc/dnsmasq.conf';
    // Read the current contents of the file
    let config = fs.readFileSync(configFile, 'utf8');
    // Remove the MAC address from the configuration
    config = config.replace(`\ndhcp-mac=set:allowed,${mac}`, "");
    // Write the updated configuration back to the file
    fs.writeFileSync(configFile, config);
    // Restart the DHCP server
    //require('child_process').execSync('service dnsmasq restart');
    console.log(`MAC address ${mac} removed from configuration file and DHCP server restarted.`);
}


function getBlockedMACAddresses() {
    // Configuration file path
    const configFile = '/etc/dnsmasq.conf';
    // Read the current contents of the file
    let config = fs.readFileSync(configFile, 'utf8');
    // Create a regular expression to match the blocked MAC addresses
    const macRegex = /dhcp-mac=set:blocked,([\w:]+)/g;
    // Use the regular expression to find all blocked MAC addresses in the configuration
    let match;
    let blockedMACs = []
    while ((match = macRegex.exec(config)) !== null) {
        blockedMACs.push(match[1])
    }
    return blockedMACs;
}



module.exports = {
    updatePassAndSSID,getPassAndSSID
}