const util = require('util');
const exec = util.promisify(require('child_process').exec)
const { getVpnStatus } = require('../VPN/configVPN')
const { getDDnsConfigs } = require('../DNS/ddnsConfig')


async function restartServices() {

  try {
    let error = false;
    let errorMessage = "";

    await exec('sudo systemctl restart dhcpcd');
    console.log('Done restarting dhcpcd');

    await exec('sudo systemctl restart dnsmasq');
    console.log('Done restarting dnsmasq');

    await exec('sudo systemctl restart mongod');
    console.log('Done restarting mongodb');

    await exec('sudo systemctl restart hostapd');
    console.log('Done restarting hostapd');

    await exec('sudo systemctl restart bind9');
    console.log('Done restarting bind9');

    // if DDNS is used when services restart is initiated
    if (getDDnsConfigs()['ddns_enabled'] === '1') {
      await exec('sudo systemctl restart ddclient');
      console.log('Done restarting ddclient');
    }

    // if user is connected to VPN when services restart is initiated 
    if (await getVpnStatus()['vpn_status'] === 'connected') {
      await exec('sudo systemctl restart openvpn@client');
      console.log('Done restarting openvpn@client');
    }




    console.log('Done restarting services');
    return { error: error, message: 'Services have been rebooted' };
  } catch (error) {
    console.error(error);
    return { error: true, message: error.message };
  }
}

module.exports = { restartServices };