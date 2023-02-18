const dataUsageUser = require('../../Database/Model/DataUsageUser')
const { DNSMASQ_LEASES_FILE } = require('../../Helpers/constants')
const { getDevices } = require('../Dashboard/getConnectedDevices')


async function getClientsDataUsage() {
    let clientsDataUsage = []
    let connectedDevices = await getDevices();

    // Iterate through the ips
    for (let device of connectedDevices) {
        // Split the lease by space
        ip_address = device.ip

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
                dataUsageIP['packets-received'].push(item.packetsReceived)
                dataUsageIP['packets-sent'].push(item.packetsSent)
                dataUsageIP['bytes-received'].push(parseFloat(item.bytesReceived)/(1024**2))
                dataUsageIP['bytes-sent'].push(parseFloat(item.bytesSent/(1024**2)))

                if (index === 0) {
                    mbSent = (parseFloat(item.lastMetric.bytesSent)/(2**20)).toFixed(2)
                    mbReceived = (parseFloat(item.lastMetric.bytesReceived)/(2**20)).toFixed(2)
                    dataUsageIP['total-bytes-sent'].push(mbSent)
                    dataUsageIP['total-packets-sent'].push(item.lastMetric.packetsSent)
                    dataUsageIP['total-bytes-received'].push(mbReceived)
                    dataUsageIP['total-packets-received'].push(item.lastMetric.packetsReceived)
                }

            })

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
        return []
    }
}


module.exports = {
    getClientsDataUsage
}