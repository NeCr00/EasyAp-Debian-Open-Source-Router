const util = require('util');
const exec = util.promisify(require('child_process').exec)

function extractDeviceInfo(string_devices) {
    let devices = []
    getEachLineRegex = new RegExp('((.*?)\n)', 'g')
    get_lines = string_devices.match(getEachLineRegex)
    get_lines.forEach(item => {
        line = item.split(" ")
        mac = line[1]
        ip = line[2]
        host = line[3] === '*' ? 'Unknown' : line[3]
        devices.push({
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
    command = 'cat /var/lib/misc/dnsmasq.leases'
    const { stdout, stderr } = await exec(command);

    if (stderr) {
        //console.log('stderr:', stderr);
        return;
    }
    else {
        //console.log('stdout:', stdout);
        devices = extractDeviceInfo(stdout)

            var finishGettingDevices = new Promise((resolve, reject) => {
                id = 0
                devices.forEach(async (item,index,array) => {
                    
                    try {
                        isIpOnline = await isHostUp("192.168.2.6")
                        
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
    getDevices
}