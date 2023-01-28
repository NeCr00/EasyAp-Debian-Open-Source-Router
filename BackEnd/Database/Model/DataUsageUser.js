const mongoose = require('mongoose');
const {Schema,model} = require('../dbConnect')

const dataUsageUserSchema = new Schema({
    ip: { type: String, required: true },
    packetsSent: { type: Number, default: 0 },
    packetsReceived: { type: Number, default: 0 },
    bytesSent: { type: Number, default: 0 },
    bytesReceived: { type: Number, default: 0 },
    timestamp: { type: String, required: true }
})


const dataUsageUser = model("dataUsageUser", dataUsageUserSchema);
module.exports = dataUsageUser
