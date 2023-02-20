const express = require('express')
const app = express()
const router = express.Router()
const path = require('path')
const {authentication} = require('./../middlewares/authentication')



router.get('/', (req, res) => {
    if(req.session.userID){
        res.redirect('/dashboard')
    }
    else{
        res.sendFile(path.join(__dirname,'../../FrontEnd/Login/Login.html'));
    }
    
  })

router.post('/submit', authentication, function(req, res) {
    // let gatewagetGatewayAddress()
    res.redirect(301, '/dashboard');
})
module.exports = router;
