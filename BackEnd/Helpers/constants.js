const EASYAP_CONF_FILE = '/etc/easyap.d/easyap.conf'

const HOSTS_FILE = '/etc/hosts'

const DHCPCD_CONF_FILE = '/etc/dhcpcd.conf'

const HOSTAPD_CONFIG_FILE = '/etc/hostapd/hostapd.conf'
const HOSTAPD_CONFIG_DEFAULT_FILE = '/etc/hostapd/hostapd.conf.default'

const DDCLIENT_CONF_FILE = '/etc/ddclient.conf'
const DDCLIENT_CONF_DEFAULT_FILE = '/etc/ddclient.conf.default'

const IPTABLES_LOG_FILE = '/var/log/iptables.log'

const OVPN_CLIENT_CONFIG_FILE = '/etc/openvpn/client.conf'
const OVPN_CLIENT_AUTH_FILE   = '/etc/openvpn/client/auth'
const OVPN_LOG_FILE           = '/var/log/easyap/openvpn.log'

const DNSMASQ_CONF_FILE = '/etc/dnsmasq.conf'
const DNSMASQ_CONF_DEFAULT_FILE = '/etc/dnsmasq.conf.default'
const DNSMASQ_LEASES_FILE = '/var/lib/misc/dnsmasq.leases'
const DNSMASQ_STATIC_LEASES_FILE = '/etc/dnsmasq.d/static_leases'

module.exports = {
    EASYAP_CONF_FILE,

    HOSTS_FILE,

    DHCPCD_CONF_FILE,

    HOSTAPD_CONFIG_FILE,
    HOSTAPD_CONFIG_DEFAULT_FILE,

    DDCLIENT_CONF_FILE,
    DDCLIENT_CONF_DEFAULT_FILE,

    IPTABLES_LOG_FILE,

    OVPN_CLIENT_CONFIG_FILE,
    OVPN_CLIENT_AUTH_FILE,
    OVPN_LOG_FILE,

    DNSMASQ_CONF_FILE,
    DNSMASQ_CONF_DEFAULT_FILE,
    DNSMASQ_LEASES_FILE,
    DNSMASQ_STATIC_LEASES_FILE,
}