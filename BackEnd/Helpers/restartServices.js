const { execSync } = require('child_process');

function restartService(service) {
    let success = true;
    let message = '';
    if (service === 'all') {
        try {
            execSync('systemctl restart dhcpcd');
            execSync('systemctl restart hostapd');
            execSync('systemctl restart dnsmasq');
            execSync('systemctl restart mongodb');
        } catch (err) {
            success = false;
            message = `Failed to restart services`;
        }
    } else if (service === 'dhcpcd' || service === 'hostapd' || service === 'dnsmasq' || service === 'mongodb') {
        try {
            execSync(`systemctl restart ${service}`);
        } catch (err) {
            success = false;
            message = `Failed to restart ${service}: ${err.message}`;
        }
    } else {
        success = false;
        message = 'Invalid service name';
    }
    return { success, message };
}

module.exports ={
    restartService
}