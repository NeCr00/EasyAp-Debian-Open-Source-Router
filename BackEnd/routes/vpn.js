const express = require('express')
const app = express()
const router = express.Router()
const path = require('path')
const bodyParser = require('body-parser');
const { response } = require('express');



router.get('/', (req, res) => {
   
    res.sendFile(path.join(__dirname,'../../FrontEnd/vpn.html'));

    
  })


  router.get('/config', (req, res) => {
   
    let data = {
      "vpn_enable": '0',
      "ssid": 'test',
      "port": '1',
      "protocol": 'TCP',
      "enc_cipher": 'UDP',
      "hash": 'TCP',
      "cred_enable": '1',
      "username": '1',
      "password": 'test',
      "tls_cipher": 'Allow',
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


  router.get('/logs', (req, res) => {
   
    res.json({"file":"This is the logs"})
     
   })
 

module.exports = router;