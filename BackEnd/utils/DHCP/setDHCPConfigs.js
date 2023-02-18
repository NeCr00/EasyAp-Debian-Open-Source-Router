const { getDHCPRangeInfo, getGatewayAddress } = require('./getDHCPConfigs.js')
const { executeCommand } = require('../../Helpers/executeCommand')
const { DNSMASQ_CONF_FILE, DNSMASQ_STATIC_LEASES_FILE, DHCPCD_CONF_FILE } = require('../../Helpers/constants')
const { readFileSync, writeFileSync, appendFileSync } = require('fs');
const ip = require('ip');

function changeDnsmasqConfLine(line, configValueIndex, configsToChange) {
    [linePrefix, editedLine] = line.split('=')
    editedLine = editedLine.split(',')
    editedLine[configValueIndex] = configsToChange[key]
    line = linePrefix + '=' + editedLine.join(',')
    return line
}

async function getGatewayIPRange() {
    let ifconfigStdout = await executeCommand('ifconfig eth0')
    let getNetworkConfigRegex = new Regex('.*inet ')
    let networkConfigLine = ''

    ifconfigStdout = ifconfigStdout.split('\n')

    ifconfigStdout.forEach((line, index) => {
        if (line.match(getNetworkConfigRegex)) {
            networkConfigLine = line
        }
    })
    // ifconfig line format:
    // inet <currentIp> netmask <subnetMask>  broadcast <broadcastIp>
    networkConfigLine = networkConfigLine.trim().split('/\s+/')
    let currentIp = networkConfigLine[1]
    let subnetMask = networkConfigLine[3]

    return ip.subnet(currentIp, subnetMask)
}


async function checkAddressRange(subnetMask, ipAddress) {

    getGatewayRange = await getGatewayIPRange()

    return getGatewayIPRange.contains(ipAddress)

}

async function editDnsmasqDHCPRange(requestData) {
    let filePath = DNSMASQ_CONF_FILE
    let currentConfigs = getDHCPRangeInfo()
    configsToChange = {}

    for (let key in currentConfigs) {
        if (currentConfigs[key] !== requestData[key]) {
            configsToChange[key] = requestData[key]
        }
    }

    let fileContent = readFileSync(filePath, 'utf-8')
    if (fileContent) {
        let lines = fileContent.split('\n')
        let getDHCPRangeLineRegex = new RegExp('.*dhcp-range.*', 'g')
        let getAddressLineRegex = new RegExp('address=')

        lines.forEach((line, index) => {
            if (line.match(getDHCPRangeLineRegex)) {

                for (key in configsToChange) {
                    switch (key) {

                        case 'dhcp_enabled':
                            if (configsToChange[key] === '1') {
                                lines[index] = lines[index].replace('#', '')
                            } else if (configsToChange[key] === '0') {
                                lines[index] = '#' + lines[index]
                            }
                            break;

                        case 'start_ip':
                            lines[index] = changeDnsmasqConfLine(lines[index], 0, configsToChange)
                            break;

                        case 'end_ip':
                            lines[index] = changeDnsmasqConfLine(lines[index], 1, configsToChange)
                            break;

                        case 'mask':
                            lines[index] = changeDnsmasqConfLine(lines[index], 2, configsToChange)
                            break;

                        case 'time':
                            lines[index] = changeDnsmasqConfLine(lines[index], 3, configsToChange)
                            break;

                        default:
                            break;

                    }
                }
            } else if (line.match(getAddressLineRegex)) {
                lines[index] = `address=/gw.wlan/${requestData['gateway']}`
            }
        });

        // Join the lines back together
        const newFileContent = lines.join('\n');

        // Write the new file back to disk
        writeFileSync(filePath, newFileContent, 'utf-8')

        // Restart dnsmasq service
        command = `sudo systemctl restart dnsmasq`
        await executeCommand(command)
    }

}

async function editDnsmasqStaticIPs(requestAction, requestData) {

    let filePath = DNSMASQ_STATIC_LEASES_FILE
    let fileContent = readFileSync(filePath, 'utf-8')
    let restartDnsmasqCommand = 'sudo systemctl restart dnsmasq'

    switch (requestAction) {
        case "POST":
            requestData.forEach((item) => {
                let lineToAdd = `dhcp-host=${item.mac},${item.ip},${item.hostname}\n`
                appendFileSync(filePath, lineToAdd, 'utf-8')
            });
            break;


        case "DELETE":
            let lines = fileContent.split('\n')

            lines.forEach((lineItem, index) => {
                requestData.forEach(dataItem => {
                    if (lines[index].includes(dataItem.mac)) {
                        lines.splice(index, 1)
                    }
                });
            });
            const newFileContent = lines.join('\n');

            // Write the new file back to disk
            writeFileSync(filePath, newFileContent, 'utf-8')
            break;

        default:
            break;
    }

    // Restart dnsmasq service
    await executeCommand(restartDnsmasqCommand)
}
  

async function setDhcpcdGatewayAddress(newIpAddress, newSubnetMask)  {
    let filePath = DHCPCD_CONF_FILE
    let subnetInfo = ip.subnet(newIpAddress, newSubnetMask)
    // Read the contents of /etc/dhcpcd.conf into a string
    let fileContents = readFileSync(filePath, 'utf8');
    let oldIpAddress = getGatewayAddress()
    console.log('oldip',oldIpAddress)
    // Split the file contents into an array of lines
    let lines = fileContents.split('\n');

    lines.forEach((line, index) => {
        if (line.includes(oldIpAddress)){
            oldSubnetMask = line.split('/')[1]
            lines[index] = line.replace(`${oldIpAddress}/${oldSubnetMask}`, `${newIpAddress}/${subnetInfo.subnetMaskLength}`)
        }
    })

    // Join the updated lines back into a string
    let updatedFileContents = lines.join('\n');

    // Write the updated contents back to the file
    writeFileSync(filePath, updatedFileContents, 'utf8');
    let command = `sudo systemctl restart dhcpcd`
    await executeCommand(command)
}

module.exports = {
    editDnsmasqDHCPRange,
    editDnsmasqStaticIPs,
    setDhcpcdGatewayAddress,
}