const fs = require('fs')
const util = require('util');
const exec = util.promisify(require('child_process').exec)
const { executeCommand } = require('../../Helpers/executeCommand')

const OVPN_CLIENT_CONFIG_FILE = '/etc/openvpn/client.conf'
const OVPN_LOG_FILE           = '/var/log/easyap/openvpn.log'

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
        let filePath = '/etc/openvpn/client.conf'
        fs.writeFileSync(filePath, config, 'utf8');
        return { error: false, message: 'OpenVPN configuration written to disk successfully' };
    } catch (error) {
        return { error: true, message: `Error writing OpenVPN configuration to disk: ${error}` }
    }
}

function writeVPNConfigGUI(config,username,password,credentials) {
    try {
        // Write the OpenVPN configuration if authentication is enabled
        if(username && password && credentials==='1'){
            config+= '\nauth-user-pass\n'
            config+= username+'\n'
            config+= 'auth-password\n'
        }
        config += '\nlog /var/log/easyap/openvpn.log'
        
        // Write the OpenVPN configuration file to disk
        let filePath = '/etc/openvpn/client.conf'
        fs.writeFileSync(filePath, config, 'utf8');
        return { error: false, message: 'OpenVPN configuration written to disk successfully' };
    } catch (error) {
        return { error: true, message: `Error writing OpenVPN configuration to disk: ${error}` }
    }
}


function readVPNConfig() {
    try {
        // Read the OpenVPN configuration file
        const config = fs.readFileSync('/etc/openvpn/client.conf', 'utf-8');
        return {error:false, config:config}
    } catch (error) {
        return { error: true, message: 'File not found' }
    }
}

async function startVPN() {
    try {
        // Start the OpenVPN client
        await exec('sudo systemctl restart openvpn@client');
        // adds the iptable rule to enable vpn tunneling
        let status = await configureVpnRule()
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
    let stdout = await executeCommand('sudo systemctl status openvpn@client | head -n 3')
    let statusLine = stdout.split('\n')[2].split(': ')[1]
    if (statusLine.includes('inactive')){
        return {vpn_status : 'disconnected'}
    } else {
        return {vpn_status : 'connected'}
    }
} 

async function readVpnLogs() {
    try {
        let stdout = await executeCommand(`sudo tail -n 1000 /var/log/easyap/openvpn.log`)
        return {error:false, logs: stdout}
    } catch (error) {
        return { error: true, message: 'File not found' }
    }
}


module.exports = {
    startVPN,
    stopVPN,
    readVPNConfig,
    writeVPNConfig,
    getVpnStatus,
    writeVPNConfigGUI,
    readVpnLogs
}