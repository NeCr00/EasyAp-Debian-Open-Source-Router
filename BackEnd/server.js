// 'use strict'
const {IP2Location} = require("ip2location-nodejs");
const express = require('express');

// ExpressJS initialization
const app = express();
const port = 3000;

// IP2Location initialization
const ip2location = new IP2Location();
ip2location.open("./IP2LOCATION-LITE-DB1.IPV6.BIN");

// Testing IP2Location functionality
let testip = ['8.8.8.8', '2404:6800:4001:c01::67'];
for (var x = 0; x < testip.length; x++) {
	let result = ip2location.getAll(testip[x]);
	// Keys that can be extracted:
	// ip, ipNo, contryLong, countryShort
	
	console.log(`\nIP ${result['ip']} \nCountry Name: ${result['countryLong']} \nCountry Code: ${result['countryShort']}`)
}
ip2location.close();

app.listen(port, () => {
	console.log(`\nExample app listening on port ${port} ...`)
});

// Home - Dashboard
app.get('/', (req, res) => {
	res.send('Hello World!');
});

// DHCP Server
app.get('/dhcp', (req, res) => {
	res.send('Hellow World!');
});

// Dynamic DNS
app.get('/ddns', (req, res) => {
	res.send('Hellow World!');
});

// VPN
app.get('/vpn', (req, res) => {
	res.send('Hellow World!');
});

// Firewall
app.get('/firewall', (req, res) => {
	res.send('Hellow World!');
});

// Data Usage
app.get('/data', (req, res) => {
	res.send('Hellow World!');
});

// Settings
app.get('/settings', (req, res) => {
	res.send('Hellow World!');
});

// About
app.get('/about', (req, res) => {
	res.send('Hellow World!');
});