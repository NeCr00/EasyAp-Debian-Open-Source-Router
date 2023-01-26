const util = require('util');
const exec = util.promisify(require('child_process').exec)
const { getDHCPRangeInfo } = require('./getDHCPConfigs.js')

function changeDnsmasqConfLine(line, configValueIndex, configsToChange){
    [linePrefix, editedLine] = line.split('=')
    editedLine = editedLine.split(',')
    editedLine[configValueIndex] = configsToChange[key]
    line = linePrefix + '=' + editedLine.join(',')

    return line
}

async function editDnsmasqDHCPRange(requestData){
    let filePath = '/etc/dnsmasq.conf'
    // let filePath = '/home/jason/workdir/test-dir/dhcp_test.txt'
    let currentConfigs = await getDHCPRangeInfo()
    configsToChange = {}
    
    for (let key in currentConfigs) {
        if (currentConfigs[key] !== requestData[key]){
            configsToChange[key] = requestData[key]
        }
    }

    console.log(configsToChange)

    let command = `cat ${filePath}`
    const { stdout, stderr } = await exec('sudo ' + command);
    // const { stdout, stderr } = await exec(command);
    if (stderr) {
        console.log(stderr);
        return;
    } else {
        getEachLineRegex = new RegExp('((.*?)\n)', 'g')
        let lines = stdout.match(getEachLineRegex)
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

        console.log(newFileContent)

        // Write the new file back to disk
        // command = `echo ${newFileContent} > ${filePath}`
        // const { stdout, stderr } = await exec('sudo ' + command);
        
        // Restart dnsmasq service
        // command = `systemctl restart dnsmasq`
        // const { stdout, stderr } = await exec('sudo ' + command);
    }

}

async function editDnsmasqStaticIPs(requestAction, requestData){
    let filePath = '/etc/dnsmasq.d/static_leases'
    let command = `cat ${filePath}`
    const { stdout, stderr } = await exec('sudo ' + command);
    if (stderr) {
        console.log(stderr);
        return;
    } else {
        switch (requestAction){
            case "POST":
                requestData.forEach(async (item) => {
                    command = `dnsmasq --dhcp-host ${item.mac},${item.ip}`
                    const { stdout, stderr } = await exec('sudo ' + command);
                });
                // Restart dnsmasq service
                // command = 'systemctl restart dnsmasq'
                // const { postStdout, postStderr } = await exec('sudo ' + command)
                break;
            
            
            case "DELETE":
                getEachLineRegex = new RegExp('((.*?)\n)', 'g')
                let lines = stdout.match(getEachLineRegex)

                lines.forEach((lineItem, index, arr) => {
                    requestData.forEach(dataItem => {
                        if (lines[index].includes(dataItem.mac)){
                            lines[index] = ''
                        }
                    });
                });
                const newFileContent = lines.join('\n');

                console.log(newFileContent)

                // Write the new file back to disk
                // command = `echo ${newFileContent} > ${filePath}`
                // const { stdout, stderr } = await exec('sudo ' + command);
                
                // Restart dnsmasq service
                // command = 'systemctl restart dnsmasq'
                // const { deleteStdout, deleteStderr } = await exec('sudo ' + command)
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