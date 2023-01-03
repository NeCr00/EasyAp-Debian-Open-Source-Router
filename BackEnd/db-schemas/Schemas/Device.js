const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
    MACAddress: String,
    banned: Boolean,
    banningCommand: String, //may need to change to Command instead of String
})

module.exports = mongoose.model("Device", deviceSchema);
