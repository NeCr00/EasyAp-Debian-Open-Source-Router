const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: String,
    password: String //may need to change to different encoding (?)
})

module.exports = mongoose.model("User", userSchema);
