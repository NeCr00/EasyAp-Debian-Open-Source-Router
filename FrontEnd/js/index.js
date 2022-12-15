//Json dump data ----------------------------------------------------------------

//Json dumb data for Devices Table
var devices = [{
  "id": 1,
  "host": "Zamit",
  "ip": "39.41.141.250",
  "mac": "EF-CF-C4-48-F8-8F"
}, {
  "id": 2,
  "host": "Alphazap",
  "ip": "108.194.244.156",
  "mac": "8F-00-AB-4A-89-29"
}, {
  "id": 3,
  "host": "Quo Lux",
  "ip": "116.138.15.104",
  "mac": "B5-64-9A-91-67-3A"
}, {
  "id": 4,
  "host": "Voltsillam",
  "ip": "69.120.128.178",
  "mac": "9D-16-4E-81-E8-FB"
}, {
  "id": 5,
  "host": "Quo Lux",
  "ip": "195.109.59.236",
  "mac": "7C-F8-21-D8-13-C2"
}, {
  "id": 6,
  "host": "Sub-Ex",
  "ip": "151.236.43.133",
  "mac": "F6-50-7E-8A-6D-82"
}, {
  "id": 7,
  "host": "Solarbreeze",
  "ip": "122.86.226.184",
  "mac": "A1-B0-53-A1-1F-9B"
}, {
  "id": 8,
  "host": "Namfix",
  "ip": "50.145.4.141",
  "mac": "95-45-9C-36-9B-01"
}, {
  "id": 9,
  "host": "Treeflex",
  "ip": "211.17.163.169",
  "mac": "FC-26-8D-D1-55-43"
}, {
  "id": 10,
  "host": "Bitchip",
  "ip": "230.166.124.220",
  "mac": "39-1F-59-51-C5-7F"
}]


//json dumb data for chartmap
var geo_table_data = [{
  "country": "Russia",
  "percentage": 43.59
}, {
  "country": "Nigeria",
  "percentage": 14.65
}, {
  "country": "Suriname",
  "percentage": 72.59
}, {
  "country": "Indonesia",
  "percentage": 75.53
}, {
  "country": "Czech Republic",
  "percentage": 78.26
}]


//json dumb data for circle chart usage
var usage_data= [{
  "type": "cpu",
  "percentage": 39
}, {
  "type": "memory",
  "percentage": 55
}, {
  "type": "disk",
  "percentage": 90
}]

//json dumb data for traffic chart
var traffic_data= [{
  "type": "Packets Sent",
  "data": [6629, 7730, 5525, 2514, 1811, 2401, 10, 2320, 1132, 0, 2332, 0]
}, {
  "type": "Packets Received",
  "data":[3616.49, 2853.34, 2554.41, 1510.16, 2024.81, 1706.82, 2057.85, 0, 0, 0, 0, 0]
}]
//----------------------------------------------------------------------------


