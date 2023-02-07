const User = require('../../Database/Model/User')


async function changePassword(reqPassword, reqUsername,reqOldPassword)  {

    let user = await User.findOne({ username: reqUsername, password: reqOldPassword})
    console.log(user)
    if (user && user.password !== reqPassword)  {
        updatePassword = await User.findOneAndUpdate({ username: user.username }, { password: reqPassword }, { new: true })
        return true
    }
    else {
        return false
    }

}




module.exports = { changePassword }