const express = require('express')
const app = express()
const router = express.Router()
const path = require('path')
const bodyParser = require('body-parser');
const { getDevices } = require('../utils/Dashboard/getConnectedDevices')
const { getGeolocationData, calculateTheData } = require('../utils/getGeolocation')
const { getUsage } = require('../utils/getUsage')
const { getTrafficStats } = require('../utils/networkTrafficMonitor')


router.get('/', (req, res) => {

  res.sendFile(path.join(__dirname, '../../FrontEnd/index.html'));


})


router.get('/getDevices', (req, res) => {


  getDevices().then(function (devices) {
    res.json(devices);

  })

})

router.get('/mapData', function (req, res) {

  getGeolocationData().then(function (data) {

    data = calculateTheData(data)
    //console.log(data);
    res.json(data)


  })

})

router.get('/usage_data', async function (req, res) {
  let usage = await getUsage()
  //console.log(usage)
  res.json(usage);

})

router.get('/traffic', function (req, res) {
  // getTrafficData()
  // var traffic_data = [{
  //   "type": "Packets Sent",
  //   "data": [6629, 7730, 5525, 2514, 1811, 2401, 10, 2320, 1132, 0, 2332, 0]
  // }, {
  //   "type": "Packets Received",
  //   "data": [3616.49, 2853.34, 2554.41, 1510.16, 2024.81, 1706.82, 2057.85, 0, 0, 0, 0, 0]
  // }]

  getTrafficStats().then(function (data){
    res.json(data);
  })
  
})

module.exports = router;