const express = require('express')
const app = express()
const router = express.Router()
const path = require('path')
const bodyParser = require('body-parser');
const validator = require('../middlewares/dataValidator');
const { getDevices } = require('../utils/Dashboard/getConnectedDevices')
const { getDHCPRangeInfo, getStaticIPs } = require('../utils/DHCP/getDHCPConfigs')
const { editDnsmasqDHCPRange, editDnsmasqStaticIPs } = require('../utils/DHCP/setDHCPConfigs')

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

  router.get('/config', async function (req, res) {

    let data = await getDHCPRangeInfo() 
    res.json(data)

  })

  router.post('/submit', validateSettingsData, async function(req, res) {
    await editDnsmasqDHCPRange(req.body)
    
    if (1){
      res.json({"message":"Changes Applied"})
    }
    else{
      res.json({"error":true,"status":'Something happen, try again !'})
    }

  })



router.get('/static-ips', async function(req, res){
  // let data = [{
  //   "ip": "192.111.111.111",
  //   "mac": "98-1D-20-04-09-B9"
  // }]
  // res.json(data)
  let data = await getStaticIPs() 
  res.json(data);

})


router.post('/static-ips', validateStaticIP, async function(req, res){
  // console.log(req.body)
  
  await editDnsmasqStaticIPs('POST', req.body)

  if (1){
    res.json({"message":"Changes Applied"})
  }
  else{
    res.json({"error":true,"status":'Something happen, try again !'})
  }
})


router.delete('/static-ips', async function(req, res){
  // console.log(req.body)
  
  await editDnsmasqStaticIPs('DELETE', req.body)
    
  if (1){
    res.json({"message":"Changes Applied"})
  }
  else{
    res.json({"error":true,"status":'Something happen, try again !'})
  }
})

module.exports = router;