const mongoose = require('mongoose');
const {Schema,model} = require('../dbConnect')

const geolocationSchema = new Schema({
    countryNameShort: String,
    requestCounter: Number
})

const geolocation = model("Geolocation", geolocationSchema);

module.exports = geolocation
