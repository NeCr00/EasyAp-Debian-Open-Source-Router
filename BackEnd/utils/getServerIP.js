const { spawn } = require('node:child_process')
const assert = require('assert')
var geoip = require('geoip-lite');
const fs = require('fs');
const Geolocation = require('../Database/Model/Geolocation');



function insertServerData(item) {

	isCountry = Geolocation.findOne({ countryNameShort: item.country }).exec()
	assert.ok(isCountry instanceof Promise);

	isCountry.then(async function (doc) {
		if (!doc) {
			console.log(1)
			create = Geolocation.create({ countryNameShort: item.country, requestCounter: item.num_of_requests })

		}
		else{
			sum_of_requests = doc.requestCounter + item.num_of_requests
			update = await Geolocation.findOneAndUpdate({countryNameShort:item.country},{requestCounter:sum_of_requests},{new:true})
			console.log(update)
		}
	})
}

function getServerIP(ips, num_of_requests_per_ip) {
	data = []

	ips.forEach(ip => {
		let geolocation = geoip.lookup(ip);
		if (geolocation) {
			index = -1
			if (data) {
				index = data.findIndex((element) => element.country === geolocation.country)
				if (index>-1){
					data[index].num_of_requests = data[index].num_of_requests+num_of_requests_per_ip[ip]
				}
				
			}
				if(index==-1)
				data.push({ "ip": ip, "country": geolocation.country, "num_of_requests": num_of_requests_per_ip[ip] })
				
		}
	})

	data.forEach(async item => {
		let x = await insertServerData(item)

	})
}


function FilterIP(data) {
	//get ips from tcpdump results

	getIpRegex = new RegExp('(\\b25[0-5]|\\b2[0-4][0-9]|\\b[01]?[0-9][0-9]?)(\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}', 'g')
	Ips = data.match(getIpRegex)
	if (Ips) {
		//remove private ips
		isprivate = new RegExp('^192|10|172', 'g')
		Ips = Ips.filter(ip => {
			!isprivate.test(ip)
			if (!isprivate.test(ip)) {
				return ip
			}

		})

		//count the number of requests for each IP
		num_of_requests_per_ip = {}

		Ips.forEach(ip => {
			num_of_requests_per_ip[ip] = (num_of_requests_per_ip[ip] || 0) + 1
		})

		Ips = [...new Set(Ips)]
		console.log(num_of_requests_per_ip)
		getServerIP(Ips, num_of_requests_per_ip)

	}

}


function getNetworkMonitorResults() {
	fs.readFile(__dirname + '/../somefile.txt', 'utf8', (err, data) => {
		if (err) {
			console.error(err);
			return;
		}
		FilterIP(data)

	});


}

function monitorNetworkConnections() {

	const stdio = [
		0,
		fs.openSync(__dirname + '/../../Logs/networkMonitor.txt', 'w'),
		fs.openSync(__dirname + '/../../Logs/erros.txt', 'w')
	];


	const child = spawn('sh', ["-c", " sudo  tcpdump -i wlo1  -nn -q ip --direction=in | tee somefile.txt "], { stdio, detached: true });


	setTimeout(async function () {
		process.kill(child.pid)

		getNetworkMonitorResults()
		monitorNetworkConnections()

	}, 5000);


}

module.exports = { getServerIP, monitorNetworkConnections }