const { executeCommand } = require('../../Helpers/executeCommand')
const { DDCLIENT_CONF_FILE } = require('../../Helpers/constants')
// Example ddclient config file:
//
// #ddns_enabled=true OR false
// use=web, web=<find-ip url>, web-skip='<text to ignore>'
// protocol=<ddns provider protocol>
// ssl=yes OR no
// server=<ddns provider update server url>
// login=<username>
// password=<password>
// <hostname>


function extractDDnsConfigs(configs) {
    let ddnsConfigs = {}
    let skipKeys = ['use', 'ssl']
    let lines = configs.split('\n')
    
    lines.forEach((item, index) => {
        let [configKey, configValue] = item.split('=')
        configKey = configKey.replace('#', '')
        
        if (configValue === undefined) { // parsing domain
            ddnsConfigs['domain'] = configValue
        } else if (skipKeys.includes(configKey)){
            return; // skips this iteration
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

function getProviderConfigs(requestData) {
    let protocol = '', 
        server   = '',
        ssl      = '',
        web      = '',
        web_skip = ''
    
    switch(requestData['provider']){
        case "NO-IP":
            protocol = 'dyndns2' 
            server = 'dynupdate.no-ip.com'
            ssl = 'yes'
            web = 'checkip.dyndns.org/'
            web_skip = "'IP Address'"
            break;
        
        case "DYN":
            protocol = 'dyndns2'
            server = 'members.dyndns.org'
            ssl = 'yes'
            web = 'checkip.dyndns.org/'
            web_skip = "'Current IP Address: '"
            break;
        
        case "ZONEEDIT":
            protocol = 'zoneedit1'
            server = 'www.zoneedit.com'
            ssl = 'yes'
            web = 'checkip.zoneedit.com/'
            web_skip = "'Address: "
            break;
        
        case "DNSEXIT":
            protocol = 'dnsexit'
            server = 'update.dnsexit.com'
            ssl = 'yes'
            web = 'checkip.dnsexit.com/'
            web_skip = "'Current IP Address:'"
            break;
        
        default:
            break;
    }

    return [protocol, server, ssl, web, web_skip]
}

async function getDDnsConfigs(){
    let command = `sudo cat ${DDCLIENT_CONF_FILE}`
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
    [requestData['protocol'], requestData['server'], 
        requestData['web'], requestData['web-skip'], 
        requestData['ssl']] = getProviderConfigs(requestData)

    let newFileContent = 
    `#ddns_enabled=${requestData['ddns_enabled']}
    use=web, web=${requestData['web']}, web-skip=${requestData['web-skip']}
    protocol=${requestData['protocol']}
    ssl=${requestData['ssl']}
    server=${requestData['server']}
    login=${requestData['username']}
    password=${requestData['password']}
    ${requestData['domain']}
    `;

    let command = `sudo echo "${newFileContent}" > ${DDCLIENT_CONF_FILE}`
    await executeCommand(command)
    
    await handleDdnsService(requestData)
}

module.exports = {
    getDDnsConfigs,
    editDDnsConfigs
}