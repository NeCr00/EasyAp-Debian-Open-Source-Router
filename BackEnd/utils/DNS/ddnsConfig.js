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
    //TODO
}

module.exports = {
    getDDnsConfigs,
    editDDnsConfigs
}