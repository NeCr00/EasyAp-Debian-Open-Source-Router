#!/usr/bin/env bash


sudo iptables -A INPUT -j LOG  --log-level 7 --log-prefix='[netfilter] '

sudo touch /etc/rsyslog.d/00-my_iptables.conf

sudo echo ":msg,contains,"[netfilter] " -/var/log/easyap/iptables.log" > /etc/rsyslog.d/00-my_iptables.conf

sudo echo  "& ~" >> /etc/rsyslog.d/00-my_iptables.conf

sudo service rsyslog restart

echo "Adding iptables logging rules"
sudo iptables -A INPUT -j LOG  --log-level 7 --log-prefix='[netfilter] ' || { echo "Error: iptables rule addition failed"; exit 1; }
echo "iptables rule added successfully"

echo "Creating /etc/rsyslog.d/00-my_iptables.conf file"
sudo touch /etc/rsyslog.d/00-my_iptables.conf || { echo "Error: file creation failed"; exit 1; }
echo "File created successfully"

echo "Adding contents to /etc/rsyslog.d/00-my_iptables.conf file"
sudo echo ":msg,contains,'[netfilter] ' -/var/log/easyap/iptables.log" > /etc/rsyslog.d/00-my_iptables.conf || { echo "Error: Failed to add contents to the file"; exit 1; }
sudo echo  "& ~" >> /etc/rsyslog.d/00-my_iptables.conf || { echo "Error: Failed to add contents to the file"; exit 1; }
echo "Contents added successfully"

echo "Restarting rsyslog service"
sudo service rsyslog restart || { echo "Error: Failed to restart rsyslog service"; exit 1; }
echo "Logs for iptables has been enabled successfully"
