const { executeCommand } = require('../../Helpers/executeCommand')

function extractDnsDomains(string_configs) {
    let domains = []
    let getEachLineRegex = new RegExp('((.*?)\n)', 'g')
    let getDnsDomainsLineRegex = new RegExp('server=.*', 'g') // ??? how to find the right ones?
    lines = string_devices.match(getEachLineRegex)
    let domainId = 0
    lines.forEach(item => {
        if (arr[index].match(getDnsDomainsLineRegex)) {
            line = item.split(/(\s+)/)
            domains.push({
                id: ++domainId,
                ip: line[0],
                domain: line[1],
            })
        }  
    })
    return domains
}

async function getDnsDomains(){
    let command = 'sudo cat /etc/hosts'
    let stdout = ''
    if ( stdout = executeCommand(command) ) {
        return extractDnsServers(stdout)
    }
    else {
        return
    }
}

async function editDnsDomains(requestAction, requestData){
    let filePath = '/etc/hosts'
    let currentDnsServers = await getDnsServers().map(item => item.ip)
    domainsToEdit = {}
    
    requestData.forEach((item, index) => {
        if ( currentDnsServers.includes(requestData[index]) ){
            domainsToEdit.push(requestData[index])
        }
    })

    let command = `sudo cat ${filePath}`
    let stdout = ''
    if( executeCommand(command) ) {
        getEachLineRegex = new RegExp('((.*?)\n)', 'g')
        let lines = stdout.match(getEachLineRegex)

        switch (requestMethod) {
            case 'POST':
                domainsToEdit.forEach( (item, index) => {
                    lines.push(`${domainsToEdit[index][ip]}\t\t${domainsToEdit[index][domain]}`)
                });
                break;
            
            case 'DELETE':
                lines.forEach( (item, linesIndex, arr) => {
                    domainsToEdit.forEach( (item, serversIndex) => {
                        if (lines[linesIndex].match(`server=${domainsToEdit[serversIndex]}`)) { 
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
    getDnsDomains,
    editDnsDomains
}