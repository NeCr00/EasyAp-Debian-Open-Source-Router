const exec = require('child_process').exec;

function restartServices() {
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
    return {error: error, message: errorMessage};
}


module.exports = {
    restartServices
}