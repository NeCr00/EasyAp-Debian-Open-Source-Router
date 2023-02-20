const { executeCommand } = require('../../Helpers/executeCommand')
const { DNSMASQ_CONF_FILE } = require('../../Helpers/constants')
const { readFileSync, writeFileSync } = require('fs');

function extractDnsServers(serverConfigs) {
    let servers = []
    let getDnsServersLineRegex = new RegExp('server=.*', 'g')
    lines = serverConfigs.split('\n')
    let serverId = 0

    lines.forEach( (item, index) => {
        if (lines[index].match(getDnsServersLineRegex)) {
            let values = item.split("=")
            servers.push({
                id: ++serverId,
                ip: values[1].split("#")[0]
            })
        }  
    })
    return servers
}

function getDnsServers(){
    let filePath = DNSMASQ_CONF_FILE
    let fileContent = readFileSync(filePath, 'utf-8')
    if ( fileContent ) {
        return extractDnsServers(fileContent)
    }
    else {
        return
    }
}

async function editDnsServers(requestMethod, requestData){
    let filePath = DNSMASQ_CONF_FILE
    let currentDnsServers = getDnsServers().map(item => item.ip)
    let serversToDelete = []
    
    requestData.forEach((item, index) => {
        if ( currentDnsServers.includes(requestData[index]) ){
            serversToDelete.push(requestData[index])
        }
    })

    let fileContent = readFileSync(filePath, 'utf-8')
    if( fileContent ) {
        let lines = fileContent.split('\n')

        switch (requestMethod) {
            case 'POST':
                requestData.forEach( (item, index) => {
                    lines.push(`server=${requestData[index]}`)
                });
                break;
            
            case 'DELETE':
                lines.forEach( (item, linesIndex) => {
                    serversToDelete.forEach( (item, serversIndex) => {
                        if (lines[linesIndex].match(`server=${serversToDelete[serversIndex]}`)) {
                            lines.splice(linesIndex, 1)
                        }
                    });
                });
                break;
            
            default:
                break;
                    
        }
        
        // Join the lines back together
        const newFileContent = lines.join('\n');

        // Write the new file back to disk
        writeFileSync(filePath, newFileContent, 'utf-8')
        
        // Restart dnsmasq service
        command = `sudo systemctl restart dnsmasq`
        await executeCommand(command)
    }

}


module.exports = {
    getDnsServers,
    editDnsServers
}