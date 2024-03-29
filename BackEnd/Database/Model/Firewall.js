const mongoose = require('mongoose');
const {Schema,model} = require('../dbConnect')
const firewallSchema = new Schema({
    ruleName: String,
    ruleCommand: String,
    status:Boolean
})

const firewall = model("Firewall", firewallSchema);

module.exports = firewall
