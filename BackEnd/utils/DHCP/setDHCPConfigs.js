const { getDHCPRangeInfo } = require('./getDHCPConfigs.js')
const { executeCommand } = require('../../Helpers/executeCommand')
const {DNSMASQ_CONF_FILE, DNSMASQ_STATIC_LEASES_FILE} = require('../../Helpers/constants')
const { readFileSync, writeFileSync, appendFileSync } = require('fs');

function changeDnsmasqConfLine(line, configValueIndex, configsToChange){
    [linePrefix, editedLine] = line.split('=')
    editedLine = editedLine.split(',')
    editedLine[configValueIndex] = configsToChange[key]
    line = linePrefix + '=' + editedLine.join(',')
    console.log(line)
    return line
}

async function editDnsmasqDHCPRange(requestData){
    let filePath = DNSMASQ_CONF_FILE
    let currentConfigs = getDHCPRangeInfo()
    configsToChange = {}
    
    for (let key in currentConfigs) {
        if (currentConfigs[key] !== requestData[key]){
            configsToChange[key] = requestData[key]
        }
    }
    console.log(configsToChange)

    let fileContent = readFileSync(filePath, 'utf-8')
    if( fileContent ) {
        let lines = fileContent.split('\n')
        let getDHCPRangeLineRegex = new RegExp('.*dhcp-range.*', 'g')

        lines.forEach( (item, index) => {
            if (lines[index].match(getDHCPRangeLineRegex)) {
                
                for (key in configsToChange){
                    console.log(key)
                    switch (key) {

                        case 'dhcp_enabled':
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
        writeFileSync(filePath, newFileContent, 'utf-8')
        
        // Restart dnsmasq service
        command = `sudo systemctl restart dnsmasq`
        await executeCommand(command)
    }

}

async function editDnsmasqStaticIPs(requestAction, requestData){
    
    let filePath = DNSMASQ_STATIC_LEASES_FILE
    let fileContent = readFileSync(filePath, 'utf-8')
    let restartDnsmasqCommand = 'sudo systemctl restart dnsmasq'
    
    if ( fileContent ) {
        switch (requestAction){
            case "POST":
                requestData.forEach( (item) => {
                    let lineToAdd = `dhcp-host=${item.mac},${item.ip}`
                    appendFileSync(filePath, lineToAdd, 'utf-8')
                });
                break;
            
            
            case "DELETE":
                let lines = fileContent.split('\n')

                lines.forEach( (lineItem, index) => {
                    requestData.forEach(dataItem => {
                        if (lines[index].includes(dataItem.mac)){
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
    }

    // Restart dnsmasq service
    await executeCommand(restartDnsmasqCommand)
}


module.exports = {
    editDnsmasqDHCPRange,
    editDnsmasqStaticIPs,
}