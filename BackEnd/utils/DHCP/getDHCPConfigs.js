const { executeCommand } = require('../../Helpers/executeCommand')
const {DNSMASQ_CONF_FILE, DNSMASQ_STATIC_LEASES_FILE} = require('../../Helpers/constants')
const { readFileSync } = require('fs');

function extractDHCPRangeInfo(dhcpRangeConfigs) {
    let getDHCPRangeLineRegex = new RegExp('.*dhcp-range((.*?)\n)', 'g')
    let configLine = dhcpRangeConfigs.match(getDHCPRangeLineRegex)
    let dhcpRangeValues = configLine[0].split("=")[1]
    dhcpRangeValues = dhcpRangeValues.split(",")
    console.log(configLine[0][0])
    let dhcpRangeInfo = {
        "dhcp_enabled": configLine[0][0] === '#' ? '0' : '1',
        "start_ip": dhcpRangeValues[0],
        "end_ip":  dhcpRangeValues[1],
        "mask": dhcpRangeValues[2],
        "time": dhcpRangeValues[3],
        "lease_isEnabled": dhcpRangeValues[3] === '24h' ? false : true,
    }
    
    return dhcpRangeInfo
}

function getDHCPRangeInfo(){
    let filePath = DNSMASQ_CONF_FILE
    let fileContent = readFileSync(filePath, 'utf-8')
    if ( fileContent ) {
        return extractDHCPRangeInfo(fileContent)
    }
    else {
        return
    }
}

function extractDHCPStaticInfo(staticAddrConfigs) {
    let dhcpStaticAddrPairs = []
    let lines = staticAddrConfigs.split('\n')
    console.log(lines)
    
    lines.forEach(line => {
        if (line === '') return;
        
        let values = line.split("=")[1]
        console.log(values)
        values = values.split(",")
        console.log(values)
        
        dhcpStaticAddrPairs.push({
            mac: values[0],
            ip: values[1],
        })
    })

    return dhcpStaticAddrPairs
}

function getStaticIPs(){
    let filePath = DNSMASQ_STATIC_LEASES_FILE
    let fileContent = readFileSync(filePath, 'utf-8')
    if ( fileContent ) {
        return extractDHCPStaticInfo(fileContent)
    }
    else {
        return
    }
}

module.exports = {
    getDHCPRangeInfo,
    getStaticIPs,
}