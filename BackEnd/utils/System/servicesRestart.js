const exec = require('child_process').exec;
const { getVpnStatus } = require('../VPN/configVPN')

async function restartServices() {
    let error = false;
    let errorMessage = "";

    exec('sudo systemctl restart dhcpcd', (err, stdout, stderr) => {
        if (err) {
            error = true;
            errorMessage += `Error restarting dhcpcd: ${err}\n`;
        }
    });
    exec('sudo systemctl restart dnsmasq', (err, stdout, stderr) => {
        if (err) {
            error = true;
            errorMessage += `Error restarting dnsmasq: ${err}\n`;
        }
    });
    exec('sudo systemctl restart iptables', (err, stdout, stderr) => {
        if (err) {
            error = true;
            errorMessage += `Error restarting iptables: ${err}\n`;
        }
    });
    exec('sudo systemctl restart mongodb', (err, stdout, stderr) => {
        if (err) {
            error = true;
            errorMessage += `Error restarting mongodb: ${err}\n`;
        }
    });
    exec('sudo systemctl restart hostapd', (err, stdout, stderr) => {
        if (err) {
            error = true;
            errorMessage += `Error restarting hostapd: ${err}\n`;
        }
    });
    exec('sudo systemctl restart ddclient', (err, stdout, stderr) => {
        if (err) {
            error = true;
            errorMessage += `Error restarting ddclient: ${err}\n`;
        }
    });
    
    // if user is connected to VPN when services restart is initiated 
    if (await getVpnStatus()['vpn_status'] === 'connected') { 
        exec('sudo systemctl restart openvpn@client', (err, stdout, stderr) => {
            if (err) {
                error = true;
                errorMessage += `Error restarting openvpn@client: ${err}\n`;
            }
        });
    }
    return {error: error, message: errorMessage};
}


module.exports = {
    restartServices
}