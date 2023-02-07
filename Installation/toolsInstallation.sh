#!/bin/bash

# Update package list and upgrade existing packages
echo "Updating package list and upgrading existing packages..."
sudo apt update -y && sudo apt upgrade -y



tools=(dnsmasq hostapd iptables openvpn fail2ban tcpdump)

echo "Installing tools..."

for tool in "${tools[@]}"; do
  echo "Installing $tool..."
  if sudo apt-get install -y "$tool" 2>/dev/null; then
    echo "$tool was installed successfully."
  else
    echo "Error: $tool installation failed."
  fi
done

if sudo DEBIAN_FRONTEND=noninteractive apt install ddclient -y 2>/dev/null; then
    echo "$tool was installed successfully."
else
echo "Error: $tool installation failed."
fi



echo "Tools Installation process complete."