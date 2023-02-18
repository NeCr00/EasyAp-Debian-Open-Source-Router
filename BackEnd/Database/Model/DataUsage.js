const mongoose = require('mongoose');
const { Schema, model } = require('../dbConnect')

const dataUsageSchema = new Schema({

    packetsSent:{ type: Number, default: 0 },
    packetsReceived: { type: Number, default: 0 },

    lastMetric: {
        packetsSent: { type: Number, default: 0 },
        packetsReceived: { type: Number, default: 0 }
    },
    hour: { type: Number, default: 0 }
})


const dataUsage = model("DataUsage", dataUsageSchema);
module.exports = dataUsage

