const fs = require('fs');

function extractInterface() {
  const config = fs.readFileSync('/etc/easyap.d/easyap.conf', 'utf-8');
  let interfaceMatch = config.match(/^interface=(.*)$/m);
  if (interfaceMatch) {
    return interfaceMatch[1].trim();
  } else {
    throw new Error('Interface variable not found in configuration file.');
  }
}

function extractRouterInterface() {
  const config = fs.readFileSync('/etc/easyap.d/easyap.conf', 'utf-8');
  let routerInterfaceMatch = config.match(/^router_interface=(.*)$/m);
  if (routerInterfaceMatch) {
    return routerInterfaceMatch[1].trim();
  } else {
    throw new Error('Router interface variable not found in configuration file.');
  }
}

module.exports ={
    extractInterface,
    extractRouterInterface
}