const { spawn } = require('node:child_process')
const assert = require('assert')
var geoip = require('geoip-lite');
const fs = require('fs');
const Geolocation = require('../../Database/Model/Geolocation');



function insertServerData(item) {

	// Check if this country is already in the collection
	isCountry = Geolocation.findOne({ countryNameShort: item.country }).exec()
	assert.ok(isCountry instanceof Promise);
	
	isCountry.then(async function (doc) {
		// If the country doesn't exist in the collection, creates a new instance with all the data
		if (!doc) {
			//console.log(1)
			create = Geolocation.create({ countryNameShort: item.country, requestCounter: item.num_of_requests })

		}
		//If exists in the collection, add the new number of requests to the previous number of requests and adds it to the collection
		//for the corresponding country
		else {
			sum_of_requests = doc.requestCounter + item.num_of_requests
			update = await Geolocation.findOneAndUpdate({ countryNameShort: item.country }, { requestCounter: sum_of_requests }, { new: true })
			console.log(update)
		}
	})
}

function getServerIPsGeolocation(ips, num_of_requests_per_ip) {
	data = []

	//Get for each IP the Geolocation of the server
	ips.forEach(ip => {
		//get the geolocation of the server using geoip
		let geolocation = geoip.lookup(ip);
		//if geoip found the geolocation 
		if (geolocation) {
			index = -1
			if (data) {
				//if this country is already in the array add the number of requests for this ip
				index = data.findIndex((element) => element.country === geolocation.country)
				if (index > -1) {
					data[index].num_of_requests = data[index].num_of_requests + num_of_requests_per_ip[ip]
				}

			}
			//if the country is not in the array and an new instance for this country
			if (index == -1)
				data.push({ "ip": ip, "country": geolocation.country, "num_of_requests": num_of_requests_per_ip[ip] })

		}
	})

	//Add for each country the new Data
	data.forEach(async item => {
		let x = await insertServerData(item)

	})
}

//This functions gets all the output from the Logs and extracts the ips along with the number of requests per ip
function FilterIP(data) {
	// Regular expression to get IP addresses from the tcpdump results
	const getIpRegex = new RegExp('(\\b25[0-5]|\\b2[0-4][0-9]|\\b[01]?[0-9][0-9]?)(\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}', 'g');

	// Get the IP addresses from the tcpdump results
	let Ips = data.match(getIpRegex);

	// If IP addresses were found
	if (Ips) {
		// Regular expression to check if the IP is a private IP address
		const isprivate = new RegExp('^192|10|172', 'g');

		// Filter out private IP addresses. Returns the new array with all the public IP addresses
		Ips = Ips.filter(ip => {
			!isprivate.test(ip)
			if (!isprivate.test(ip)) {
				return ip;
			}
		});

		// Count the number of requests for each IP address
		let num_of_requests_per_ip = {};
		// Iterate through the array of IP addresses
		Ips.forEach(ip => {
			// Increase the count of requests for each IP address found in the Logs
			num_of_requests_per_ip[ip] = (num_of_requests_per_ip[ip] || 0) + 1;
		});

		// Remove duplicate IP addresses
		Ips = [...new Set(Ips)];

		// Log the number of requests for each IP address
		console.log(num_of_requests_per_ip);

		// Get the server IP if the extracted IPs are 
		getServerIPsGeolocation(Ips, num_of_requests_per_ip);
	}
}



function getNetworkMonitorResults() {
	//read the results for network monitoring from Log File to extract the ips
	fs.readFile(__dirname + '/../../Logs/somefile.txt', 'utf8', (err, data) => {
		if (err) {
			console.error(err);
			return;
		}
		//Extract IPs from the network monitor Logs
		FilterIP(data)

	});


}

// Function to monitor network connections using tcpdump
function monitorNetworkConnections() {
	// // Define standard input/output for the child process
	// const stdio = [
	// 	// Send standard input to /dev/null
	// 	0,
	// 	// Write standard output to networkMonitor.txt file
	// 	fs.openSync(__dirname + '/../../Logs/networkMonitor.txt', 'w'),
	// 	// Write standard error to erros.txt file
	// 	fs.openSync(__dirname + '/../../Logs/erros.txt', 'w')
	// ];

	// Spawn a child process using sh and the tcpdump command
	const child = spawn('sh', ["-c", " sudo  tcpdump -i wlan0  -nn -q ip --direction=in | tee Logs/somefile.txt "], { detached: true });

	// Set a timeout to kill the child process after 5 seconds
	setTimeout(async function () {
		// Kill the child process
		// process.kill(child.pid)
		child.kill()
		// Get the results of the network monitor
		getNetworkMonitorResults()

		// Recursively call the monitorNetworkConnections function
		monitorNetworkConnections()

	}, 5000);
}

module.exports = { getServerIPsGeolocation, monitorNetworkConnections }