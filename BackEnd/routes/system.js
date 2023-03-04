const express = require('express')
const app = express()
const router = express.Router()
const path = require('path')
const bodyParser = require('body-parser');
const { changePassword } = require('../utils/System/changePassword');
const { restartServices } = require('../utils/System/servicesRestart');
const { resetConfiguration } = require('../utils/System/resetConfig');


router.get('/', (req, res) => {
   
    res.sendFile(path.join(__dirname,'../../FrontEnd/system.html'));
    
  })


router.post('/change-pass', async (req, res) => {
    data = req.body
    success = await changePassword(data.password, data.username, data.oldpassword)

  if (success) {
    res.json({
      error: false,
      message: "Password has been changed",
    });
  } else {
    res.json({
      error: true,
      message: "An error occured",
    });
  }
})


router.post('/reset', async (req, res) => {
  let error = await resetConfiguration()

  if (error.error) {
    res.json({
      error: true,
      message: "An error occured",
    });
  } else {
    res.json({
      error: false,
      message: "Configuration has been reset",
    });
  }
})

router.post('/restart-services', async (req, res) => {
  let error = await restartServices()
  
  if (error.error) {
    res.json({
      error: true,
      message: "An error occured",
    });
  } else {
    res.json({
      error: false,
      message: error.message,
    });
  }
})


module.exports = router;