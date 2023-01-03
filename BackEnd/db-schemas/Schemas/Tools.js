const mongoose = require('mongoose');

const toolsSchema = new mongoose.Schema({
    toolName: String,
    configKey: String,
    configValue: String,
    defaultKey: Boolean, //true if the configKey is in our default configurations
    defaultValue: String, //the value for the configValue when the configurations are reset
})

module.exports = mongoose.model("Tools", toolsSchema);
