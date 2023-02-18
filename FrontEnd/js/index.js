
//----------------------------------------------------------------------------

$(document).ready(function () {
  //navbar show hide functionality
  $("#navbar-but").click(function () {
    var show = $("#navbarvalue").val();
    console.log(show);
    if (show) {
      $("#navbarr").addClass("d-none");
      $("#navbarvalue").val("0");
    }
    if (show == 0) {
      $("#navbarr").removeClass("d-none");
      $("#navbarvalue").val("1");
    }
  });


  function getData(url) {
   let data = fetch(url)
      .then((data) => {
        return data.json();
      })
      .then((post) => {
        //console.log(post);
        return post;
      });
      return data;
  }

  



  async function chartMap() {
    //convert json to array to be compatible with google chart
    //get data from backend
    var data = await getData("dashboard/mapData");
    CreateGeolocationTable(data[1].topCalculatedRequests); // Create Geolocation table
    var result = [];
    data = data[0].calculatedRequests
    result.push(["Country", "Percentage"]);
    for (var index in data)
      result.push([data[index].country, data[index].percentage]);

    google.charts.load("current", {
      packages: ["geochart"],
    });
    google.charts.setOnLoadCallback(drawRegionsMap);

    function drawRegionsMap() {
      var data = google.visualization.arrayToDataTable(result);
      var options = {
        colorAxis: {
          minValue: 0,
          colors: ["#219ebc", "#ee6c4d"],
        },
        backgroundColor: "#FFFFFF",
        datalessRegionColor: "#98c1d9",
        defaultColor: "#666",
      };

      var chart = new google.visualization.GeoChart(
        document.getElementById("regions_div")
      );

      chart.draw(data, options);
      $(window).resize(function () {
        drawRegionsMap();
      });
    }

  }

  chartMap(); // Draw GeoChart

  //---------------------------------------------------------------------

  //Geolocation Table

  function CreateGeolocationTable(data) {
    data.forEach((item) => {
      var newRow = $('<tr class="border-bottom border-1">');
      var cols = "";

      cols += '<td class="">' + item.country + "</td>";
      cols += ' <td class="">' + item.percentage + "</td>";

      newRow.append(cols);
      $("#geo-table-data").append(newRow);
    });
  }
 
  //---------------------------------------------------------------------

  // Progress Circle Chart

  function makesvg(percentage, inner_text = "") {
    var abs_percentage = Math.abs(percentage).toString();
    var percentage_str = percentage.toString();
    var classes = "";

    if (percentage >= 0 && percentage <=45) {
      classes = "danger-stroke ";
    } else if (percentage <= 75) {
      classes = "warning-stroke";
    } else {
      classes = "success-stroke";
    }
    var svg =''
     svg =
      '<svg class="circle-chart" viewbox="0 0 33.83098862 33.83098862" xmlns="http://www.w3.org/2000/svg">' +
      '<circle class="circle-chart__background" cx="16.9" cy="16.9" r="15.9" />' +
      '<circle class="circle-chart__circle ' +
      classes +
      '"' +
      'stroke-dasharray="' +
      abs_percentage +
      ',100"    cx="16.9" cy="16.9" r="15.9" />' +
      '<g class="circle-chart__info">' +
      '   <text class="circle-chart__percent" x="17.9" y="15.5">' +
      percentage_str +
      "%</text>";

    if (inner_text) {
      svg +=
        '<text class="circle-chart__subline" x="16.91549431" y="25">' +
        inner_text +
        "</text>";
    }

    svg += " </g></svg>";
    inner_text=''
    return svg;
    
  }

  (function ($, data) {
    
    $.fn.circlechart = function (data) {
      this.each(function (index) {
        var percentage = data[index].percentage;
        var inner_text = data[index].type
        $(this).html(makesvg(percentage, inner_text));
      });
      return this;
    };
  })(jQuery);

  async function createUsageChart() {

    var usage_data = await getData("/dashboard/usage_data")
    
    $(".circlechart").circlechart(usage_data); // Initialization of Usage chart, passing data

  }
  
 const intervalID = setInterval(createUsageChart, 1000);
  
  //---------------------------------------------------------------------

  //Devices Table

   async function CreateDeviceTable() {
    var data = await getData("/dashboard/getDevices")
    console.log(data)
    data.forEach((item) => {
      var newRow = $('<tr class="border-bottom border-1">');
      var cols = "";

      
      cols +=
        '  <td> <ion-icon class="desktop-icon" name="desktop-sharp"></ion-icon>' +
        item.host +
        "</td>";
      cols += '<td class="text-center">' + item.ip + "</td> ";
      cols += '<td class="text-center">' + item.mac + "</td>";

      newRow.append(cols);
      $("#table-devices").append(newRow);
    });
  }
  CreateDeviceTable();
  //---------------------------------------------------------------------

  // Traffic Diagram

  var chart1 = document.getElementById("chart").getContext("2d"),
    gradient1 = chart1.createLinearGradient(0, 0, 0, 450);
  gradientd1 = chart1.createLinearGradient(0, 0, 0, 450);

  gradient1.addColorStop(0, "rgba(46, 216, 182, 0.5)");
  gradient1.addColorStop(0.8, "rgba(46, 216, 182, 0.25)");

  gradientd1.addColorStop(0, "rgba(64, 153, 255, 0.5)");
  gradientd1.addColorStop(0.8, "rgba(64, 153, 255, 0.25)");

  function createData(traff_data) {
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
        "-12:00",
      ],
      datasets: [
        {
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
          data: traff_data[1].data,
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
      xAxes: [
        {
          gridLines: {
            color: "rgba(200, 200, 200, 0.05)",
            lineWidth: 1,
          },
        },
      ],
      yAxes: [
        {
          gridLines: {
            color: "rgba(200, 200, 200, 0.08)",
            lineWidth: 1,
          },
        },
      ],
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

  function CreateTrafficGraph(data) {
    var chartInstance = new Chart(chart1, {
      type: "line",
      data: createData(data),
      options: options1,
    });
  }

  async function getTrafficData() {
    var data = await getData("/dashboard/traffic");
    CreateTrafficGraph(data);
  }
  getTrafficData() //Initialization of  Geochart, passing data
});
