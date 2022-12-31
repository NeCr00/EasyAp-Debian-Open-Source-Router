const express = require('express')
const app = express()
const router = express.Router()
const path = require('path')
const bodyParser = require('body-parser');



router.get('/', (req, res) => {
   
    res.sendFile(path.join(__dirname,'../../FrontEnd/index.html'));

    
  })


router.get('/getDevices', (req, res) => {

  //get hosts
  var devices = [{
    "id": 1,
    "host": "Zamit",
    "ip": "39.41.141.250",
    "mac": "EF-CF-C4-48-F8-8F"
  }, {
    "id": 2,
    "host": "Alphazap",
    "ip": "108.194.244.156",
    "mac": "8F-00-AB-4A-89-29"
  }, {
    "id": 3,
    "host": "Quo Lux",
    "ip": "116.138.15.104",
    "mac": "B5-64-9A-91-67-3A"
  }
]

  res.json(devices);
  
})

router.get('/mapData', function (req, res) {

  var geo_table_data = [{
    "country": "Russia",
    "percentage": 43.59
  }, {
    "country": "Nigeria",
    "percentage": 14.65
  }, {
    "country": "Suriname",
    "percentage": 72.59
  }, {
    "country": "Indonesia",
    "percentage": 75.53
  }, {
    "country": "Czech Republic",
    "percentage": 78.26
  }]

  res.json(geo_table_data);
})

router.get('/usage_data', function (req, res) {
  var usage_data = [{
    "type": "cpu",
    "percentage": 39
  }, {
    "type": "memory",
    "percentage": 55
  }, {
    "type": "disk",
    "percentage": 90
  }]

  res.json(usage_data);

})

router.get('/traffic', function (req, res) {

  var traffic_data= [{
    "type": "Packets Sent",
    "data": [6629, 7730, 5525, 2514, 1811, 2401, 10, 2320, 1132, 0, 2332, 0]
  }, {
    "type": "Packets Received",
    "data":[3616.49, 2853.34, 2554.41, 1510.16, 2024.81, 1706.82, 2057.85, 0, 0, 0, 0, 0]
  }]
  res.json(traffic_data);
})

module.exports = router;