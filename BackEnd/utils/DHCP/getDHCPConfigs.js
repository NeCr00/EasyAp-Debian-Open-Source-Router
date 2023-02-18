const {DNSMASQ_CONF_FILE, DNSMASQ_STATIC_LEASES_FILE } = require('../../Helpers/constants')
const { readFileSync } = require('fs')

function extractDHCPRangeInfo(dhcpRangeConfigs) {
    let getDHCPRangeLineRegex = new RegExp('.*dhcp-range((.*?)\n)', 'g')
    let configLine = dhcpRangeConfigs.match(getDHCPRangeLineRegex)
    let dhcpRangeValues = configLine[0].split("=")[1]
    dhcpRangeValues = dhcpRangeValues.split(",")

    let dhcpRangeInfo = {
        "dhcp_enabled": configLine[0][0] === '#' ? '0' : '1',
        "start_ip": dhcpRangeValues[0],
        "end_ip":  dhcpRangeValues[1],
        "mask": dhcpRangeValues[2],
        "time": dhcpRangeValues[3],
        "gateway": getGatewayAddress()
    }
    
    return dhcpRangeInfo
}

function getDHCPRangeInfo(){
    let filePath = DNSMASQ_CONF_FILE
    let fileContent = readFileSync(filePath, 'utf-8')
    if ( fileContent ) {
        return extractDHCPRangeInfo(fileContent)
    }    else {
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
            hostname: values[2],
        })
    })

    return dhcpStaticAddrPairs
}

function getStaticIPs(){
    let filePath = DNSMASQ_STATIC_LEASES_FILE
    let fileContent = readFileSync(filePath, 'utf-8')
    if ( fileContent ) {
        return extractDHCPStaticInfo(fileContent)
    } else {
        return
    }
}

function extractGatewayAddress(dnsmasqConfig) {
    let lines = dnsmasqConfig.split('\n');
  
    let addressLine = null;
    for (const line of lines) {
      if (line.startsWith('address=')) {
        addressLine = line;
        break;
      }
    }
  
    if (!addressLine) {
      throw new Error('No address field found in dhcpcd.conf');
    }
  
    let addressParts = addressLine.split('/');
    let ipAddress = addressParts[2];

    return ipAddress
  }  

function getGatewayAddress(){
    let filePath = DNSMASQ_CONF_FILE
    let fileContent = readFileSync(filePath, 'utf-8')
    if (fileContent){
         return extractGatewayAddress(fileContent)
    } else {
        return
    }
}

module.exports = {
    getDHCPRangeInfo,
    getStaticIPs,
    getGatewayAddress,
}