const express = require('express')
const app = express()
const router  = express.Router()


router.get('/', (req, res) => {
    if(req.session.userID){
        res.redirect('/dashboard')
    }
    else{
        res.redirect('/login')
    }   
  })

module.exports = router;