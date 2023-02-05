#!/bin/bash

# Update package list and upgrade existing packages
echo "Updating package list and upgrading existing packages..."
sudo apt update -y && sudo apt upgrade -y

#!/bin/bash

spin() {
  spinner="/|\\-/|\\-"
  while :; do
    for i in $(seq 0 7); do
      echo -n "${spinner:$i:1}"
      echo -en "\010"
      sleep 0.2
    done
  done
}

tools=(dnsmasq hostapd iptables openvpn fail2ban tcpdump)

echo "Installing tools..."
spin &

# Save the PID of the spinner function
SPIN_PID=$!

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

# Kill the spinner
kill $SPIN_PID

echo "Installation process complete."