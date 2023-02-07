const Geolocation = require('../../Database/Model/Geolocation');


async function getGeolocationData() {

    //Extract the Geolocation data from the maximum number of requests to the minimum
    data = await Geolocation.find().sort({ requestCounter: -1 })

    //returns the data
    return data
}


function calculateTheData(data) {
    //Contains the top 5 countries which the requests belongs
    let topCalculatedRequests = []
    //Contais all the countries which the requests belong
    let calculatedRequests = []

    
    totalRequests = 1
    data.forEach(item => { totalRequests += item.requestCounter })

    //Calculate the top 5 countries which the requests belong
    if (data.length > 4) {
        for (let item = 0; item < 5; item++) {
            //Contains the 
            percentage = ((data[item].requestCounter / totalRequests) * 100).toFixed(2)
            topCalculatedRequests.push({
                "country": data[item].countryNameShort,
                "percentage": parseFloat(percentage)
            })
        }

        data.forEach(item => {
            percentage = ((item.requestCounter / totalRequests) * 100).toFixed(2)
            calculatedRequests.push({
                "country": item.countryNameShort,
                "percentage": parseFloat(percentage)
            })
        })
        console.log(calculatedRequests)
        return [{ "calculatedRequests": calculatedRequests }, { "topCalculatedRequests": topCalculatedRequests }]
    }
    else {
        return []
    }


}


module.exports = {
    getGeolocationData, calculateTheData
}