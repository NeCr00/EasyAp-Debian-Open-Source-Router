const util = require('util');
const { executeCommand } = require('../../Helpers/executeCommand');
const exec = util.promisify(require('child_process').exec)

const DNSMASQ_LEASES_FILE = '/var/lib/misc/dnsmasq.leases'

function extractDeviceInfo(string_devices) {
    let devices = []
    getEachLineRegex = new RegExp('((.*?)\n)', 'g')
    lines = string_devices.split('\n')
    lines.forEach(item => {
        line = item.split(" ")
        lease_time = line[0]
        mac = line[1]
        ip = line[2]
        host = line[3] === '*' ? 'Unknown' : line[3]
        devices.push({
            lease_time: lease_time,
            mac: mac,
            ip: ip,
            host: host
        })
    })

    return devices
}


async function isHostUp(ip) {
    command = 'ping -c 1 -W 0.2 ' + ip
    const { stdout, stderr } = await exec(command);

    if (stderr) {
        //console.log('stderr:', stderr);
        return false;
    }
    else {
        //console.log('stdout:', stdout);
        return true;
    }
}

async function getDevices() {
    let active_devices = []
    let command = 'sudo cat /var/lib/misc/dnsmasq.leases'
    let stdout = ''
    if ( stdout = await executeCommand(command) ) {
        console.log(stdout)
        devices = extractDeviceInfo(stdout)
        var finishGettingDevices = new Promise((resolve, reject) => {
            id = 0
            devices.forEach(async (item,index,array) => {
                
                try {
                    // isDevice = Device.findOne({ MACAddress: item.country }).exec()
                    isIpOnline = await isHostUp("192.168.2.6") //change to item.ip to apply
                    if (isIpOnline) {
                        item.id = ++id
                        active_devices.push(item)
                    }
                }
                catch (error) {
                    //console.log(error)
                }
                if (index === array.length -1) resolve(active_devices);
            })
            
        });
    
        return  finishGettingDevices;
    }
}

module.exports = {
    isHostUp,
    getDevices,
}