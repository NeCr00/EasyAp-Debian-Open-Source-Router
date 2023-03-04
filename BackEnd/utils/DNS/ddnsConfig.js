const { executeCommand } = require('../../Helpers/executeCommand')
const { DDCLIENT_CONF_FILE } = require('../../Helpers/constants')
const { readFileSync, writeFileSync } = require('fs');

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
    let skipKeys = ['use', 'ssl', '']
    let lines = configs.split('\n')
    
    lines.forEach((item, index) => {
        let [configKey, configValue] = item.split('=')
        configKey = configKey.replace('#', '').trim()

        if (configValue === undefined) { // parsing domain
            ddnsConfigs['domain'] = lines[lines.length - 1].trim()
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
            ddnsConfigs['provider'] = 'Select Provider'
            break;
    }

    return ddnsConfigs
}

function getProviderConfigs(requestData) {
    console.log('hello from getProviderConfigs')
    let protocol = '' 
    let server   = ''
    let ssl      = ''
    let web      = ''
    let web_skip = ''
    
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

    requestData['protocol'] = protocol
    requestData['server']   = server
    requestData['ssl']      = ssl
    requestData['web']      = web
    requestData['web_skip'] = web_skip
    
    return requestData
}

function getDDnsConfigs(){
    let filePath = DDCLIENT_CONF_FILE
    let fileContent = readFileSync(filePath, 'utf-8')
    if ( fileContent ) {
        configs = extractDDnsConfigs(fileContent)
        configs = generateFrontendKeys(configs)
        configs['ddns_enabled'] = configs['ddns_enabled'] === 'true' ? '1' : '0'

        return configs
    }
    else {
        return
    }
}

async function handleDdnsService(requestData){
    let currentDdnsConfigs = getDDnsConfigs()

    if (requestData['ddns_enabled'] === 'true' &&  currentDdnsConfigs['ddns_enabled'] === '1'){
        await executeCommand('sudo systemctl restart ddclient')
    } else if (requestData['ddns_enabled'] === 'true' &&  currentDdnsConfigs['ddns_enabled'] === '0') {
        await executeCommand('sudo systemctl enable ddclinet')
        await executeCommand('sudo systemctl start ddclient')
    } else if (requestData['ddns_enabled'] === 'false' &&  currentDdnsConfigs['ddns_enabled'] === '1') {
        await executeCommand('sudo systemctl disable ddclinet')
        await executeCommand('sudo systemctl stop ddclient')
    } else if (requestData['ddns_enabled'] === 'false' &&  currentDdnsConfigs['ddns_enabled'] === '0'){
        await executeCommand('sudo systemctl stop ddclient')
    }
}

async function editDDnsConfigs(requestData){
    let filePath = DDCLIENT_CONF_FILE
    
    requestData = getProviderConfigs(requestData)
    requestData['ddns_enabled'] = requestData['ddns_enabled'] === '1' ? 'true' : 'false'

    let newFileContent = 
    `#ddns_enabled=${requestData['ddns_enabled']}
    use=web, web=${requestData['web']}, web-skip=${requestData['web-skip']}
    protocol=${requestData['protocol']}
    ssl=${requestData['ssl']}
    server=${requestData['server']}
    login=${requestData['username']}
    password=${requestData['password']}
    ${requestData['domain']}`;

    writeFileSync(filePath, newFileContent, 'utf-8')
    
    await handleDdnsService(requestData)
}

module.exports = {
    getDDnsConfigs,
    editDDnsConfigs
}