
const User = require("../Database/Model/User")
//  function authentication (req, res, next) {
//     var username = req.body.username
//     var password = req.body.password
//     console.log(username, password)
//     if (username == "test" && password == "test") {
//         req.session.userID = "1"
//         return next()
//     }
//     else {
//         res.json("Wrong username or password")
//     }
//   };

async function authentication(req, res, next) {

    const user = await User.findOne({ username: req.body.username, password: req.body.password })
    if (user) {
        req.session.userID = "1"
        return next()
    }
    else {
        res.json("Wrong username or password")
    }
}

module.exports = { authentication }