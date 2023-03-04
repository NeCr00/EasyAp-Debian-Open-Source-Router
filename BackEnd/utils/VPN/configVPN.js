const fs = require('fs')
const util = require('util');
const exec = util.promisify(require('child_process').exec)
const { executeCommand } = require('../../Helpers/executeCommand')
const { OVPN_CLIENT_CONFIG_FILE, OVPN_CLIENT_AUTH_FILE, OVPN_LOG_FILE } = require('../../Helpers/constants')

async function configureVpnRule() {
    try {
      // Redirect all traffic from the clients to the VPN tunnel
      await exec('sudo iptables -t nat -A POSTROUTING -o tun0 -j MASQUERADE');
      await exec('sudo sh -c "iptables-save > /etc/iptables.ipv4.nat"');
  
      // Configure dnsmasq to use the VPN connection for DNS queries
      //await exec('sudo bash -c "echo \'server=127.0.0.1#53\' >> /etc/dnsmasq.conf"');
  
      return { error: false, message: 'VPN connection configured successfully' };
    } catch (error) {
      return { error: true, message: 'VPN connection has failed to be established' };
    }
}
  
async function deleteVpnRule() {
      try {
          // Delete the iptables rule to redirect traffic to the VPN tunnel
          await exec('sudo iptables -t nat -D POSTROUTING -o tun0 -j MASQUERADE');
          await exec('sudo sh -c "iptables-save > /etc/iptables.ipv4.nat"');
  
          return { error: false, message: 'VPN connection deleted successfully' };
      } catch (error) {
          return { error: true, message: 'VPN connection has failed to be deleted' };
      }
}

function writeVPNConfig(config) {
    try {
        // Write the OpenVPN configuration file to disk
        let filePath = OVPN_CLIENT_CONFIG_FILE
        fs.writeFileSync(filePath, config, 'utf8');
        return { error: false, message: 'OpenVPN configuration written to disk successfully' };
    } catch (error) {
        return { error: true, message: `Error writing OpenVPN configuration to disk: ${error}` }
    }
}



function writeVPNConfigGUI(config, username, password) {
    try {
        let vpnConfFile = OVPN_CLIENT_CONFIG_FILE
        let vpnAuthenticationFile = OVPN_CLIENT_AUTH_FILE
        let vpnLogFile = OVPN_LOG_FILE

        console.log('WRITE VPN CONFIG FUNCTION')
        console.log(username, password)
        console.log(config)
        
        // Write the OpenVPN configuration if authentication is enabled
        if(username && password){ // when Enabled is selected from GUI
            config = config.replace(/^auth-user-pass\b.*/m, `auth-user-pass ${vpnAuthenticationFile}`);
            fs.writeFileSync(vpnAuthenticationFile, `${username}\n${password}`, 'utf-8')
        }
        
        // Write the OpenVPN configuration file to disk
        if (config !== ''){
            config += `\nlog ${vpnLogFile}\n`
            fs.writeFileSync(vpnConfFile, config, 'utf8');
        }
        
        return { error: false, message: 'OpenVPN configuration written to disk successfully' };
    } catch (error) {
        return { error: true, message: `Error writing OpenVPN configuration to disk: ${error}` }
    }
}

function readVPNAuth(){
    try {
        // Read the OpenVPN configuration file
        let filePath = OVPN_CLIENT_AUTH_FILE
        let fileContent = fs.readFileSync(filePath, 'utf-8');
        fileContent = fileContent.split('\n')

        let authData = {
            username: fileContent[0].trim(),
            password: fileContent[1].trim()
        }

        return {error:false, auth: authData}
    } catch (error) {
        return { error: true, message: 'File not found' }
    }
}

function readVPNConfig() {
    try {
        // Read the OpenVPN configuration file
        let filePath = OVPN_CLIENT_CONFIG_FILE
        const config = fs.readFileSync(filePath, 'utf-8');
        return {error:false, config:config}
    } catch (error) {
        return { error: true, message: 'File not found' }
    }
}

async function startVPN() {
    try {
        // Start the OpenVPN client
        let status = await configureVpnRule()
        await exec('sudo systemctl restart openvpn@client');
        // adds the iptable rule to enable vpn tunneling
        
        return status

    } catch (error) {
        return { error: true, message: `Error starting VPN connection: ${error}` }
    }
}

async function stopVPN() {
    try {
        await exec('sudo systemctl stop openvpn@client');
        let status = await deleteVpnRule()
        return status

    } catch (error) {
        return { error: true, message: `Error writing OpenVPN configuration to disk: ${error}` }
    }
}

async function getVpnStatus() {
    let output = await executeCommand('sudo systemctl status openvpn@client | head -n 3')
    let statusLine = output.stdout.split('\n')[2].split(': ')[1]
    if (statusLine.includes('inactive') || statusLine.includes('activating')){
        return {vpn_status : 'disconnected'}
    } else {
        return {vpn_status : 'connected'}
    }
} 

async function readVpnLogs() {
    try {
        let vpnLogFile = OVPN_LOG_FILE
        let output = await executeCommand(`sudo tail -n 1000 ${vpnLogFile} | tac`)
        return {error:false, logs: output.stdout}
    } catch (error) {
        return { error: true, message: 'File not found' }
    }
}


module.exports = {
    startVPN,
    stopVPN,
    readVPNConfig,
    readVPNAuth,
    writeVPNConfig,
    getVpnStatus,
    writeVPNConfigGUI,
    readVpnLogs
}