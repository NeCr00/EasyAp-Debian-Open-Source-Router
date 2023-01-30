const { executeCommand } = require('../../Helpers/executeCommand')


function extractDnsServers(string_configs) {
    let servers = []
    let getEachLineRegex = new RegExp('((.*?)\n)', 'g')
    let getDnsServersLineRegex = new RegExp('server=.*', 'g')
    lines = string_devices.match(getEachLineRegex)
    let serverId = 0
    lines.forEach(item => {
        if (arr[index].match(getDnsServersLineRegex)) {
            line = item.split("=")
            servers.push({
                id: ++serverId,
                ip: line[1]
            })
        }  
    })
    return servers
}

async function getDnsServers(){
    let command = 'sudo cat /etc/dnsmasq.conf'
    let stdout = ''
    if ( stdout = executeCommand(command) ) {
        return extractDnsServers(stdout)
    }
    else {
        return
    }
}

async function editDnsServers(requestMethod, requestData){
    let filePath = '/etc/dnsmasq.conf'
    let currentDnsServers = await getDnsServers().map(item => item.ip)
    serversToEdit = {}
    
    requestData.forEach((item, index) => {
        if ( currentDnsServers.includes(requestData[index]) ){
            serversToEdit.push(requestData[index])
        }
    })

    let command = `sudo cat ${filePath}`
    let stdout = ''
    if( executeCommand(command) ) {
        getEachLineRegex = new RegExp('((.*?)\n)', 'g')
        let lines = stdout.match(getEachLineRegex)

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
        command = `sudo echo ${newFileContent} > ${filePath}`
        executeCommand(command)
        
        // Restart dnsmasq service
        command = `sudo systemctl restart dnsmasq`
        executeCommand(command)
    }

}


module.exports = {
    getDnsServers,
    editDnsServers
}