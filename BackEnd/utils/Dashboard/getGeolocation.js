const Geolocation = require('../../Database/Model/Geolocation');


async function getGeolocationData() {

    data = await Geolocation.find().sort({ requestCounter: -1 })
    
    return data
}


function calculateTheData (data){
    let topCalculatedRequests = []
    let calculatedRequests = []
    totalRequests = 1
    data.forEach(item=>{totalRequests += item.requestCounter})
    
    if(data.length >4){
        for (let item =0; item <5; item++) {
            percentage = ((data[item].requestCounter/totalRequests)*100).toFixed(2)
            topCalculatedRequests.push({
                "country": data[item].countryNameShort,
                "percentage": parseFloat(percentage)
            })
        }

        data.forEach(item=>{
            percentage = ((item.requestCounter/totalRequests)*100).toFixed(2)
            calculatedRequests.push({
                "country": item.countryNameShort,
                "percentage": parseFloat(percentage)
            })
        })
        console.log(calculatedRequests)
        return [{"calculatedRequests":calculatedRequests},{"topCalculatedRequests":topCalculatedRequests}]
    }
    else{
        return []
    }
    
    
}


module.exports = {
    getGeolocationData,calculateTheData
}