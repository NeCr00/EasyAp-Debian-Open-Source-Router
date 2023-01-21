const mongoose = require('mongoose');
const {Schema,model} = require('../dbConnect')

const dataUsageSchema = new Schema({
     
    packetsSent: Number,
    packetsReceived: Number,
    hour:Number
})


const dataUsage = model("DataUsage", dataUsageSchema);
module.exports = dataUsage
