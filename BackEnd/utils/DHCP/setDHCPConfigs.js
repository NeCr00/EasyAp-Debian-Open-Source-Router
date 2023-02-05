const { getDHCPRangeInfo } = require('./getDHCPConfigs.js')
const { executeCommand } = require('../../Helpers/executeCommand')

const DNSMASQ_CONF_FILE = '/etc/dnsmasq.conf'
const DNSMASQ_STATIC_LEASES_FILE = '/etc/dnsmasq.d/static_leases'

function changeDnsmasqConfLine(line, configValueIndex, configsToChange){
    [linePrefix, editedLine] = line.split('=')
    editedLine = editedLine.split(',')
    editedLine[configValueIndex] = configsToChange[key]
    line = linePrefix + '=' + editedLine.join(',')

    return line
}

async function editDnsmasqDHCPRange(requestData){
    let filePath = DNSMASQ_CONF_FILE
    let currentConfigs = await getDHCPRangeInfo()
    configsToChange = {}
    
    for (let key in currentConfigs) {
        if (currentConfigs[key] !== requestData[key]){
            configsToChange[key] = requestData[key]
        }
    }

    let command = `sudo cat ${filePath}`
    let stdout = ''
    if( await executeCommand(command) ) {
        let lines = stdout.split('\n')
        let getDHCPRangeLineRegex = new RegExp('.*dhcp-range((.*?)\n)', 'g')

        lines.forEach( (item, index, arr) => {
            if (arr[index].match(getDHCPRangeLineRegex)) {
                
                for (key in configsToChange){    
                    switch (key) {

                        case 'dhcp_enable':
                            if (configsToChange[key] === '1'){
                                lines[index] = lines[index].replace('#', '')
                            } else if (configsToChange[key] === '0'){
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
            }
        });
        
        // Join the lines back together
        const newFileContent = lines.join('\n');

        // Write the new file back to disk
        command = `sudo echo "${newFileContent}" > ${filePath}`
        await executeCommand(command)
        
        // Restart dnsmasq service
        command = `sudo systemctl restart dnsmasq`
        await executeCommand(command)
    }

}

async function editDnsmasqStaticIPs(requestAction, requestData){
    let filePath = DNSMASQ_STATIC_LEASES_FILE
    let readFileCommand = `sudo cat ${filePath}`
    let restartDnsmasqCommand = 'sudo systemctl restart dnsmasq'
    let stdout = ''
    
    if ( stdout = await executeCommand(readFileCommand) ) {
        switch (requestAction){
            case "POST":
                requestData.forEach(async (item) => {
                    let addHostCommand = `sudo dnsmasq --dhcp-host ${item.mac},${item.ip}`
                    await executeCommand(addHostCommand)
                });
                
                // Restart dnsmasq service
                await executeCommand(restartDnsmasqCommand)
                break;
            
            
            case "DELETE":
                let lines = stdout.split('\n')

                lines.forEach((lineItem, index, arr) => {
                    requestData.forEach(dataItem => {
                        if (lines[index].includes(dataItem.mac)){
                            // lines[index] = ''
                            lines.splice(index, 1)
                        }
                    });
                });
                const newFileContent = lines.join('\n');

                // Write the new file back to disk
                let removeHostCommand = `sudo echo "${newFileContent}" > ${filePath}`
                await executeCommand(removeHostCommand)
                
                // Restart dnsmasq service
                await executeCommand(restartDnsmasqCommand)
                break;

            default:
                break;
        }
    }
}


module.exports = {
    editDnsmasqDHCPRange,
    editDnsmasqStaticIPs,
}