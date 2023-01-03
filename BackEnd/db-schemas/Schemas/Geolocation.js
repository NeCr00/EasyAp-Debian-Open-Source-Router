const mongoose = require('mongoose');

const geolocationSchema = new mongoose.Schema({
    countryNameLong: String,
    countryNameShort: String,
    requestCounter: Number
})

module.exports = mongoose.model("Geolocation", geolocationSchema);
