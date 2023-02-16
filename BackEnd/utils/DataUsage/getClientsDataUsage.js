const dataUsageUser = require('../../Database/Model/DataUsageUser')
const { DNSMASQ_LEASES_FILE } = require('../../Helpers/constants')

const fs = require('fs')

async function getClientsDataUsage() {

    let clientsDataUsage = []
    // Read the dnsmasq lease file
    let leases = fs.readFileSync(DNSMASQ_LEASES_FILE, 'utf8');


    // Split the leases by newline
    leases = leases.split('\n');

    // Iterate through the leases
    for (let lease of leases) {
        // Split the lease by space
        let leaseData = lease.split(' ');

        // Extract the IP address
        let ip_address = leaseData[2];

        dataUsageIP = {
            'ip': ip_address,
            'packets-received': [],
            'packets-sent': [],
            'bytes-received': [],
            'bytes-sent': [],
            'total-bytes-sent': [],
            'total-packets-sent': [],
            'total-bytes-received': [],
            'total-packets-received': []
        }

        dataUsage = await dataUsageUser.find({ ip: ip_address }).sort({ timestamp: 0 });
        let isActive = false;

        if (dataUsage) {
            dataUsage.forEach((item, index) => {

                //add for every hour the amount of data usage in the arrays

                if (item.packetsSent > 0) {
                    isActive = true;
                }

                dataUsageIP['packets-received'].push(item.packetsReceived)
                dataUsageIP['packets-sent'].push(item.packetsSent)
                dataUsageIP['bytes-received'].push(item.bytesReceived)
                dataUsageIP['bytes-sent'].push(item.bytesSent)

                if (index === 0) {
                    mbSent = Number(item.bytesSent/(1024^2)).toFixed(0)
                    mbReceived = Number(item.bytesReceived/(1024^2)).toFixed(0)
                    dataUsageIP['total-bytes-sent'].push(mbSent)
                    dataUsageIP['total-packets-sent'].push(item.lastMetric.packetsSent)
                    dataUsageIP['total-bytes-received'].push(mbReceived)
                    dataUsageIP['total-packets-received'].push(item.lastMetric.packetsReceived)
                }

            })

            if (isActive)
                clientsDataUsage.push(dataUsageIP)
        }
        else {
            console.log('This IP has no data yet')
        }

    }

    if (clientsDataUsage.length) {

        return clientsDataUsage
    }
    else {

        console.log('Error: No data available for Data Usage')
        return null
    }
}


module.exports = {
    getClientsDataUsage
}