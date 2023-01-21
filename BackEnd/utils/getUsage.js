var os = require("os");
var disk = require('diskusage');

//Create function to get CPU information
function cpuAverage() {

  //Initialise sum of idle and time of cores and fetch CPU info
  var totalIdle = 0, totalTick = 0;
  var cpus = os.cpus();

  //Loop through CPU cores
  for (var i = 0, len = cpus.length; i < len; i++) {

    //Select CPU core
    var cpu = cpus[i];

    //Total up the time in the cores tick
    for (type in cpu.times) {
      totalTick += cpu.times[type];
    }

    //Total up the idle time of the core
    totalIdle += cpu.times.idle;
  }

  //Return the average Idle and Tick times
  return { idle: totalIdle / cpus.length, total: totalTick / cpus.length };
}

function calAverageCpu() {
  return new Promise((resolve, reject) => {
    var startMeasure = cpuAverage();
    //Set delay for second Measure
    setTimeout(function () {

      //Grab second Measure
      var endMeasure = cpuAverage();

      //Calculate the difference in idle and total time between the measures
      var idleDifference = endMeasure.idle - startMeasure.idle;
      var totalDifference = endMeasure.total - startMeasure.total;

      //Calculate the average percentage CPU usage
      var percentageCPU = 100 - ~~(100 * idleDifference / totalDifference);
      
      resolve(percentageCPU)
    }, 100);
  });
}



function getUsageMemory() {
  //get free available memory  
  let osFreeMem = os.freemem()
  let allFreeMem = (osFreeMem / (1024 * 1024))

  //get the total memory
  const osTotalMem = os.totalmem()
  const totalMem = (osTotalMem / (1024 * 1024))

  //calculate the used memory by finding the % of free memory minus the 100%
  let percentage_mem = 100 - ((allFreeMem / totalMem) * 100).toFixed(0)

  return percentage_mem
}

function checkDisk() {
  let path = os.platform() === 'win32' ? 'c:' : '/';
return new Promise ((resolve,reject)=>{
  disk.check(path, function (err, info) {
    percentageDisk = 100 - ((info.free/info.total)*100).toFixed(0)
    resolve(percentageDisk)
  });
})
  // Callbacks

}



async function getUsage (){

  //usage cpu
  let usageCpu = await calAverageCpu()
  //usage memory
  let usageMem =  getUsageMemory()
  //usage disk
  let usageDisk = await checkDisk()

  data = [{
    "type": "Cpu",
    "percentage": usageCpu
  }, {
    "type": "Memory",
    "percentage": usageMem
  }, {
    "type": "Disk",
    "percentage": usageDisk
  }]
  
  return data
}


module.exports = {
  getUsage
}