$(document).ready(function () {

  //navbar show hide functionality
  $("#navbar-but").click(function () {
    var show = $("#navbarvalue").val()
    console.log(show)
    if (show) {
      $("#navbarr").addClass("d-none")
      $("#navbarvalue").val("0")
    }
    if (show == 0) {
      $("#navbarr").removeClass("d-none")
      $("#navbarvalue").val("1")

    }

  });

  // google chart map

  function chartMap(data) {
    //convert json to array to be compatible with google chart 
    var result = [];
    result.push(['Country', 'Percentage'])
    for (var index in data)

      result.push([data[index].country, data[index].percentage]);

    google.charts.load('current', {
      'packages': ['geochart'],
    });
    google.charts.setOnLoadCallback(drawRegionsMap);

    function drawRegionsMap() {
      var data = google.visualization.arrayToDataTable(result);

      var options = {
        colorAxis: {
          minValue: 0,
          colors: ['#219ebc', '#ee6c4d']
        },
        backgroundColor: '#FFFFFF',
        datalessRegionColor: '#98c1d9',
        defaultColor: '#666'
      };

      var chart = new google.visualization.GeoChart(document.getElementById('regions_div'));

      chart.draw(data, options);
      $(window).resize(function () {
        drawRegionsMap();
      });
    }

  }

  chartMap(geo_table_data); // Draw GeoChart


  //---------------------------------------------------------------------
  
  //Geolocation Table 

  function CreateGeolocationTable(data) {

    data.forEach(item => {

      var newRow = $('<tr class="border-bottom border-1">')
      var cols = ''

      cols += '<td class="">' + item.country + '</td>'
      cols += ' <td class="">' + item.percentage + '</td>'


      newRow.append(cols)
      $("#geo-table-data").append(newRow)

    });

  }
  CreateGeolocationTable(geo_table_data) // Create Geolocation table
  //---------------------------------------------------------------------         




  // Progress Circle Chart

  function makesvg(percentage, inner_text = "") {

    var abs_percentage = Math.abs(percentage).toString();
    var percentage_str = percentage.toString();
    var classes = ""

    if (percentage < 0) {
      classes = "danger-stroke circle-chart__circle--negative";
    } else if (percentage > 0 && percentage <= 30) {
      classes = "warning-stroke";
    } else {
      classes = "success-stroke";
    }

    var svg = '<svg class="circle-chart" viewbox="0 0 33.83098862 33.83098862" xmlns="http://www.w3.org/2000/svg">' +
      '<circle class="circle-chart__background" cx="16.9" cy="16.9" r="15.9" />' +
      '<circle class="circle-chart__circle ' + classes + '"' +
      'stroke-dasharray="' + abs_percentage + ',100"    cx="16.9" cy="16.9" r="15.9" />' +
      '<g class="circle-chart__info">' +
      '   <text class="circle-chart__percent" x="17.9" y="15.5">' + percentage_str + '%</text>';

    if (inner_text) {
      svg += '<text class="circle-chart__subline" x="16.91549431" y="25">' + inner_text + '</text>'
    }

    svg += ' </g></svg>';

    return svg
  }

  
  (function ($,data) {
    console.log(data)
    $.fn.circlechart = function (data) {
      
      this.each(function (index) {
        var percentage = data[index].percentage
        var inner_text = $(this).text();
        console.log(inner_text)
        console.log(percentage)
        $(this).html(makesvg(percentage, inner_text));
      });
      return this;
    };

  }(jQuery));

  $(".circlechart").circlechart(usage_data); // Initialization of Usage chart, passing data

  //---------------------------------------------------------------------  


  //Devices Table 

  function CreateDeviceTable(data) {

    data.forEach(item => {

      var newRow = $('<tr class="border-bottom border-1">')
      var cols = ''

      cols += '<th class="text-center pe-4" scope="row">' + item.id + '</th>'
      cols += '  <td> <ion-icon class="desktop-icon" name="desktop-sharp"></ion-icon>' + item.host + '</td>'
      cols += '<td class="text-center">' + item.ip + '</td> '
      cols += '<td class="text-center">' + item.mac + '</td>'

      newRow.append(cols)
      $("#table-devices").append(newRow)

    });

  }
  CreateDeviceTable(devices)
  //---------------------------------------------------------------------  





// Traffic Diagram

var chart1 = document.getElementById("chart").getContext("2d"),
  gradient1 = chart1.createLinearGradient(0, 0, 0, 450);
gradientd1 = chart1.createLinearGradient(0, 0, 0, 450);

gradient1.addColorStop(0, "rgba(46, 216, 182, 0.5)");
gradient1.addColorStop(0.8, "rgba(46, 216, 182, 0.25)");

gradientd1.addColorStop(0, "rgba(64, 153, 255, 0.5)");
gradientd1.addColorStop(0.8, "rgba(64, 153, 255, 0.25)");


function createData(traff_data){
  var data_to_return = {
    labels: [
      "now",
      "-1:00",
      "-2:00",
      "-3:00",
      "-4:00",
      "-5:00",
      "-6:00",
      "-7:00",
      "-8:00",
      "-9:00",
      "-10:00",
      "-11:00",
      "-12:00"
    ],
    datasets: [{
        label: "Packets Sent",
        backgroundColor: gradientd1,
        pointBackgroundColor: "#4099ff",
        borderWidth: 1,
        borderColor: "#4099ff",
        data: traff_data[0].data,
      },
      {
        label: "Packets Received",
        backgroundColor: gradient1,
        pointBackgroundColor: "#2ed8b6",
        borderWidth: 1,
        borderColor: "#2ed8b6",
        data:traff_data[1].data,
      },
    ],
  };
  return data_to_return;
}



var options1 = {
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    easing: "easeInOutQuad",
    duration: 520,
  },
  scales: {
    xAxes: [{
      gridLines: {
        color: "rgba(200, 200, 200, 0.05)",
        lineWidth: 1,
      },
    }, ],
    yAxes: [{
      gridLines: {
        color: "rgba(200, 200, 200, 0.08)",
        lineWidth: 1,
      },
    }, ],
  },
  elements: {
    line: {
      tension: 0.4,
    },
  },
  legend: {
    display: true,
  },
  point: {
    backgroundColor: "white",
  },
  tooltips: {
    titleFontFamily: "Open Sans",
    backgroundColor: "rgba(0,0,0,0.3)",
    titleFontColor: "white",
    caretSize: 5,
    cornerRadius: 2,
    xPadding: 10,
    yPadding: 10,
  },
};



function CreateTrafficGraph(data){
  var chartInstance = new Chart(chart1, {
    type: "line",
    data: createData(data),
    options: options1,
  });
  
}

CreateTrafficGraph(traffic_data) //Initialization of  Geochart, passing data

});