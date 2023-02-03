const { executeCommand } = require('../../Helpers/executeCommand')

function extractDHCPRangeInfo(string_configs) {
    let getDHCPRangeLineRegex = new RegExp('.*dhcp-range((.*?)\n)', 'g')
    let configLine = string_configs.match(getDHCPRangeLineRegex)
    let dhcpRangeValues = configLine[0].split("=")[1]
    dhcpRangeValues = dhcpRangeValues.split(",")
    let dhcpRangeInfo = {
        "dhcp_enable": configLine[0] === '#' ? '0' : '1',
        "start_ip": dhcpRangeValues[0],
        "end_ip":  dhcpRangeValues[1],
        "mask": dhcpRangeValues[2],
        "time": dhcpRangeValues[3],
        "lease_isEnabled": dhcpRangeValues[3] === '24h' ? true : false,
    }
    
    return dhcpRangeInfo
}

async function getDHCPRangeInfo(){
    let command = 'sudo cat /etc/dnsmasq.conf'
    let stdout = ''
    if ( stdout = await executeCommand(command) ) {
        return extractDHCPRangeInfo(stdout)
    }
    else {
        return
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
    let command = 'sudo cat /etc/dnsmasq.d/static_leases'
    let stdout = ''
    if ( stdout = await executeCommand(command) ) {      
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