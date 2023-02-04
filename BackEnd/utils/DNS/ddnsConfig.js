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


function extractDDnsConfigs(configs) {
    let ddnsConfigs = {}
    let lines = configs.split('\n')
    
    lines.forEach((item, index) => {
        let [configKey, configValue] = item.split('=')
        configKey = configKey.replace('#', '')
        
        if (configValue === undefined) { // parsing domain
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
    if ( stdout = await executeCommand(command) ) {
        configs = extractDDnsConfigs(stdout)
        return generateFrontendKeys(configs)
    }
    else {
        return
    }
}

async function handleDdnsService(requestData){
    let currentDdnsConfigs = getDDnsConfigs()

    if (requestData['ddns_enabled'] === currentDdnsConfigs['ddns_enabled']
        &&  currentDdnsConfigs['ddns_enabled'] === 'true'){
            await executeCommand('sudo systemctl restart ddclient')
    } else if (requestData['ddns_enabled'] === 'true' &&  currentDdnsConfigs['ddns_enabled'] === 'false') {
        await executeCommand('sudo systemctl enable ddclinet')
    } else if (requestData['ddns_enabled'] === 'false' &&  currentDdnsConfigs['ddns_enabled'] === 'true') {
        await executeCommand('sudo systemctl disable ddclinet')
    }
}

async function editDDnsConfigs(requestData){
    
    requestData['ddns_enabled'] = requestData['ddns_enabled'] === '1' ? 'true' : 'false'
    [requestData['protocol'], requestData['server']] = getProtocolServer(requestData)

    let newFileContent = 
    `#ddns_enabled=${requestData['ddns_enabled']}
    protocol=${requestData['protocol']}
    ssl=yes
    server=${requestData['server']}
    login=${requestData['username']}
    password=${requestData['password']}
    ${requestData['domain']}
    `;

    let command = `sudo echo "${newFileContent}" > /etc/ddclient.conf`
    await executeCommand(command)
    
    await handleDdnsService(requestData)
}

module.exports = {
    getDDnsConfigs,
    editDDnsConfigs
}