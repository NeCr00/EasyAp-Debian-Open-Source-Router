const express = require('express')
const app = express()
const router = express.Router()
const path = require('path')
const bodyParser = require('body-parser');
const { response } = require('express');
const { startVPN, stopVPN, readVPNConfig, writeVPNConfig } = require('../utils/VPN/configVPN')
const { extractVPNConfig } = require('../utils/VPN/extractVpnConfig')



router.get('/', (req, res) => {
   
    res.sendFile(path.join(__dirname,'../../FrontEnd/vpn.html'));
    extractVPNConfig()
    
})

router.post('/connect', (req, res) => {
  
  let connected = {}

  startVPN()

  if(connected.error){
    res.json({error:true,message:'Cannot connect to VPN'})
  }
  else{
    res.json({error:false,message:'Connected to VPN'})
  }
})

router.post('/disconnect', (req, res) => {
  if(connected.error){
    res.json({error:true,message:'Cannot disconnect to VPN'})
  }
  else{
    res.json({error:false,message:'disconnected to VPN'})
  }
})

router.get('/config', (req, res) => {
  
  let data = {
    "vpn_enable": '0',
    "ssid": 'test',
    "port": '1',
    "protocol": 'Select',
    "enc_cipher": 'Select',
    "hash": 'Select',
    "cred_enable": '1',
    "username": '1',
    "password": 'test',
    "tls_cipher": 'Select',
    "key_pass": 'test',
    "tls_auth_key": 'test',
    "ca_cert": 'test',
    "pub_cert": 'test',
    "pri_cert": 'test',
    "add_config": 'test'
  }

  res.json(data)
  
})


router.post('/config', (req, res) => {
  
  let data = req.body

  console.log(data)

  if (1){
    res.json({"message":"Changes Applied"})
  }
  else{
    res.json({"error":true,"status":'Something happen, try again !'})
  }
  
})




router.get('/config_file', (req, res) => {
  
  res.json({"file":"This is the file overview"})
  
})

router.post('/config_file', (req, res) => {
  // console.log(req.body)
  let config = req.body.data
  
  config = config.split('\n').join('\n')
  console.log(config)
  res.json(writeVPNConfig(config))
  // res.json({"file":"This is the file overview"})
  
})


router.get('/logs', (req, res) => {
  
  res.json({"file":"This is the logs"})
    
})
 

module.exports = router;