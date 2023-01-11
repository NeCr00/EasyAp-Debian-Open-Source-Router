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
    console.log(devices)
    return devices
}


async function isHostUp(ip) {
    command = 'ping -c 1 -W 1 ' + ip
    // run the `ls` command using exec
    const { stdout, stderr } = await exec('command');
    console.log('stdout:', stdout);
    console.log('stderr:', stderr);
    
}

 async function getDevices() {
    let active_devices =[]
    command = 'cat /var/lib/misc/dnsmasq.leases'
    exec(command, (err, output) => {
        // once the command has completed, the callback function is called
        if (err) {
            // log and return if we encounter an error
            //console.log("error:", err)
            return
        }
        else{
            devices = extractDeviceInfo(output)
        }
        // log the output received from the command
        //console.log("Output: \n", output)
        
    })

      test = isHostUp('192.168.4.8')
      console.log(test)
}



module.exports = {
    isHostUp,
    getDevices
}