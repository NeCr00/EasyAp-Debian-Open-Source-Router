const mongoose = require('mongoose');
const { execSync } = require('child_process');

function resetConfiguration() {
    let success = true;
    let message = '';
    try {
        // Get an array of all the collections in the "easyap" database
        mongoose.connection.db.listCollections().toArray(function (err, names) {
            if (err) {
                throw err;
            }
            // Loop through the array and drop each collection
            names.forEach(function (elem) {
                mongoose.connection.db.dropCollection(elem.name);
            });
        });
        // Flush all the iptables rules
        execSync('sudo iptables -F');
    } catch (err) {
        success = false;
        message = `An error occurred: ${err.message}`;
    }
    // return an object with a success property and a message property
    return { success, message };
}


module.exports = {
    resetConfiguration
}