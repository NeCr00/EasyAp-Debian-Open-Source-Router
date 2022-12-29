const express = require('express')
const app = express()
const router = express.Router()
const path = require('path')
const bodyParser = require('body-parser');



router.get('/', (req, res) => {
   
    res.sendFile(path.join(__dirname,'../../FrontEnd/settings.html'));

    
  })


module.exports = router;