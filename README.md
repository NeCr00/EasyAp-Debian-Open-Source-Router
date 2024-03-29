# EasyAp Debian Open-Source Router 

#### This repository contains the code for a project that aims to provide users with a customizable and secure access point solution based on the Debian operating system for single board computers.
---

## About
##### This project was developed as part of the theses of Computer Engineering and Informatics students of University of Patras, Giannis Christodoulakos and Iasonas Pavlakis. The theses were supervised by the department's associate professor Mr. Kyriakos Vlachos.

## Prerequisites
Before starting, you will need the following:

- A single board computer with ARM processor (tested on Raspberry Pi)
- Debian operating system installed


## Installation
To install the project, follow these steps:

1. Clone the repository to your local machine:
    ```bash
    git clone https://github.com/NeCr00/EasyAp-Debian-Open-Source-Router
    cd EasyAp-Debian-Open-Source-Router
    ```
2. Run the installer with sudo:
    ```bash
    sudo Installation/installer.sh
    ```
3. After the installation reboot the machine:
    ```bash
    sudo reboot
    ```
4. Start the router:
    The router is configured as a system service named `easyap`, which is enabled to start on system boot-up from the installation.
    In case you need to disable the service from starting on system boot-up execute the following lines:
    ```bash
    sudo systemctl disable easyap
    sudo systemctl stop easyap
    ```
    In that case, in order to start the web server again, execute the following line:
    ```bash
    sudo node Backend/app.js
    ```
5. Access the web interface 
    ```
    http://[Access point IP]:3000
    ```

## Features
The router solution provides the following features:

- Customizable interface configuration through the configuration file
- DHCP server with customizable IP range
- DNS server with support for dynamic DNS (DDNS)
- Access point (AP) mode for wireless network
- OpenVPN client for secure remote access
- Firewall rules with support for port forwarding and NAT
- Creation of Bind9 Authoritative DNS Server
- User-friendly web interface for configuration and monitoring

## Usage
The web interface can be accessed by navigating to http://[router IP]:3000 in a web browser. From here, the user can configure various settings such as network interface, DHCP range, DNS settings, firewall rules, and VPN configuration.

## Contributing
Contributions to the project are welcome. To contribute, please follow these steps:

1. Fork the repository
2. Make changes to your local copy
3. Submit a pull request to the main repository
