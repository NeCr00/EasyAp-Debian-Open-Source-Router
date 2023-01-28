const fs = require('fs');
const mongoose = require('mongoose');
const dataUsageUser = require('../../Database/Model/DataUsageUser')


// Function to collect and store device traffic usage data
function collectTrafficDataIPs() {
  // Read the dnsmasq lease file
  let leases = fs.readFileSync('/var/lib/misc/dnsmasq.leases', 'utf8');
  
  // Split the leases by newline
  leases = leases.split('\n');
  
  // Iterate through the leases
  for (let lease of leases) {
    // Split the lease by space
    let leaseData = lease.split(' ');
    
    // Extract the IP address, hostname, and timestamp
    let ip_address = leaseData[2];
    let hostname = leaseData[3];
    //let timestamp = new Date(leaseData[0] * 1000);
    
    // Get the device's traffic usage data from iptables
    let trafficData = getTrafficData(ip_address);
    

    // Create a new DataUsageUser document
    let dataUsage = new DataUsageUser({
      ip_address: ip_address,
      packets_sent: trafficData.packets_sent,
      packets_received: trafficData.packets_received,
      bytes_sent: trafficData.bytes_sent,
      bytes_received: trafficData.bytes_received,
      timestamp: timestamp
    });
    
    // Save the DataUsageUser document to the database
    dataUsage.save(function(err) {
      if (err) {
        console.log(err);
      } else {
        console.log(`Data usage for ${ip_address} saved to the database.`);
      }
    });
  }
}



// schedule the function to run every hour
setInterval(collectTrafficDataIPs, 1000*60*60);






  async function getTrafficData(ip) {
    return new Promise((resolve, reject) => {
        exec(`iptables -L -v -n -x | grep ${ip}`, (err, stdout, stderr) => {
            if (err) {
                reject(err);
            } else {
                let lines = stdout.split('\n');
                let data = {};
                for (let i = 0; i < lines.length; i++) {
                    let line = lines[i].trim().split(/\s+/);
                    if (line[0] === '0') {
                        data.packetsSent = line[1];
                        data.bytesSent = line[2];
                    } else if (line[0] === '1') {
                        data.packetsReceived = line[1];
                        data.bytesReceived = line[2];
                    }
                }
                resolve(data);
            }
        });
    });
}