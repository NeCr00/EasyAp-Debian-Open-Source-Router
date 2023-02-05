const { executeCommand } = require('../../Helpers/executeCommand')

const HOSTS_FILE = '/etc/hosts'

function extractDnsDomains(configs) {
    let domains = []
    let getDnsDomainsLineRegex = new RegExp('EasyAP', 'g')
    let lines = configs.split('\n')
    let domainId = 0

    lines.forEach(line => {
        if (arr[index].match(getDnsDomainsLineRegex)) {
            let values = line.split(/(\s+)/)
            domains.push({
                id: ++domainId,
                ip: values[0],
                domain: values[1],
            })
        }  
    })
    return domains
}

async function getDnsDomains(){
    let command = `sudo cat ${HOSTS_FILE}`
    let stdout = ''
    if ( stdout = await executeCommand(command) ) {
        return extractDnsDomains(stdout)
    }
    else {
        return
    }
}

async function editDnsDomains(requestAction, requestData){
    let filePath = HOSTS_FILE
    let currentDnsDomains = await getDnsDomains()
    let domainsToEdit = {}
    let easyAPComment = '#EasyAP config'
    
    requestData.forEach((item, index) => {
        if ( currentDnsDomains.includes(requestData[index]) ){
            domainsToEdit.push(requestData[index])
        }
    })

    let command = `sudo cat ${filePath}`
    let stdout = ''
    if( await executeCommand(command) ) {
        let lines = stdout.split('\n')

        switch (requestMethod) {
            case 'POST':
                domainsToEdit.forEach( (item, index) => {
                    lines.push(`${domainsToEdit[index][ip]}\t\t${domainsToEdit[index][domain]} ${easyAPComment}`)
                });
                break;
            
            case 'DELETE':
                lines.forEach( (item, linesIndex, arr) => {
                    domainsToEdit.forEach( (item, domainsIndex) => {
                        if (lines[linesIndex].match(`/${domainsToEdit[domainsIndex][ip]}\s+${domainsToEdit[domainsIndex][domain]}/`)) { 
                            // lines[linesIndex] = ''
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
    getDnsDomains,
    editDnsDomains
}