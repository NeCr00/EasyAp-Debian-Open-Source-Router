const express = require('express')
const app = express()
const router = express.Router()
const path = require('path')
const bodyParser = require('body-parser');
const { startVPN, stopVPN, readVPNConfig, readVPNAuth, writeVPNConfig, getVpnStatus, writeVPNConfigGUI, readVpnLogs } = require('../utils/VPN/configVPN');


router.get('/', (req, res) => {
   
  res.sendFile(path.join(__dirname,'../../FrontEnd/vpn.html'));
  
    
})

router.get('/status', async (req, res) => {
  
  let status = await getVpnStatus()
  res.json(status)
})

router.post('/connect', async (req, res) => {
  
  let connected = await startVPN()
  
  if(connected.error){
    res.json({error:true, message:'Cannot connect to VPN'})
  }
  else{
    res.json({error:false, message:'Connected to VPN'})
  }
})

router.post('/disconnect', async (req, res) => {

  let disconnected = await stopVPN()
  console.log(disconnected)
  if(disconnected.error){
    res.json({error:true, message:'Cannot disconnect to VPN'})
  }
  else{
    res.json({error:false, message:'disconnected to VPN'})
  }
})



router.post('/config_file/upload', (req, res) => {

  let config = req.body.file
  let username = req.body.username
  let password = req.body.password

  applied = writeVPNConfigGUI(config, username, password)
  
  if(applied.error){
    res.json({error:true, message:applied.error})
  }
  else{
    res.json({error:false, message:'VPN file uploaded successfully'})
  }
  
})

router.get('/config_file', (req, res) => {
  
  let configFile = readVPNConfig()
  let authData = readVPNAuth()
  let data = {}

  if(configFile.error)
  {
    res.json({"file":"No Data to Preview"})
  }
  else{
    data['file'] = configFile.config
    if (authData.username !== '' && authData.password !== '')
      data['auth'] = authData.auth
    
    res.json(data)
  }
  
})

router.post('/config_file', (req, res) => {
  
  let config = req.body.data

  let applied = writeVPNConfig(config)
  
  if(applied.error){
    res.json({error:true, message:applied.error})
  }
  else{
    res.json({error:false, message:'VPN file uploaded successfully'})
  }
  
})


router.get('/logs', async (req, res) => {
  
  let logs = await readVpnLogs()
  res.json({"file": logs.logs})
    
})
 

module.exports = router;