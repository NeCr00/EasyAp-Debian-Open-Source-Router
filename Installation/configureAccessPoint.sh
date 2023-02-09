#!/bin/bash

echo "Enter the interface which the Access Point will use: "
read interface
echo "Configuring the Access Point using the $interface interface ..."

# TODO: wpa_supplicant configuration

#------------------------------------------------------------------------------------------------
#Setting up EasyAP config file based on user input

EASYAP_CONF_FILE=/etc/easyap.d/easyap.conf

sudo mkdir /etc/easyap.d/
sudo touch $EASYAP_CONF_FILE

sudo bash -c "cat > $EASYAP_CONF_FILE <<EOF
interface=$interface
EOF"

#------------------------------------------------------------------------------------------------
# Unmask hostapd
echo "Unmasking hostapd..."
sudo systemctl unmask hostapd

if [ $? -eq 0 ]; then
  echo "hostapd unmasked successfully."
else
  echo "Error: hostapd unmasking failed."
  exit 1
fi

# Enable hostapd
echo "Enabling hostapd..."
sudo systemctl enable hostapd

if [ $? -eq 0 ]; then
  echo "hostapd enabled successfully."
else
  echo "Error: hostapd enabling failed."
  exit 1
fi

#------------------------------------------------------------------------------------------------
# Install netfilter-persistent and iptables-persistent
echo "Installing netfilter-persistent and iptables-persistent..."
sudo DEBIAN_FRONTEND=noninteractive apt install -y netfilter-persistent iptables-persistent

if [ $? -eq 0 ]; then
  echo "netfilter-persistent and iptables-persistent installed successfully."
else
  echo "Error: netfilter-persistent and iptables-persistent installation failed."
  exit 1
fi

echo "Script execution complete."

#------------------------------------------------------------------------------------------------
# Add the static IP address configuration
echo "Adding the static IP address configuration..."
if echo -e "interface $interface\n    static ip_address=192.168.4.1/24\n    nohook wpa_supplicant" | sudo tee -a /etc/dhcpcd.conf > /dev/null; then
  echo "Static IP address configuration added successfully."
else
  echo "Error: Static IP address configuration addition failed."
  exit 1
fi

#------------------------------------------------------------------------------------------------
#Configuring ip forwarding for the access point

ROUTED_AP_CONF_FILE=/etc/sysctl.d/routed-ap.conf

# Check if the file exists
if [ -f $ROUTED_AP_CONF_FILE ]; then
  echo "The file exists, updating the content..."
  echo "# Enable IPv4 routing
net.ipv4.ip_forward=1" | sudo tee $ROUTED_AP_CONF_FILE
else
  echo "The file does not exist, creating it..."
  sudo touch $ROUTED_AP_CONF_FILE
  echo "# Enable IPv4 routing
net.ipv4.ip_forward=1" | sudo tee $ROUTED_AP_CONF_FILE
fi

if [ $? -eq 0 ]; then
  echo "File $ROUTED_AP_CONF_FILE created/updated successfully."
else
  echo "Error: Failed to create/update the file $ROUTED_AP_CONF_FILE."
  exit 1
fi

#------------------------------------------------------------------------------------------------
# Apply NAT to the Ethernet interface
echo "Applying NAT to the Ethernet interface..."
sudo iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE

if [ $? -eq 0 ]; then
  echo "NAT applied successfully."
else
  echo "Error: NAT application failed."
  exit 1
fi

# Save iptables
echo "Saving iptables..."
sudo netfilter-persistent save

if [ $? -eq 0 ]; then
  echo "iptables saved successfully."
else
  echo "Error: iptables save failed."
  exit 1
fi

#------------------------------------------------------------------------------------------------
#Configuring the Dnsmasq server

DNSMASQ_CONF_FILE=/etc/dnsmasq.conf

# Add the following to the file
echo "Adding the following to the configuration file..."
echo "interface=$interface # Listening interface
dhcp-range=192.168.4.2,192.168.4.20,255.255.255.0,24h
                # Pool of IP addresses served via DHCP
domain=wlan     # Local wireless DNS domain
address=/gw.wlan/192.168.4.1
                # Alias for this router" | sudo tee -a $DNSMASQ_CONF_FILE

if [ $? -eq 0 ]; then
  echo "Dnsmasq configuration file added successfully."
else
  echo "Error: Adding content to the configuration file failed."
  exit 1
fi

sudo cp -f $DNSMASQ_CONF_FILE $DNSMASQ_CONF_FILE.default || { echo "Error: default dnsmasq file creation failed"; exit 1; }

#------------------------------------------------------------------------------------------------
# Ensure WiFi radio is not blocked on your Raspberry Pi

echo "Unblocking wlan..."
sudo rfkill unblock wlan

if [ $? -eq 0 ]; then
  echo "wlan unblocked successfully."
else
  echo "Error: wlan unblocking failed."
  exit 1
fi

#------------------------------------------------------------------------------------------------
# Ask user for SSID and WPA passphrase
echo "Enter the SSID for the network:"
read ssid

echo "Enter the WPA passphrase for the network:"
read wpa_passphrase

HOSTAPD_CONF_FILE=/etc/hostapd/hostapd.conf

# Create /etc/hostapd/hostapd.conf if it doesn't exist
if [ ! -f $HOSTAPD_CONF_FILE ]; then
  sudo touch $HOSTAPD_CONF_FILE
fi

