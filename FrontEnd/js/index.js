const data = {
    labels: [
        'Red',
        'Blue',
        'Yellow'
    ],
    datasets: [{
        label: 'My First Dataset',
        data: [300, 50, 100],
        backgroundColor: [
            'rgb(255, 99, 132)',
            'rgb(54, 162, 235)',
            'rgb(255, 205, 86)'
        ],
        hoverOffset: 4
    }]
};

const config = {
    type: 'doughnut',
    data: data,
};



const myChart = new Chart(
    document.getElementById('myChart'),
    config
);


google.charts.load('current', {packages: ['corechart', 'line']});
google.charts.setOnLoadCallback(drawBackgroundColor);

function drawBackgroundColor() {
      var data = new google.visualization.DataTable();
      data.addColumn('number', 'X');
      data.addColumn('number', 'CPU');

      data.addRows([
        [0, 0],   [1, 10],  [2, 23],  [3, 17],  [4, 18],  [5, 9],
        [6, 11],  [7, 27],  [8, 33],  [9, 40],  [10, 32], [11, 35],
        [12, 30], [13, 40], [14, 42], [15, 47], [16, 44], [17, 48],
        [18, 52], [19, 54], [20, 42], [21, 55], [22, 56], [23, 57],
        [24, 60], [25, 50], [26, 52], [27, 51], [28, 49], [29, 53],
        [30, 55], [31, 60], [32, 61], [33, 59], [34, 62], [35, 65],
        [36, 62], [37, 58], [38, 55], [39, 61], [40, 64], [41, 65],
        [42, 63], [43, 66], [44, 67], [45, 69], [46, 69], [47, 70],
        [48, 72], [49, 68], [50, 66], [51, 65], [52, 67], [53, 70],
        [54, 71], [55, 72], [56, 73], [57, 75], [58, 70], [59, 68],
        [60, 64], [61, 60], [62, 65], [63, 67], [64, 68], [65, 69],
        [66, 70], [67, 72], [68, 75], [69, 80]
      ]);

      var options = {
        hAxis: {
          title: 'Time'
        },
        vAxis: {
          title: ''
        },
        backgroundColor: '#ffffff'
      };

      var chart = new google.visualization.LineChart(document.getElementById('chart_div'));
      chart.draw(data, options);
    }
    


  // Progress Circle Chart

  function makesvg(percentage, inner_text=""){

    var abs_percentage = Math.abs(percentage).toString();
    var percentage_str = percentage.toString();
    var classes = ""
  
    if(percentage < 0){
      classes = "danger-stroke circle-chart__circle--negative";
    } else if(percentage > 0 && percentage <= 30){
      classes = "warning-stroke";
    } else{
      classes = "success-stroke";
    }
  
   var svg = '<svg class="circle-chart" viewbox="0 0 33.83098862 33.83098862" xmlns="http://www.w3.org/2000/svg">'
       + '<circle class="circle-chart__background" cx="16.9" cy="16.9" r="15.9" />'
       + '<circle class="circle-chart__circle '+classes+'"'
       + 'stroke-dasharray="'+ abs_percentage+',100"    cx="16.9" cy="16.9" r="15.9" />'
       + '<g class="circle-chart__info">'
       + '   <text class="circle-chart__percent" x="17.9" y="15.5">'+percentage_str+'%</text>';
  
    if(inner_text){
      svg += '<text class="circle-chart__subline" x="16.91549431" y="25">'+inner_text+'</text>'
    }
    
    svg += ' </g></svg>';
    
    return svg
  }
  
  (function( $ ) {
  
      $.fn.circlechart = function() {
          this.each(function() {
              var percentage = $(this).data("percentage");
              var inner_text = $(this).text();
              $(this).html(makesvg(percentage, inner_text));
          });
          return this;
      };
  
  }( jQuery ));

  $(".circlechart").circlechart(); // Initialization

      var _gaq = _gaq || [];
      _gaq.push(["_setAccount", "UA-36251023-1"]);
      _gaq.push(["_setDomainName", "jqueryscript.net"]);
      _gaq.push(["_trackPageview"]);

      (function () {
          var ga = document.createElement("script");
          ga.type = "text/javascript";
          ga.async = true;
          ga.src =
              ("https:" == document.location.protocol
                  ? "https://ssl"
                  : "http://www") + ".google-analytics.com/ga.js";
          var s = document.getElementsByTagName("script")[0];
          s.parentNode.insertBefore(ga, s);
      })();