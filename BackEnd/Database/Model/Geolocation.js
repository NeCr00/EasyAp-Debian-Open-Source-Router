const mongoose = require('mongoose');
const {Schema,model} = require('../dbConnect')

const geolocationSchema = new Schema({
    countryNameLong: String,
    countryNameShort: String,
    requestCounter: Number
})

const geolocation = model("Geolocation", geolocationSchema);

module.exports = geolocation
