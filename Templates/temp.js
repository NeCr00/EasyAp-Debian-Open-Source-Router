$(document).ready(function(){


  $("#navbar-but").click(function(){
    var show = $("#navbarvalue").val()
    console.log(show)
    if(show){
      $("#navbarr").addClass("d-none")
      $("#navbarvalue").val("0")
    }
    if(show==0){
      $("#navbarr").removeClass("d-none")
      $("#navbarvalue").val("1")
      
    }
    
  });

  google.charts.load('current', {
    'packages':['geochart'],
  });
  google.charts.setOnLoadCallback(drawRegionsMap);
  
  function drawRegionsMap() {
    var data = google.visualization.arrayToDataTable([
      ['Country', 'Popularity'],
      ['Germany', 200],
      ['United States', 300],
      ['Brazil', 400],
      ['Canada', 500],
      ['France', 600],
      ['RU', 900],
      ['GB', 30],
      ['CN', 80],
      ['Australia', 150]
    ]);
  
    var options = {
      colorAxis: {minValue: 0,  colors: ['#219ebc', '#ee6c4d']},
      backgroundColor: '#FFFFFF',
      datalessRegionColor: '#98c1d9',
      defaultColor: '#666'
    };
  
    var chart = new google.visualization.GeoChart(document.getElementById('regions_div'));
  
    chart.draw(data, options);
    $(window).resize(function(){
      drawRegionsMap();
    });
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




     
  
});


var chart    = document.getElementById('chart').getContext('2d'),
    gradient = chart.createLinearGradient(0, 0, 0, 450);

gradient.addColorStop(0, 'rgba(255, 0,0, 0.5)');
gradient.addColorStop(0.5, 'rgba(255, 0, 0, 0.25)');
gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');


var data  = {
    labels: [ 'January', 'February', 'March', 'April', 'May', 'June' ],
    datasets: [{
			label: 'Custom Label Name',
			backgroundColor: gradient,
			pointBackgroundColor: 'white',
			borderWidth: 1,
			borderColor: '#911215',
			data: [50, 55, 80, 81, 54, 50]
    }]
};


var options = {
	responsive: true,
	maintainAspectRatio: true,
	animation: {
		easing: 'easeInOutQuad',
		duration: 520
	},
	scales: {
		xAxes: [{
			gridLines: {
				color: 'rgba(200, 200, 200, 0.05)',
				lineWidth: 1
			}
		}],
		yAxes: [{
			gridLines: {
				color: 'rgba(200, 200, 200, 0.08)',
				lineWidth: 1
			}
		}]
	},
	elements: {
		line: {
			tension: 0.4
		}
	},
	legend: {
		display: false
	},
	point: {
		backgroundColor: 'white'
	},
	tooltips: {
		titleFontFamily: 'Open Sans',
		backgroundColor: 'rgba(0,0,0,0.3)',
		titleFontColor: 'red',
		caretSize: 5,
		cornerRadius: 2,
		xPadding: 10,
		yPadding: 10
	}
};


var chartInstance = new Chart(chart, {
    type: 'line',
    data: data,
		options: options
});

