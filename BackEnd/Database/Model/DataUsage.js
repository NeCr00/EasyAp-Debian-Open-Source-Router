const mongoose = require('mongoose');
const {Schema,model} = require('../connection')

const dataUsageSchema = new Schema({
    MACAddress: String, //may need to change to a Device instead of String
    packetsSent: Number,
    packetsReceived: Number,
    bytesSent: Number,
    bytesReceived: Number
})


const dataUsage = model("DataUsage", dataUsageSchema);
module.exports = dataUsage
