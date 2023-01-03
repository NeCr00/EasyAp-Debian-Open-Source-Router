const mongoose = require('mongoose');

const dataUsageSchema = new mongoose.Schema({
    MACAddress: String, //may need to change to a Device instead of String
    packetsSent: Number,
    packetsReceived: Number,
    bytesSent: Number,
    bytesReceived: Number
})

module.exports = mongoose.model("DataUsage", dataUsageSchema);
