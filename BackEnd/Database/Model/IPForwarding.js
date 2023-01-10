const mongoose = require('mongoose');
const {Schema,model} = require('../dbConnect')

const IPForwardingSchema = new Schema({
    internalIP: String,
    internalPort: Number,
    externalPort: Number,
    status: Boolean,
    IPForwardingCommand: String //may need to change to Command
})

const IPForwarding = model("IPForwarding", IPForwardingSchema);

module.exports = IPForwarding
