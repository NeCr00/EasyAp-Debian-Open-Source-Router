const dataUsageUser = require('../../Database/Model/DataUsageUser')


async function getClientsDataUsage() {

    clientsDataUsage = []
    // Read the dnsmasq lease file
    let leases = fs.readFileSync('/var/lib/misc/dnsmasq.leases', 'utf8');


    // Split the leases by newline
    leases = leases.split('\n');

    // Iterate through the leases
    for (let lease of leases) {
        // Split the lease by space
        let leaseData = lease.split(' ');

        // Extract the IP address
        let ip_address = leaseData[2];
        
        dataUsage = {
            'ip':ip_address,
            'packets-received':[],
            'packets-sent':[],
            'bytes-received':[],
            'bytes-sent':[]
        }

        dataUsage = await dataUsageUser.find({ip:ip_address}).sort({ timestamp: 0 });

        if(dataUsage){
            dataUsage.forEach(item =>{

                //add for every hour the amount of data usage in the arrays

                dataUsage.packets-received.push(item.packetsReceived)
                dataUsage.packets-sent.push(item.packetsSent)
                dataUsage.bytes-received.push(item.bytesReceived)
                dataUsage.bytes-sent.push(item.bytesSent)
            })

            clientsDataUsage.push(dataUsage)
        }
        else{
            console.log('This IP has no data yet')
        }
        
    }

    if(clientsDataUsage.length){

        return clientsDataUsage
    }
    else{

        console.log('Error: No data available for Data Usage')
        return null
    }
}


module.exports = {
    getClientsDataUsage
}