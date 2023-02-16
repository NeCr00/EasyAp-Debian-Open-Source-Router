const util = require('util');
const exec = util.promisify(require('child_process').exec)
const { HOSTS_FILE } = require('../../Helpers/constants');
const { readFileSync, writeFileSync } = require('fs');

function extractDnsDomains(configs) {
    let domains = []
    let getDnsDomainsLineRegex = new RegExp('EasyAP', 'g')
    let lines = configs.split('\n')
    let domainId = 0

    lines.forEach( (line, index) => {
        if (lines[index].match(getDnsDomainsLineRegex)) {
            let values = line.split(/(\s+)/)
            domains.push({
                id: ++domainId,
                ip: values[0],
                domain: values[2],
            })
        }  
    })
    return domains
}

function getDnsDomains(){
    let fileContent = readFileSync(HOSTS_FILE, 'utf-8')
    if ( fileContent ) {
        return extractDnsDomains(fileContent)
    }
    else {
        return
    }
}

async function editDnsDomains(requestMethod, requestData){
    let filePath = HOSTS_FILE
    let currentDnsDomains = getDnsDomains()
    let easyAPComment = '#EasyAP config'
    let domainsToDelete = []
    let lines = []
    
    requestData.forEach((item, index) => {
        if ( currentDnsDomains.map(item => item.domain).includes(requestData[index]['domain']) ){
            domainsToDelete.push(requestData[index])
        }
    })

    let fileContent = readFileSync(filePath, 'utf-8')
    if( fileContent ) {
        lines = fileContent.split('\n')

        switch (requestMethod) {
            case 'POST':
                requestData.forEach( (item, index) => {
                    let lineToAdd = `${requestData[index]['ip']}\t\t${requestData[index]['domain']} ${easyAPComment}\n`
                    lines.push(lineToAdd)
                });
                break;
            
            case 'DELETE':
                lines.forEach( (item, linesIndex, arr) => {
                    domainsToDelete.forEach( (item, domainsIndex) => {
                        let domainToDeleteRegex = new RegExp(`${domainsToDelete[domainsIndex]['ip']}\\s*${domainsToDelete[domainsIndex]['domain']}`, 'i')
                        if (lines[linesIndex].match(domainToDeleteRegex)) {
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
        await exec(command)
    }
}

module.exports = {
    getDnsDomains,
    editDnsDomains
}