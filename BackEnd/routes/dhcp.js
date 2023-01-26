const express = require('express')
const app = express()
const router = express.Router()
const path = require('path')
const bodyParser = require('body-parser');
const validator = require('../middlewares/dataValidator');
const { getDevices } = require('../utils/getConnectedDevices')
const { getDHCPRangeInfo, getStaticIPs } = require('../utils/getDHCPConfigs')
const { editDnsmasqDHCPRange, editDnsmasqStaticIPs } = require('../utils/setDHCPConfigs')

function validateSettingsData(req, res, next) {
  let data = req.body
  let start_ip =validator.validateIP(data.start_ip)
  let end_ip = validator.validateIP(data.end_ip)
  let mask = validator.validateSubMask(data.mask)

  if(start_ip.error)
    res.json({"error":true,"message":start_ip.message})
  else if(end_ip.error)
    res.json({"error":true,"message":end_ip.message})
  else if(mask.error)
    res.json({"error":true,"message":mask.message})
  else
    next()

  
}

function validateStaticIP(req, res, next) { 
  let data = req.body
  let response = {"error": false, "message": ''}
  
  data.forEach(item => {
    let staticIp = validator.validateIP(item.ip)
    let mac = validator.validateMac(item.mac)

    if (staticIp.error || mac.error){
      response.error = true
      response.message = "Invalid MAC or IP!"
      return;
    }
  });
  
  if (response.error)
    res.json(response)
  else
    next()
}

router.get('/', (req, res) => {
   
    res.sendFile(path.join(__dirname,'../../FrontEnd/dhcp.html'));

    
  })

  router.get('/connected_devices', (req, res) => {
   
    getDevices().then(function (devices) {
      res.json(devices);
    }) 
  
  })

  router.get('/config',function (req, res) {

    var config ={
      "dhcp_enable": true,
      "start_ip": '192.1.1.1',
      "end_ip": '192.1.1.1',
      "mask": '255.255.255.0',
      "time": '24h',
      "lease_isEnabled": true
    }
    res.json(config)

    // res.json(getDHCPRangeInfo())


  })

  router.post('/submit', validateSettingsData, function(req, res) {
    editDnsmasqDHCPRange(req.body)
    
    if (1){
      res.json({"message":"Changes Applied"})
    }
    else{
      res.json({"error":true,"status":'Something happen, try again !'})
    }

  })



router.get('/static-ips', function(req, res){
  let data = [{
    "ip": "192.111.111.111",
    "mac": "98-1D-20-04-09-B9"
  }]
  res.json(data)
  // getStaticIPs().then(function (staticIPs) {
  //   res.json(staticIPs);
  // })

})


router.post('/static-ips', validateStaticIP, function(req, res){
  console.log(req.body)
  
  // editDnsmasqStaticIPs('POST', req.body)

  if (1){
    res.json({"message":"Changes Applied"})
  }
  else{
    res.json({"error":true,"status":'Something happen, try again !'})
  }
})


router.delete('/static-ips', function(req, res){
  console.log(req.body)
  
  // editDnsmasqStaticIPs('DELETE', req.body)
    
  if (1){
    res.json({"message":"Changes Applied"})
  }
  else{
    res.json({"error":true,"status":'Something happen, try again !'})
  }
})

module.exports = router;