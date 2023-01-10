const mongoose = require('mongoose');
const {Schema,model} = require('../dbConnect')

const userSchema = new mongoose.Schema({
    username: String,
    password: String //may need to change to different encoding (?)
})

const User = model("User", userSchema);
module.exports = User
