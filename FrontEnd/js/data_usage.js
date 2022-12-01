$(document).ready(function () {
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


  // Packets Diagram

  var chart1 = document.getElementById("chart").getContext("2d"),
    gradient1 = chart1.createLinearGradient(0, 0, 0, 450);
  gradientd1 = chart1.createLinearGradient(0, 0, 0, 450);

  gradient1.addColorStop(0, "rgba(46, 216, 182, 0.5)");
  gradient1.addColorStop(0.8, "rgba(46, 216, 182, 0.25)");

  gradientd1.addColorStop(0, "rgba(64, 153, 255, 0.5)");
  gradientd1.addColorStop(0.8, "rgba(64, 153, 255, 0.25)");

  var data1 = {
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
      ],
    datasets: [
      {
        label: "Packets Sent",
        backgroundColor: gradientd1,
        pointBackgroundColor: "#4099ff",
        borderWidth: 1,
        borderColor: "#4099ff",
        data: [669, 770, 555, 254, 181, 240, 0, 0, 0, 0, 0, 0],
      },
      {
        label: "Packets Received",
        backgroundColor: gradient1,
        pointBackgroundColor: "#2ed8b6",
        borderWidth: 1,
        borderColor: "#2ed8b6",
        data: [
          3616.49, 2853.34, 2554.41, 1510.16, 2024.81, 1706.82, 2057.85, 0, 0,
          0, 0, 0,
        ],
      },
    ],
  };

  var options = {
    responsive: true,
    maintainAspectRatio: true,
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
    chartArea: {
        backgroundColor: 'rgba(0, 3, 255, 1)',
      },
  };

  var chartInstance = new Chart(chart1, {
    type: "line",
    data: data1,
    options: options,
  });

  //Bytes diagram

  var chart2 = document.getElementById("bytes-chart").getContext("2d"),
  
    gradient2 = chart2.createLinearGradient(0, 0, 0, 450);
  gradientd2 = chart2.createLinearGradient(0, 0, 0, 450);

  gradient2.addColorStop(0, "rgba(255, 182, 77, 0.5)");
  gradient2.addColorStop(0.8, "rgba(255, 182, 77, 0.25)");
  gradient2.addColorStop(1, "rgba(255, 182, 77, 0)");
  gradientd2.addColorStop(0, "rgba(255, 83, 112, 0.5)");
  gradientd2.addColorStop(0.8, "rgba(255, 83, 112, 0.25)");
  gradientd2.addColorStop(1, "rgba(255, 83, 112, 0)");

  var data = {
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
    ],
    datasets: [
      {
        label: "Bytes Sent",
        backgroundColor: gradient2,
        pointBackgroundColor: "#FFB64D",
        borderWidth: 1,
        borderColor: "#FFB64D",
        data: [
          3616.49, 2853.34, 2554.41, 1510.16, 2024.81, 1706.82, 2057.85, 0, 0,
          0, 0, 0,
        ],
      },
      {
        label: "Bytes Received",
        backgroundColor: gradientd2,
        pointBackgroundColor: "#FF5370",
        borderWidth: 1,
        borderColor: "#FF5370",
        data: [669, 770, 555, 254, 181, 240, 0, 0, 0, 0, 0, 0],
      },
    ],
  };

  

  var chartInstance2 = new Chart(chart2, {
    type: "line",
    data: data,
    options: options,
  });

  
});


//Create multiple diagram per users

/*
var funcs = [];

function createfunc(i) {
  return function() {
    console.log("My value: " + i);
  };
}

for (var i = 0; i < 3; i++) {
  funcs[i] = createfunc(i);
}

for (var j = 0; j < 3; j++) {
  // and now let's run each one to see
  funcs[j]();
}
*/