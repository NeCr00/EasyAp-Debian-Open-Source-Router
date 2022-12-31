const express = require('express')
const app = express()
const router = express.Router()
const path = require('path')
const bodyParser = require('body-parser');



router.get('/', (req, res) => {
   
  res.sendFile(path.join(__dirname,'../../FrontEnd/data_usage.html'));

})

router.get('/graphs_data', (req, res) => {
  
  obj1 = {
    "mac-addr": "abcde",
    "packets-received": [
      1.49, 1.34, 1.41, 1.16, 1.81, 1706.82, 2057.85, 0, 0,
      0, 0, 0,
    ],
    "packets-sent": [669, 770, 555, 254, 181, 240, 0, 0, 0, 0, 0, 0],
    "bytes-received": [
      1112.49, 1112.34, 2.41, 1112.16, 2.81, 1706.82, 2057.85, 0, 0,
      0, 0, 0,
    ],
    "bytes-sent": [669, 770, 555, 254, 181, 240, 0, 0, 0, 0, 0, 0]
  }
  obj2 = {
    "mac-addr": "edcba",
    "packets-received": [669, 770, 555, 254, 181, 240, 0, 0, 0, 0, 0, 0],
    "packets-sent": [
      333616.49, 2853.34, 2554.41, 1510.16, 2024.81, 1706.82, 2057.85, 0, 0,
      0, 0, 0,
    ],
    "bytes-received": [669, 770, 555, 254, 181, 240, 0, 0, 0, 0, 0, 0],
    "bytes-sent": [
      333616.49, 2853.34, 2554.41, 1510.16, 2024.81, 1706.82, 2057.85, 0, 0,
      0, 0, 0,
    ],
  }
  obj3 = {
    "mac-addr": "abcde",
    "packets-received": [
      43616.49, 2853.34, 2554.41, 1510.16, 2024.81, 1706.82, 2057.85, 0, 0,
      0, 0, 0,
    ],
    "packets-sent": [669, 770, 555, 254, 181, 240, 0, 0, 0, 0, 0, 0],
    "bytes-received": [
      43616.49, 2853.34, 2554.41, 1510.16, 2024.81, 1706.82, 2057.85, 0, 0,
      0, 0, 0,
    ],
    "bytes-sent": [669, 770, 555, 254, 181, 240, 0, 0, 0, 0, 0, 0]
  }
  graphDataToSend = [obj1, obj2, obj3];
  
  res.send(graphDataToSend)

})

// TODO: Function that runs once an hour and saves 
// the packets and bytes sent and received by each 
// device in network

module.exports = router;