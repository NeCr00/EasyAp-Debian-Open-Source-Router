const fs = require('fs')

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

function readVPNConfig() {
    try {
        // Read the OpenVPN configuration file
        const config = fs.readFileSync('/etc/openvpn/client.conf', 'utf-8');

        return config;
    } catch (error) {
        return { error: true, message: `Error writing OpenVPN configuration to disk: ${error}` }
    }
}

async function startVPN() {
    try {
        // Start the OpenVPN client
        await exec('sudo systemctl restart openvpn@client');
        // adds the iptable rule to enable vpn tunneling
        return configureVpnRule()

    } catch (error) {
        return { error: true, message: `Error starting VPN connection: ${error}` }
    }
}

async function stopVPN() {
    try {
        await exec('sudo systemctl stop openvpn@client');
        return deleteVpnRule()
        

    } catch (error) {
        return { error: true, message: `Error writing OpenVPN configuration to disk: ${error}` }
    }
}



module.exports = {
    startVPN,
    stopVPN,
    readVPNConfig,
    writeVPNConfig,
    configureVpnRule,
    deleteVpnRule
}