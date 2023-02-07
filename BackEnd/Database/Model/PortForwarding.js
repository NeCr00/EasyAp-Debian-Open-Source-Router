const mongoose = require('mongoose');
const {Schema,model} = require('../dbConnect')

const PortForwardingSchema = new Schema({
    internalIP: String,
    internalPort: Number,
    externalPort: Number,
    status: Boolean,
    IPForwardingCommand: String //may need to change to Command
})

const PortForwarding = model("PortForwarding", PortForwardingSchema);

module.exports = PortForwarding
