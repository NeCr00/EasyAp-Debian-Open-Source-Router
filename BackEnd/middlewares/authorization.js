const express = require('express')
const app = express()

 function authorization (req, res, next) {
    if (req.session.userID)
      return next();
    else
      return res.sendStatus(401);
  };


  module.exports = {authorization}