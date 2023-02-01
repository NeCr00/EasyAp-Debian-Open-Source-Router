const { executeCommand } = require('../../Helpers/executeCommand')

// Example ddclient config file:
//
// #ddns_enabled=true OR false
// protocol=<ddns_provider>
// ssl=yes
// server=<ddns_provider_update_url>
// login=<username>
// password=<password>
// <hostname>

function extractDDnsConfigs(string_configs) {
    let ddnsConfigs = {}
    let getEachLineRegex = new RegExp('((.*?)\n)', 'g')
    let lines = string_configs.match(getEachLineRegex)
    lines.forEach((item, index) => {
        let [configKey, configValue] = item.split('=')
        
        if (index === 0){ // parsing ddns_enabled
            ddnsConfigs[configKey.replace('#', '')] = configValue === 'true' ? '1' : '0'
        } else if (index === lines.length-1) { // parsing domain
            ddnsConfigs['domain'] = configValue
        } else {
            ddnsConfigs[configKey] = configValue
        }
    })
    
    return ddnsConfigs
}

function generateFrontendKeys(ddnsConfigs) {
    
    switch(ddnsConfigs['protocol'] + '|' + ddnsConfigs['server']){
        case "noip|dynupdate.no-ip.com":
        case "dyndns2|dynupdate.no-ip.com":
            ddnsConfigs['provider'] = 'NO-IP'
            break;
        
        case "dyndns1|members.dyndns.org":
        case "dyndns2|members.dyndns.org":
            ddnsConfigs['provider'] = 'DYN'
            break;
        
        case "zoneedit1|www.zoneedit.com":
            ddnsConfigs['provider'] = 'ZONEEDIT'
        
        case "dnsexit|update.dnsexit.com":
            ddnsConfigs['provider'] = 'DNSEXIT'
        
        default:
            break;
    }
    
    return ddnsConfigs
}

function getProtocolServer(requestData) {
    let protocol = '', 
        server   = ''
    
    switch(requestData['provider']){
        case "NO-IP":
            protocol = 'dyndns2' 
            server = 'dynupdate.no-ip.com'
            break;
        
        case "DYN":
            protocol = 'dyndns2'
            server = 'members.dyndns.org'
            break;
        
        case "ZONEEDIT":
            protocol = 'zoneedit1'
            server = 'www.zoneedit.com'
            break;
        
        case "DNSEXIT":
            protocol = 'dnsexit'
            server = 'update.dnsexit.com'
            break;
        
        default:
            break;
    }

    return [protocol, server]
}

async function getDDnsConfigs(){
    let command = 'sudo cat /etc/ddclient.conf'
    let stdout = ''
    if ( stdout = executeCommand(command) ) {
        configs = extractDDnsConfigs(stdout)
        return generateFrontendKeys(configs)
    }
    else {
        return
    }
}

async function editDDnsConfigs(requestData){
    
    requestData['ddns_enabled'] = requestData['ddns_enabled'] === '1' ? 'true' : 'false'
    [requestData['protocol'], requestData['server']] = getProtocolServer(requestData)

    let newFileContent = 
    `
    #ddns_enabled=${requestData['ddns_enabled']}
    protocol=${requestData['protocol']}
    ssl=yes
    server=${requestData['server']}
    login=${requestData['username']}
    password=${requestData['password']}
    ${requestData['domain']}
    `;

    let command = `sudo echo "${newFileContent}" > /etc/ddclient.conf`
    if ( stdout = executeCommand(command) ) {
        configs = extractDDnsConfigs(stdout)
        return generateFrontendKeys(configs)
    }
    
    command = 'sudo systemctl restart ddclient'
    executeCommand(command)
}

module.exports = {
    getDDnsConfigs,
    editDDnsConfigs
}