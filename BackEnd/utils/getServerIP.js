const { IP2Location } = require("ip2location-nodejs");
const { spawn } = require('node:child_process')
const fs = require('fs');

function getServerIP() {


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
}


function FilterIP(data){
	//get ips from tcpdump results

	getIpRegex= new RegExp('(\\b25[0-5]|\\b2[0-4][0-9]|\\b[01]?[0-9][0-9]?)(\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}', 'g')
	Ips = data.match(getIpRegex)
    
	//remove private ips
	isprivate = new RegExp ('^192|10|172','g')
	Ips = Ips.filter(ip => !isprivate.test(ip))
	
	//count the number of requests for each IP
	num_of_requests_per_ip = {}

	Ips.forEach(ip => {
		num_of_requests_per_ip [ip] = (num_of_requests_per_ip[ip] || 0)+1
	})

	//console.log(num.num_of_requests_per_ip)
	getServerIP()
}


function getNetworkMonitorResults(){
	 fs.readFile(__dirname+'/../somefile.txt', 'utf8', (err, data) => {
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

	const child = spawn('sh', ["-c", " sudo  tcpdump -i wlo1  -nn -q ip --direction=in | tee somefile.txt "], { stdio,detached: true});


	setTimeout(function () {
		process.kill(-child.pid)
		
		getNetworkMonitorResults()
		monitorNetworkConnections()
		
	}, 5000);


}

module.exports = { getServerIP, monitorNetworkConnections }