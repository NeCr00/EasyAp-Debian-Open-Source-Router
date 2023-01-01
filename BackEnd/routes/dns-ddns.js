const express = require('express')
const app = express()
const router = express.Router()
const path = require('path')
const bodyParser = require('body-parser');



router.get('/', (req, res) => {
   
    res.sendFile(path.join(__dirname,'../../FrontEnd/dns-ddns.html'));

    
  })


  router.get('/ddns', (req, res) => {
   //get the already configured ddns from the database
    let data = [{
      "ddns_enabled":"1",
      "domain":"localhost",
      "provider":"DYN",
      "username":"admin",
      "password":"admin"
    }]

    res.json(data);
    
  })

  router.post('/ddns', (req, res) => {
   
    

    
  })


  router.get('/dns', (req, res) => {
   
    var dns_data = [{
      "id": 1,
      "ip": "55.167.74.54"
    }, {
      "id": 2,
      "ip": "233.23.23.11"
    }, {
      "id": 3,
      "ip": "250.15.178.134"
    }]

    res.json(dns_data);
    
  })

  router.get('/nameserver', (req, res) => {
   
    var authoritative_dns_data = [{
      "id": 1,
      "domain": "www.example.com",
      "ip": "55.167.74.54"
    }, {
      "id": 2,
      "domain": "mail.example.com",
      "ip": "233.23.23.11"
    }, {
      "id": 3,
      "domain": "sftp.example.com",
      "ip": "250.15.178.134"
    }]

    res.json(authoritative_dns_data);

    
  })

  router.post('/nameserver', (req, res) => {
   
    

    
  })

module.exports = router;