const util = require('util');
const exec = util.promisify(require('child_process').exec)
const { getVpnStatus } = require('../VPN/configVPN')
const { getDDnsConfigs } = require('../DNS/ddnsConfig')

async function restartServices() {

    let error = false;
    let errorMessage = "";

    exec('sudo systemctl restart dhcpcd', (err, stdout, stderr) => {
        if (err) {
            error = true;
            errorMessage += `Error restarting dhcpcd: ${err}\n`;
        }
        console.log('Done restarting dhcpcd');
    });
    exec('sudo systemctl restart dnsmasq', (err, stdout, stderr) => {
        if (err) {
            error = true;
            errorMessage += `Error restarting dnsmasq: ${err}\n`;
        }
        console.log('Done restarting dnsmasq');
    });

    exec('sudo systemctl restart mongodb', (err, stdout, stderr) => {
        if (err) {
            error = true;
            errorMessage += `Error restarting mongodb: ${err}\n`;
        }
        console.log('Done restarting mongodb');
    });
    exec('sudo systemctl restart hostapd', (err, stdout, stderr) => {
        if (err) {
            error = true;
            errorMessage += `Error restarting hostapd: ${err}\n`;
        }
        console.log('Done restarting hostapd');
    });

    exec('sudo systemctl restart bind9', (err, stdout, stderr) => {
        if (err) {
            error = true;
            errorMessage += `Error restarting bind9: ${err}\n`;
        }
        console.log('Done restarting bind9');
    });

    // if DDNS is used when services restart is initiated
    if (getDDnsConfigs()['ddns_enabled'] === '1') {
        exec('sudo systemctl restart ddclient', (err, stdout, stderr) => {
            if (err) {
                error = true;
                errorMessage += `Error restarting ddclient: ${err}\n`;
            }
            console.log('Done restarting ddclient');
        });
    }

    // if user is connected to VPN when services restart is initiated 
    if (await getVpnStatus()['vpn_status'] === 'connected') {
        exec('sudo systemctl restart openvpn@client', (err, stdout, stderr) => {
            if (err) {
                error = true;
                errorMessage += `Error restarting openvpn@client: ${err}\n`;
            }
            console.log('Done restarting openvpn@client');
        });
    }
    console.log('Done restarting services');
    return { error: error, message: errorMessage };
}


module.exports = {
    restartServices
}