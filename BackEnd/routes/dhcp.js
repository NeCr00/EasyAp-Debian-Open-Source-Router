const express = require('express')
const app = express()
const router = express.Router()
const path = require('path')
const bodyParser = require('body-parser');



router.get('/', (req, res) => {
   
    res.sendFile(path.join(__dirname,'../../FrontEnd/dhcp.html'));

    
  })

  router.get('/connected_devices', (req, res) => {
   
    var address_data = [{
      "id": 1,
      "host": "Sax",
      "ip": "227.81.229.125",
      "mac": "4D-D2-2A-CC-E7-37",
      "time": 12646
    }, {
      "id": 2,
      "host": "Creigh",
      "ip": "168.212.191.141",
      "mac": "1B-AB-EC-93-A8-DF",
      "time": 10674
    }, {
      "id": 3,
      "host": "Donni",
      "ip": "26.128.171.197",
      "mac": "98-1D-20-04-09-B9",
      "time": 12087
    }]

    res.json(address_data)

    
  })

  router.post('/submit', function(req, res) {
    console.log(req.body)
    res.json("Nice")
  })

module.exports = router;