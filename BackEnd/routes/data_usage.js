const express = require('express')
const app = express()
const router = express.Router()
const path = require('path')
const bodyParser = require('body-parser');
const {getClientsDataUsage} = require('../utils/DataUsage/getClientsDataUsage')



router.get('/', (req, res) => {
   
  res.sendFile(path.join(__dirname,'../../FrontEnd/data_usage.html'));

})

router.get('/graphs_data', async (req, res) => {
  
  let clientsDataUsage = await getClientsDataUsage()
  
  res.send(clientsDataUsage)

})

// TODO: Function that runs once an hour and saves 
// the packets and bytes sent and received by each 
// device in network

module.exports = router;

// obj1 = {
//   "mac-addr": "abcde",
//   "packets-received": [
//     1.49, 1.34, 1.41, 1.16, 1.81, 1706.82, 2057.85, 0, 0,
//     0, 0, 0,
//   ],
//   "packets-sent": [669, 770, 555, 254, 181, 240, 0, 0, 0, 0, 0, 0],
//   "bytes-received": [
//     1112.49, 1112.34, 2.41, 1112.16, 2.81, 1706.82, 2057.85, 0, 0,
//     0, 0, 0,
//   ],
//   "bytes-sent": [669, 770, 555, 254, 181, 240, 0, 0, 0, 0, 0, 0]
// }

