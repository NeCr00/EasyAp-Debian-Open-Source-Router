#!/bin/bash

sudo touch /etc/dnsmasq.d/static_leases
sudo dnsmasq --dhcp-hostsfile=/etc/dnsmasq.d/static_leases
