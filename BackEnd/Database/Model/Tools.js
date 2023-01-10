const mongoose = require('mongoose');
const {Schema,model} = require('../dbConnect')

const toolsSchema = new Schema({
    toolName: String,
    configKey: String,
    configValue: String,
    defaultKey: Boolean, //true if the configKey is in our default configurations
    defaultValue: String, //the value for the configValue when the configurations are reset
})

const tools = model("Tools", toolsSchema);

module.exports = tools
