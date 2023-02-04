const { executeCommand } = require('../../Helpers/executeCommand')

function extractDHCPRangeInfo(dhcpRangeConfigs) {
    let getDHCPRangeLineRegex = new RegExp('.*dhcp-range((.*?)\n)', 'g')
    let configLine = dhcpRangeConfigs.match(getDHCPRangeLineRegex)
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

function extractDHCPStaticInfo(staticAddrConfigs) {
    let dhcpStaticAddrPairs = []
    let lines = staticAddrConfigs.split('\n')
    
    lines.forEach(line => {
        let values = line.split("=")[1]
        values = values.split(",")
        
        dhcpStaticAddrPairs.push({
            mac: values[0],
            ip: values[1],
        })
    })

    return dhcpStaticAddrPairs
}

async function getStaticIPs(){
    let command = 'sudo cat /etc/dnsmasq.d/static_leases'
    let stdout = ''
    if ( stdout = await executeCommand(command) ) {
        return extractDHCPStaticInfo(stdout)
    }
    else {
        return
    }
}

module.exports = {
    getDHCPRangeInfo,
    getStaticIPs,
}