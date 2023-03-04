const util = require('util');
const exec = util.promisify(require('child_process').exec);

async function disconnectAllDevices() {
  try {
    // Stop dnsmasq and hostapd services
    await exec('sudo systemctl stop dnsmasq');
    await exec('sudo systemctl stop hostapd');

    // Wait for 1 second
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Start dnsmasq and hostapd services
    await exec('sudo systemctl start dnsmasq');
    await exec('sudo systemctl start hostapd');

    console.log('All devices disconnected.');
  } catch (error) {
    console.error(`Error disconnecting all devices: ${error}`);
  }
}


module.exports ={
    disconnectAllDevices
}