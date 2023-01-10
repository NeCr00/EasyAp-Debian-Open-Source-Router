const mongoose = require('mongoose');
const {Schema,model} = require('../dbConnect')

const deviceSchema = new Schema({
    MACAddress: String,
    banned: Boolean,
    banningCommand: String, //may need to change to Command instead of String
})


const deviceBanned = model("Device", deviceSchema);
module.exports = deviceBanned
