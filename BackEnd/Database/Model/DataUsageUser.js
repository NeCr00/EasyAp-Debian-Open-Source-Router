const mongoose = require('mongoose');
const {Schema,model} = require('../dbConnect')

const dataUsageUserSchema = new Schema({
    MACAddress: String, //may need to change to a Device instead of String
    packetsSent: Number,
    packetsReceived: Number,
    bytesSent: Number,
    bytesReceived: Number,
    hour:Number
})


const dataUsageUser = model("dataUsageUser", dataUsageUserSchema);
module.exports = dataUsageUser
