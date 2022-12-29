 

 function authentication (req, res, next) {
    var username = req.body.username
    var password = req.body.password
    console.log(username, password)
    if (username == "test" && password == "test") {
        req.session.userID = "1"
        return next()
    }
    else {
        res.json("Wrong username or password")
    }
  };


  module.exports = {authentication}