const mongoose = require('mongoose');

const IPForwardingSchema = new mongoose.Schema({
    internalIP: String,
    internalPort: Number,
    externalPort: Number,
    status: Boolean,
    IPForwardingCommand: String //may need to change to Command
})

module.exports = mongoose.model("IPForwarding", IPForwardingSchema);
