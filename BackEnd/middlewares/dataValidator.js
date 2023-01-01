

function validateIP (ip) {
    let regex = new RegExp('^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$')
    let isValid = regex.test(ip)
    
    if(isValid) {
        return {"error":false}
    }
    else {
        return {"error":true,"message":"Invalid IP"}
    }
}

function validatePort (port) {
    let regex = new RegExp('^([1-9][0-9]{0,3}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])$')
    let isValid = regex.test(port)
    
    if(isValid) {
        return {"error":false}
    }
    else {
        return {"error":true,"message":"Invalid port number"}
    }


}

function validateMac (mac) {
    let regex = new RegExp('([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$')
    let isValid = regex.test(mac)
    
    if(isValid) {
        return {"error":false}
    }
    else {
        return {"error":true,"message":"Invalid MAC address"}
    }
}

function validateSubMask (mask) {
    
        let regex = new RegExp('^(255)\.(0|128|192|224|240|248|252|254|255)\.(0|128|192|224|240|248|252|254|255)\.(0|128|192|224|240|248|252|254|255)')
        let isValid = regex.test(mask)
        
        if(isValid) {
            return {"error":false}
        }
        else {
            return {"error":true,"message":"Invalid subnet mask"}
        }
    
}



exports.validateIP = validateIP;
exports.validatePort = validatePort;
exports.validateMac = validateMac;
exports.validateSubMask = validateSubMask;
