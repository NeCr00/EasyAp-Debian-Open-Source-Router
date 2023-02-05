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

    if(trafficData){
      saveTrafficData(ip_address, trafficData)
      return true
    }
    else{
      console.log('Cannot save the traffic data for this address: ' + ip_address)
      return false;
    }
    

   
  }
}



// schedule the function to run every hour
setInterval(collectTrafficDataIPs, 1000 * 60 * 60);


async function saveTrafficData(ip, currentData) {

  // Find all data for the specific IP
  const records = await dataUsageUser.find({ ip: ip });


  // Shift all existing data by one hour and update in the database
  for (let i = records.length - 1; i >= 1; i--) {
    records[i].packetsSent = records[i - 1].packetsSent;
    records[i].packetsReceived = records[i - 1].packetsReceived;
    records[i].bytesSent = records[i - 1].bytesSent;
    records[i].bytesReceived = records[i - 1].bytesReceived;
    await records[i].save();
  }

  // Update the first entry with the current data
  records[0].packetsSent = data.packetsSent - records[0].packetsSent;
  records[0].packetsReceived = data.packetsReceived - records[0].packetsSent;
  records[0].bytesSent = data.bytesSent - records[0].packetsSent;
  records[0].bytesReceived = data.bytesReceived - records[0].packetsSent;
  await records[0].save();
}



async function getTrafficData(ip) {

  enabledIP = await dataUsageUser.find({ ip: ip });

  if (enabledIP) {
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
  else {
    console.log('There is no an ip address')
    return false;
  }
}