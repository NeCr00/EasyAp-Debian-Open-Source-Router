const util = require('util');
const exec = util.promisify(require('child_process').exec)

function extractDeviceInfo(string_devices) {
    let devices = []
    getEachLineRegex = new RegExp('((.*?)\n)', 'g')
    get_lines = string_devices.match(getEachLineRegex)
    get_lines.forEach(item => {
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
    // run the `ls` command using exec
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
    let command = 'cat /var/lib/misc/dnsmasq.leases'
    const { stdout, stderr } = await exec(command);

    if (stderr) {
        //console.log('stderr:', stderr);
        return;
    }
    else {
        console.log(stdout)
        devices = extractDeviceInfo(stdout)
        var finishGettingDevices = new Promise((resolve, reject) => {
            id = 0
            devices.forEach(async (item,index,array) => {
                
                try {
                    // isDevice = Device.findOne({ MACAddress: item.country }).exec()
                    isIpOnline = await isHostUp("192.168.2.5") //change to item.ip to apply
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

function extractDHCPStaticInfo(string_devices) {
    let dhcpBoundPairs = []
    getEachLineRegex = new RegExp('((.*?)\n)', 'g')
    get_lines = string_devices.match(getEachLineRegex)
    get_lines.forEach(item => {
        dhcpPair = item.split("=")[1]
        dhcpPair = dhcpPair.split(",")
        mac = line[0]
        ip = line[1]
        dhcpBoundPairs.push({
            mac: mac,
            ip: ip,
        })
    })

    return dhcpBoundPairs
}

async function getStaticIPs(){
    let staticIPAddresses = []
    let command = 'cat /etc/dnsmasq.d/static_leases'
    const { stdout, stderr } = await exec(command);

    if (stderr) {
        //console.log('stderr:', stderr);
        return;
    }
    else {
        console.log(stdout)
        
        dhcpBoundPairs = extractDHCPStaticInfo(stdout)
        var finishGettingStaticIPs = new Promise((resolve, reject) => {
            id = 0
            devices.forEach(async (item,index,array) => {
                item.id = ++id
                staticIPAddresses.push(item)
                if (index === array.length -1) resolve(staticIPAddresses);
            })
            
        });
        return  finishGettingStaticIPs;
    }
}

module.exports = {
    isHostUp,
    getDevices,
    getStaticIPs,
}