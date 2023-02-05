#!/bin/bash

echo "Enter the interface which the Access Point will use: "
read interface
echo "Configuring the Access Point using the $interface interface ..."
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

#------------------------------------------------------------------------------------------------
#Configuring ip forwarding for the access point
# Check if the file exists
if [ -f /etc/sysctl.d/routed-ap.conf ]; then
  echo "The file exists, updating the content..."
  echo "# Enable IPv4 routing
net.ipv4.ip_forward=1" | sudo tee /etc/sysctl.d/routed-ap.conf
else
  echo "The file does not exist, creating it..."
  sudo touch /etc/sysctl.d/routed-ap.conf
  echo "# Enable IPv4 routing
net.ipv4.ip_forward=1" | sudo tee /etc/sysctl.d/routed-ap.conf
fi

if [ $? -eq 0 ]; then
  echo "File /etc/sysctl.d/routed-ap.conf created/updated successfully."
else
  echo "Error: Failed to create/update the file /etc/sysctl.d/routed-ap.conf."
  exit 1
fi
#------------------------------------------------------------------------------------------------

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

#------------------------------------------------------------------------------------------------
#Configuring the Dnsmasq server
# Rename the default configuration file and create a new one
echo "Renaming the default configuration file..."
sudo mv /etc/dnsmasq.conf /etc/dnsmasq.conf.orig

if [ $? -eq 0 ]; then
  echo "Default configuration file renamed successfully."
else
  echo "Error: Renaming the default configuration file failed."
  exit 1
fi

echo "Creating a new configuration file..."
sudo touch /etc/dnsmasq.conf

if [ $? -eq 0 ]; then
  echo "New configuration file created successfully."
else
  echo "Error: Creating the new configuration file failed."
  exit 1
fi

# Add the following to the file
echo "Adding the following to the configuration file..."
echo "interface=$interface # Listening interface
dhcp-range=192.168.4.2,192.168.4.20,255.255.255.0,24h
                # Pool of IP addresses served via DHCP
domain=wlan     # Local wireless DNS domain
address=/gw.wlan/192.168.4.1
                # Alias for this router" | sudo tee -a /etc/dnsmasq.conf

if [ $? -eq 0 ]; then
  echo "Content added to the configuration file successfully."
else
  echo "Error: Adding content to the configuration file failed."
  exit 1
fi
#------------------------------------------------------------------------------------------------

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

#------------------------------------------------------------------------------------------------
# Ask user for SSID and WPA passphrase
echo "Enter the SSID for the network:"
read ssid

echo "Enter the WPA passphrase for the network:"
read wpa_passphrase

# Create /etc/hostapd/hostapd.conf if it doesn't exist
if [ ! -f /etc/hostapd/hostapd.conf ]; then
  sudo touch /etc/hostapd/hostapd.conf
fi

# Write the new configuration to the file
sudo bash -c "cat > /etc/hostapd/hostapd.conf <<EOF
country_code=GR
interface=wlan0
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
  echo "The configuration was added successfully."
else
  echo "Error: failed to add the configuration."
  exit 1
fi
#------------------------------------------------------------------------------------------------

#------------------------------------------------------------------------------------------------

#Restarting all the services to start the Access Point
echo "Rebooting system..."
sudo systemctl reboot
if [ $? -eq 0 ]; then
  echo "System rebooted successfully. Access Point should be up !"
else
  echo "Error: System reboot failed."
  exit 1
fi