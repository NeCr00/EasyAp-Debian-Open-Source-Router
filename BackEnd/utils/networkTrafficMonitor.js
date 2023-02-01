const util = require('util');
const dataUsage = require('../Database/Model/DataUsage');
const exec = util.promisify(require('child_process').exec)


async function getTrafficStats() {
    const trafficStats = await dataUsage.find({})
    traffic_data = [
        {
            "type":"Packets Sent",
            "data":[]
        },{
            "type":"Packets Received",
            "data":[]
        }
    ]
    trafficStats.forEach(item => {
        traffic_data[0].data.push(item.packetsSent)
        traffic_data[1].data.push(item.packetsReceived)
    })
    return traffic_data
    //console.log(traffic_data)
}


async function getCurrentTrafficData() {
    let network_stats = []
    command = " ifconfig wlo1 | grep -E 'RX packets|TX packets'"
    // run the `ls` command using exec
    const { stdout, stderr } = await exec(command);

    if (stderr) {
        console.log('stderr:', stderr);
        return false;
    }
    else {
        console.log('stdout:', stdout);
        getEachLineRegex = new RegExp('((.*?)\n)', 'g')
        getNumFromLine = new RegExp('[0-9]+', 'g')
        get_lines = stdout.match(getEachLineRegex)

        get_lines.forEach((line, index) => {
            number = line.match(getNumFromLine)

            if (index == 0) {
                // received packets and bytes
                network_stats.push({
                    "rx_packets": number[0],
                    "rx_bytes": number[1]

                })
            }
            else {
                network_stats.push({
                    "tx_packets": number[0],
                    "tx_bytes": number[1]

                })
            } //get send packets

        })
        console.log(network_stats)
    }

    return network_stats
}

function transferDataBetweenHours(data) {
    for (let i = 10; i > -1; i--) {
        data[i + 1].packetsSent = data[i].packetsSent
        data[i + 1].packetsReceived = data[i].packetsReceived
    }
    return data
}

async function saveTrafficData() {
    //get traffic data from collection
    getTrafficStats = await dataUsage.find().sort({ hour: 0 })
    data = getTrafficStats
    //get current time traffic ammount



    traffic_now = await getCurrentTrafficData()

    data = await transferDataBetweenHours(data) // transfers the data of i to i +1, passing the
    //data to the next hour ex. 9:00 to 10:00

    //save the monitor data to 0:00 
    data[0].packetsSent = traffic_now[1].tx_packets
    data[0].packetsReceived = traffic_now[0].rx_packets

    await dataUsage.deleteMany() //deletes all the previous data
    insert = await dataUsage.insertMany(data) // inserts the new data
    console.log(data[0], data[1], data[2])
}


async function initializeTrafficMonitorData() {
    
    dataUsage.count(async function (err, count) {
        if (!err && count === 0) { //if is empty initialize the data usage entries
            for (var hour = 0; hour < 12; hour++) {


                creation = await dataUsage.create({
                    packetsSent: 0,
                    packetsReceived: 0,
                    hour: hour
                })
            }
        }
        else {
            console.log("Data Usage for traffic monitor has been already initialized")

        }
    });

}


module.exports = {

    getCurrentTrafficData, saveTrafficData, initializeTrafficMonitorData,getTrafficStats
}