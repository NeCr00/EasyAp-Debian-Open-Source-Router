function extractDHCPRangeInfo(string_configs) {
    getEachLineRegex = new RegExp('.*dhcp-range((.*?)\n)', 'g')
    config_line = string_configs.match(getEachLineRegex)
    dhcpRangeValues = config_line.split("=")[1]
    dhcpRangeValues = dhcpRangeValues.split(",")
    dhcpRangeInfo = {
        "dhcp_enable": config_line[0] === '#' ? '1': '0',
        "start_ip": dhcpRangeValues[0],
        "end_ip":  dhcpRangeValues[1],
        "mask": dhcpRangeValues[2],
        "time": dhcpRangeValues[3],
        "lease_isEnabled": dhcpRangeValues[3] === '24h' ? true : false,
    }
    
    return dhcpRangeInfo
}

async function getDHCPRangeInfo(){
    let command = 'cat /etc/dnsmasq.conf' //TODO: needs sudo
    const { stdout, stderr } = await exec('sudo '+ command);

    if (stderr) {
        //console.log('stderr:', stderr);
        return;
    }
    else {
        return extractDHCPRangeInfo(stdout)
    }
}

function extractDHCPStaticInfo(string_ips) {
    let dhcpBoundPairs = []
    getEachLineRegex = new RegExp('((.*?)\n)', 'g')
    get_lines = string_ips.match(getEachLineRegex)
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
    let command = 'cat /etc/dnsmasq.d/static_leases' //TODO: needs sudo
    const { stdout, stderr } = await exec('sudo' + command);
    if (stderr) {
        //console.log('stderr:', stderr);
        return;
    }
    else {      
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
    getDHCPRangeInfo,
    getStaticIPs,
}