const express = require('express')
const app = express()
const router = express.Router()
const path = require('path')
const bodyParser = require('body-parser');
const {getClientsDataUsage} = require('../utils/DataUsage/getClientsDataUsage')



router.get('/', (req, res) => {
   
  res.sendFile(path.join(__dirname,'../../FrontEnd/data_usage.html'));

})

router.get('/graphs_data', (req, res) => {
  
  let clientsDataUsage = getClientsDataUsage()
  
  res.send(clientsDataUsage)

})

// TODO: Function that runs once an hour and saves 
// the packets and bytes sent and received by each 
// device in network

module.exports = router;