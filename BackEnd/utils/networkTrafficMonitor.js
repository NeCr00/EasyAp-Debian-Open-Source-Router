const util = require('util');
const dataUsage = require('../Database/Model/DataUsage');
const exec = util.promisify(require('child_process').exec)

async function getTrafficData() {
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

function test(data){
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
    traffic_now = await getTrafficData()

    data = await test(data)
    data[0].packetsSent = traffic_now[1].tx_packets
    data[0].packetsReceived = traffic_now[0].rx_packets

    // await dataUsage.deleteMany()
    // created = await dataUsage.create(data)
    console.log(data)
}


async function initializeModel() {
    //saveTrafficData()
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
    getTrafficData, saveTrafficData, initializeModel
}