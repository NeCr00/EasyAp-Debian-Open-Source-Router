const fs = require('fs');
const mongoose = require('mongoose');
const dataUsageUser = require('../../Database/Model/DataUsageUser')
const { DNSMASQ_LEASES_FILE } = require('../../Helpers/constants')
const exec = require('child_process').exec;


// Function to collect and store device traffic usage data
async function collectTrafficDataIPs() {
  let trafficData = null;
  // Read the dnsmasq lease file
  let leases = fs.readFileSync(DNSMASQ_LEASES_FILE, 'utf8');

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
    console.log(leaseData)
    // Get the device's traffic usage data from iptables
    if (leaseData.length > 1) {
      trafficData = await getTrafficData(ip_address);
    }


    if (trafficData && leaseData.length > 1) {
      console.log(ip_address, trafficData);
      await saveTrafficData(ip_address, trafficData)

    }
    else {
      console.log('Cannot save the traffic data for this address: ' + ip_address)
    }

  }

}



// schedule the function to run every hour
setInterval(collectTrafficDataIPs, 1000 * 60 * 60);


async function saveTrafficData(ip, data) {

  // Find all data for the specific IP
  let records = await dataUsageUser.find({ ip: ip });

  if (records.length == 0) {
    return
  }
  console.log(records);

  // Shift all existing data by one hour and update in the database
  for (let i = records.length - 1; i >= 1; i--) {
    records[i].packetsSent = records[i - 1].packetsSent;
    records[i].packetsReceived = records[i - 1].packetsReceived;
    records[i].bytesSent = records[i - 1].bytesSent;
    records[i].bytesReceived = records[i - 1].bytesReceived;
    await records[i].save();
  }

  // Update the first entry with the current data
  records[0].packetsSent = Math.abs(Number(data.packetsSent) - records[0].lastMetric.packetsSent);
  records[0].packetsReceived = Math.abs(Number(data.packetsReceived) - records[0].lastMetric.packetsReceived);
  records[0].bytesSent = Math.abs(Number(data.bytesSent) - records[0].lastMetric.bytesSent);
  records[0].bytesReceived = Math.abs(Number(data.bytesReceived) - records[0].lastMetric.bytesReceived);

  records[0].lastMetric.packetsSent = Math.abs(Number(data.packetsSent));
  records[0].lastMetric.packetsReceived = Math.abs(Number(data.packetsReceived));
  records[0].lastMetric.bytesSent = Math.abs(Number(data.bytesSent));
  records[0].lastMetric.bytesReceived = Math.abs(Number(data.bytesReceived));

  console.log('records', records)
  console.log('data', data)
  await records[0].save();
}



async function getTrafficData(ip) {

  enabledIP = await dataUsageUser.find({ ip: ip });

  if (enabledIP) {
    return new Promise((resolve, reject) => {
      exec(`sudo iptables -L -v -n -x | grep ${ip}`, (err, stdout, stderr) => {
        if (err) {
          reject(err);
        } else {

          const lines = stdout.trim().split('\n');
          const data = { packetsSent: 0, bytesSent: 0, packetsReceived: 0, bytesReceived: 0 };

          for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim().split(/\s+/);
            if (i == 0) {
              data.packetsSent = line[0]
              data.bytesSent = line[1]
            }
            else if (i == 1) {
              data.packetsReceived = line[0]
              data.bytesReceived = line[1]
            }
          }
          console.log(data)
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

module.exports = {
  collectTrafficDataIPs
}