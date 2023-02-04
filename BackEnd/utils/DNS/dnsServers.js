const { executeCommand } = require('../../Helpers/executeCommand')


function extractDnsServers(serverConfigs) {
    let servers = []
    let getDnsServersLineRegex = new RegExp('server=.*', 'g')
    lines = serverConfigs.split('\n')
    let serverId = 0

    lines.forEach(line => {
        if (arr[index].match(getDnsServersLineRegex)) {
            let values = line.split("=")
            servers.push({
                id: ++serverId,
                ip: values[1]
            })
        }  
    })
    return servers
}

async function getDnsServers(){
    let command = 'sudo cat /etc/dnsmasq.conf'
    let stdout = ''
    if ( stdout = await executeCommand(command) ) {
        return extractDnsServers(stdout)
    }
    else {
        return
    }
}

async function editDnsServers(requestMethod, requestData){
    let filePath = '/etc/dnsmasq.conf'
    let currentDnsServers = await getDnsServers().map(item => item.ip)
    let serversToEdit = {}
    
    requestData.forEach((item, index) => {
        if ( currentDnsServers.includes(requestData[index]) ){
            serversToEdit.push(requestData[index])
        }
    })

    let command = `sudo cat ${filePath}`
    let stdout = ''
    if( await executeCommand(command) ) {
        let lines = stdout.split('\n')

        switch (requestMethod) {
            case 'POST':
                serversToEdit.forEach( (item, index) => {
                    lines.push(`server=${serversToEdit[index]}`)
                });
                break;
            
            case 'DELETE':
                lines.forEach( (item, linesIndex, arr) => {
                    serversToEdit.forEach( (item, serversIndex) => {
                        if (lines[linesIndex].match(`server=${serversToEdit[serversIndex]}`)) { 
                            lines[linesIndex] = ''
                        }
                    });
                });
                break;
            
            default:
                break;
                    
        }
        
        // Join the lines back together
        const newFileContent = lines.join('\n');

        console.log(newFileContent)

        // Write the new file back to disk
        command = `sudo echo "${newFileContent}" > ${filePath}`
        await executeCommand(command)
        
        // Restart dnsmasq service
        command = `sudo systemctl restart dnsmasq`
        await executeCommand(command)
    }

}


module.exports = {
    getDnsServers,
    editDnsServers
}