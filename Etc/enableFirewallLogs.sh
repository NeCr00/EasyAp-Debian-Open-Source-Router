#!/usr/bin/env bash


sudo iptables -A INPUT -j LOG  --log-level 7 --log-prefix='[netfilter] '

sudo touch /etc/rsyslog.d/00-my_iptables.conf

sudo echo ":msg,contains,"[netfilter] " -/var/log/easyap/iptables.log" > /etc/rsyslog.d/00-my_iptables.conf

sudo echo  "& ~" >> /etc/rsyslog.d/00-my_iptables.conf

sudo service rsyslog restart