# Write the new configuration to the file
sudo bash -c "cat > $HOSTAPD_CONF_FILE <<EOF
country_code=GR
interface=$interface
ssid=$ssid
hw_mode=g
channel=7
macaddr_acl=0
auth_algs=1
ignore_broadcast_ssid=0
wpa=2
wpa_passphrase=$wpa_passphrase
wpa_key_mgmt=WPA-PSK
wpa_pairwise=TKIP
rsn_pairwise=CCMP
EOF"

if [ $? -eq 0 ]; then
  echo "The hostapd configuration was added successfully."
else
  echo "Error: failed to add the configuration."
  exit 1
fi

sudo cp -f $HOSTAPD_CONF_FILE $HOSTAPD_CONF_FILE.default || { echo "Error: default hostapd file creation failed"; exit 1; }

#------------------------------------------------------------------------------------------------
#Enable Custom path for ipatables Logs

RSYSLOG_IPTABLES_CONF_FILE=/etc/rsyslog.d/90-my_iptables.conf
EASYAP_IPTABLES_LOG_FILE=/var/log/easyap/iptables.log

sudo iptables -A INPUT -j LOG  --log-level 7 --log-prefix='[netfilter] '

sudo touch $RSYSLOG_IPTABLES_CONF_FILE

sudo echo ":msg,contains,"[netfilter] " -$EASYAP_IPTABLES_LOG_FILE" > $RSYSLOG_IPTABLES_CONF_FILE

sudo echo  "& ~" >> $RSYSLOG_IPTABLES_CONF_FILE

sudo systemctl restart rsyslog

echo "Adding iptables logging rules"
sudo iptables -A INPUT -j LOG  --log-level 7 --log-prefix='[netfilter] ' || { echo "Error: iptables rule addition failed"; exit 1; }
echo "iptables rule added successfully"

echo "Creating $RSYSLOG_IPTABLES_CONF_FILE file"
sudo touch $RSYSLOG_IPTABLES_CONF_FILE || { echo "Error: file creation failed"; exit 1; }
echo "File created successfully"

echo "Adding contents to $RSYSLOG_IPTABLES_CONF_FILE file"
sudo echo ":msg,contains,'[netfilter] ' -$EASYAP_IPTABLES_LOG_FILE" > $RSYSLOG_IPTABLES_CONF_FILE || { echo "Error: Failed to add contents to the file"; exit 1; }
sudo echo  "& ~" >> $RSYSLOG_IPTABLES_CONF_FILE || { echo "Error: Failed to add contents to the file"; exit 1; }
echo "Contents added successfully"

#------------------------------------------------------------------------------------------------
#Create a blank configuration file for ddclient
DDCLIENT_CONF_FILE=/etc/ddclient.conf
sudo bash -c "cat > $DDCLIENT_CONF_FILE <<EOF
#ddns_enabled=false
use=web
ssl=no
protocol=
server=
login=
password=
EOF"

if [ $? -eq 0 ]; then
  echo "The ddclient configuration was added successfully."
else
  echo "Error: failed to add the configuration."
  exit 1
fi

sudo cp -f $DDCLIENT_CONF_FILE $DDCLIENT_CONF_FILE.default || { echo "Error: default ddclient file creation failed"; exit 1; }

#------------------------------------------------------------------------------------------------
#Configure the DHCP Static IP Address configuration File

DNSMASQ_STATIC_LEASES_FILE=/etc/dnsmasq.d/static_leases

sudo touch $DNSMASQ_STATIC_LEASES_FILE || {echo "Error: Failed to configure the DHCP Static IP Address configuration"}
sudo dnsmasq --dhcp-hostsfile=$DNSMASQ_STATIC_LEASES_FILE || {echo "Error: Failed to configure the DHCP Static IP Address configuration"}

#------------------------------------------------------------------------------------------------
# Installing and Configuring the MongoDB
echo "Adding MongoDB repository to sources list..."
if ! sudo apt-get update && sudo apt-get upgrade -y && sudo apt-get install gnupg -y; then
  echo "Error: Failed to install required packages."
  exit 1
fi

if ! wget -qO - https://www.mongodb.org/static/pgp/server-4.4.asc | sudo apt-key add -; then
  echo "Error: Failed to add MongoDB key to apt."
  exit 1
fi

echo "deb [ arch=arm64 ] https://repo.mongodb.org/apt/debian buster/mongodb-org/4.4 main" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.4.list

echo "Installing MongoDB..."
if ! sudo apt-get update && sudo apt-get install mongodb-org -y; then
  echo "Error: Failed to install MongoDB."
  exit 1
fi

echo "Starting MongoDB service..."
if ! sudo systemctl start mongod && sudo systemctl enable mongod; then
  echo "Error: Failed to start MongoDB service."
  exit 1
fi

echo "MongoDB installation complete."

#------------------------------------------------------------------------------------------------
#Setup web server as system service

EASYAP_SERVICE_FILE=/etc/systemd/system/easyap.service
WEB_SERVER_FILE=$(readlink -f ../BackEnd/app.js)

sudo bash -c "echo > $EASYAP_SERVICE_FILE
[Unit]
Description=EasyAP Web Server
After=network.target

[Service]
User=root
Group=root
ExecStart=/usr/bin/node $WEB_SERVER_FILE
Restart=on-failure

[Install]
WantedBy=multi-user.target
"

sudo systemctl daemon-reload
sudo systemctl enable easyap
sudo systemctl start easyap

#------------------------------------------------------------------------------------------------
#Restarting all the services to start the Access Point and apply all the changes to the services

echo "Rebooting services..."
sudo systemctl reboot
if [ $? -eq 0 ]; then
  echo "Services rebooted successfully.\n Access Point should be up !"
else
  echo "Error: Services reboot failed."
  exit 1
fi
