const { exec } = require('child_process');

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