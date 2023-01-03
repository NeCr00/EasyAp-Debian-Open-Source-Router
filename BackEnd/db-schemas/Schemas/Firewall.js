const mongoose = require('mongoose');

const firewallSchema = new mongoose.Schema({
    ruleName: String,
    ruleCommand: String
})

module.exports = mongoose.model("Firewall", firewallSchema);
