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
const getTrafficData = require('./collectClientsUsage')

const { getDevices } = require('../Dashboard/getConnectedDevices')

async function deleteDataUsageClient(ipv4) {

    try {

        return new Promise(async resolve => {

            var cmd1 = `sudo iptables -D FORWARD  -d ${ipv4} -j ACCEPT`
            var cmd2 = `sudo iptables -D FORWARD  -s ${ipv4} -j ACCEPT`
            // Use exec to run the command
            exec(cmd1, (error, stdout, stderr) => {
                if (error) {
                    console.error(`error: ${error.message}`);
                    resolve(false);
                }
                if (stderr) {
                    console.error(`stderr: ${stderr}`);
                    resolve(false);

                }

                exec(cmd2, async (error, stdout, stderr) => {
                    if (error) {
                        console.error(`error: ${error.message}`);
                        resolve(false);

                    }
                    if (stderr) {
                        console.error(`stderr: ${stderr}`);
                        resolve(false);
                    }

                    console.log('Data Usage for inactive IP has been disabled');

                    await dataUsageUser.deleteMany({ ip: ipv4 });
                    resolve(true)
                });
            });
        })
    } catch (error) {
        resolve(false);
    }


}

async function initializeDataUsageForIP(ipv4) {
    //find if the functionality has been enabled already for the specific ip

    findIP = await dataUsageUser.find({ ip: ipv4 })
    // console.log(findIP)
    if (findIP.length > 0) {
        console.log("IP already initialized");

        let hasData = false;
        for (let i = 0; i < findIP.length; i++) {
            let item = findIP[i];
            if (item.packetsSent > 0) {
                hasData = true;
                break;
            }
            hasData = false;
        }

        if (hasData) {
            await dataUsageUser.updateMany({ ip: ipv4 }, { new: false }, { new: true });
            console.log('Change Data Usage new value for IP')

        } else if (!hasData && !findIP[0].new) {

            deleteDataUsageClient(ipv4)
            console.log('Delete Data Usage for IP')
        }
    }

    else {
        
        console.log("Insert Ip ")
        // for a specific ip create 12 entries , configuring each hour for a specific ip

        for (var i = 0; i < 12; i++) {
            createInstanceOfIpPerHour = await dataUsageUser.create({
                ip: ipv4,
                packets_sent: 0,
                packets_received: 0,
                bytes_sent: 0,
                bytes_received: 0,
                metric: {
                    packets_sent: 0,
                    packets_received: 0,
                    bytes_sent: 0,
                    bytes_received: 0
                },
                timestamp: i,
                new: true
            })
        }
    }

}



// Define the function to apply iptables rules
async function enableDataUsageForIP() {
    
    let connectedDevices = await getDevices();
    // Parse the IP addresses of connected devices
    
    var ips = [];
    for (let devices of connectedDevices) {
        
        ips.push(devices.ip)
    }
    let generalStatus = {}
    
    // Apply iptables rules for each device
    for (var i = 0; i < ips.length; i++) {

        let status = { error: false, message: '' }
        var ip = ips[i];

        //if the rule for network monitor is not applied for the ip, it appends it to the iptable 
        // if the first command fails, it executes the second, in other words, if the rule doesnt exists then
        // is added from the  API
        var cmd1 = `sudo iptables -C FORWARD  -d ${ip} -j ACCEPT || sudo iptables -I FORWARD  -d ${ip} -j ACCEPT`
        var cmd2 = `sudo iptables -C FORWARD  -s ${ip} -j ACCEPT || sudo iptables -I FORWARD  -s ${ip} -j ACCEPT`
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
            //console.log(`stdout: ${stdout}`);
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
                //console.log(`stdout: ${stdout}`);


            });
        }

        if(!status.error)
        await initializeDataUsageForIP(ip)


    }
    return generalStatus


}

async function  resetDataUsageDevicesStats(){
    try{
        ipDataUsage = await dataUsageUser.find({timestamp:0})
        //console.log(ipDataUsage)
        for (ipEntry of ipDataUsage){
            await deleteDataUsageClient(ipEntry.ip)
        }

    console.log('Data Usage for Devices has been reset')
    }catch(error){
        console.log("Something went wrong. Unable to delete Device's Data Usage")
    }
    
}

module.exports = {
    enableDataUsageForIP,
    resetDataUsageDevicesStats
}
