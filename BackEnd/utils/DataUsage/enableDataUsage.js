/*
This function will apply iptables rules for each IP address that is connected to the access point. The function 
starts by reading the DHCP leases file, which is typically located at /var/lib/misc/dnsmasq.leases. This file 
contains information about the IP addresses of devices that have been assigned IP addresses by the DHCP server.

The function then splits the contents of the DHCP leases file by newline characters to get an array of lines. 
It then iterates through each line, splitting it by spaces and extracting the 3rd element, which is the IP
address of the connected device.

The function then uses a for loop to iterate through the IP addresses and apply the iptables rules 
for each device. The iptables -C command is used to check if the rule is already exist or 
not, if the rule exist it will not apply the rule, but if it does not exist, 
the iptables -I command is used to insert the rule in the FORWARD chain
*/


const fs = require('fs');
const exec = require('child_process').exec;
const dataUsageUser = require('../../Database/Model/DataUsageUser')
const { DNSMASQ_LEASES_FILE } = require('../../Helpers/constants')

function initializeDataUsageForIP(ipv4) {
    //find if the functionality has been enabled already for the specific ip
    findIP = dataUsageUser.findOne({ ip: ipv4 })
    if (findIP) {
        console.log("Ip already initialized")
        
    }

    else {
        // for a specific ip create 12 entries , configuring each hour for a specific ip
        for (var i = 0; i < 12; i++) {
            createInstanceOfIpPerHour = dataUsageUser.create({
                ip: ipv4,
                packets_sent: 0,
                packets_received: 0,
                bytes_sent: 0,
                bytes_received: 0,
                timestamp: i
            })
        }
    }
    return
}



// Define the function to apply iptables rules
function enableDataUsageForIP() {
    // Read the DHCP leases file
    fs.readFile(DNSMASQ_LEASES_FILE, 'utf8', function (err, data) {
        if (err) {
            console.error(err);
            return;
        }

        // Parse the IP addresses of connected devices
        var lines = data.split("\n");
        var ips = [];
        for (var i = 0; i < lines.length; i++) {
            var parts = lines[i].split(" "); //split every line's data to an array
            if (parts.length >= 3) {
                ips.push(parts[2]); //get the ip from each line
            }
        }
        let generalStatus={}

        // Apply iptables rules for each device
        for (var i = 0; i < ips.length; i++) {

            let status = { error: false, message: '' }
            var ip = ips[i];

            //if the rule for network monitor is not applied for the ip, it appends it to the iptable 
            // if the first command fails, it executes the second, in other words, if the rule doesnt exists then
            // is added from the  API
            var cmd1 = `iptables -C FORWARD  -d ${ip} -j ACCEPT || iptables -I FORWARD  -d ${ip} -j ACCEPT`
            var cmd2 = `iptables -C FORWARD  -s ${ip} -j ACCEPT || iptables -I FORWARD  -s ${ip} -j ACCEPT`
            // Use exec to run the command
            exec(cmd1, (error, stdout, stderr) => {
                if (error) {
                    console.error(`error: ${error.message}`);
                    status.error = true;
                    status.message = 'Cannot enable data usage for the ip'
                    return;
                }
                if (stderr) {
                    console.error(`stderr: ${stderr}`);
                    status.error = true;
                    status.message = 'Cannot enable data usage for the ip'
                    return;
                }
                console.log(`stdout: ${stdout}`);
            });

            if (!status.error) {
                // Use exec to run the command
                exec(cmd2, (error, stdout, stderr) => {
                    if (error) {
                        console.error(`error: ${error.message}`);
                        status.error = true;
                        status.message = 'Cannot enable data usage for the ip'
                        return;
                    }
                    if (stderr) {
                        console.error(`stderr: ${stderr}`);
                        status.error = true;
                        status.message = 'Cannot enable data usage for the ip'
                        return;
                    }
                    console.log(`stdout: ${stdout}`);
                });
            }
            if (status.error){
                generalStatus = status
                break;
            }
            else{
                initializeDataUsageForIP(ip)
            }
                 
        }
        return generalStatus

    });
}

module.exports = {

}