$(document).ready(function () {

function setupChartConfig(chartType, graphData, elementIdentifier){
  //chartType -> packets-chart OR bytes-chart
  // var chart = document.getElementById('packets-chart1')
  console.log(chartType + elementIdentifier)
  let currentChart = document.getElementById(chartType + elementIdentifier).getContext("2d");
  currentChartt =document.getElementById(chartType + elementIdentifier)
  console.log(currentChart)
  let gradient1 = currentChart.createLinearGradient(0, 0, 0, 450);
  let gradient2 = currentChart.createLinearGradient(0, 0, 0, 450);

  gradient1.addColorStop(0, (chartType == "packets-chart") ? "rgba(46, 216, 182, 0.5)" : "rgba(255, 83, 112, 0.5)");
  gradient1.addColorStop(0.8, (chartType == "packets-chart") ? "rgba(46, 216, 182, 0.25)" : "rgba(255, 83, 112, 0.25)");

  gradient2.addColorStop(0, (chartType == "packets-chart") ? "rgba(64, 153, 255, 0.5)" : "rgba(255, 182, 77, 0.5)");
  gradient2.addColorStop(0.8, (chartType == "packets-chart") ? "rgba(64, 153, 255, 0.25)" : "rgba(255, 182, 77, 0.25)");

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
        label: "Sent",
        backgroundColor: gradient2,
        pointBackgroundColor: (chartType == "packets-chart") ? "#4099ff" : "#FFB64D",
        borderWidth: 1,
        borderColor: (chartType == "packets-chart") ? "#4099ff" : "#FFB64D",
        data: graphData[(chartType == "packets-chart") ? "packets-sent" : "bytes-sent"],
      },
      {
        label: "Received",
        backgroundColor: gradient1,
        pointBackgroundColor: (chartType == "packets-chart") ? "#2ed8b6" : "#FF5370",
        borderWidth: 1,
        borderColor: (chartType == "packets-chart") ? "#2ed8b6" : "#FF5370",
        data: graphData[(chartType == "packets-chart") ? "packets-received" : "bytes-received"],
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
  
  let chartInstance = new Chart(currentChart, {
    type: "line",
    data: data,
    options: options,
  });

}

async function getClientGraphData(){
  let graphData = await fetch('/data_usage/graphs_data',
    {
      method: 'GET'
    }
  );

  if(!graphData.ok)
    throw new Error('Request could not be resolved.')
  else
    return graphData.json()
}

// Data format:
// Array of objects
// Example:
// [{
//   "mac_addr": "...",
//   "packets_received": [],
//   "packets_sent": [],
//   "bytes_received": [],
//   "bytes_sent": []
// }, ...]  
async function createClientGraphs(){
  
  let cardHtmlElement = $('#data_usage_row').html();
  let graphData = await getClientGraphData();
  document.getElementById('data_usage_row').innerHTML = '';

  console.log(graphData)
  
  // For each object in graphData:
  for (var i = 0; i < graphData.length; i++) {
    //  1. Create the Card to put the graphs
    document.getElementById('data_usage_row').innerHTML += cardHtmlElement
    document.getElementsByClassName("packets")[i].innerHTML= '<canvas id="packets-chart'+i+'"></canvas>'
    document.getElementsByClassName("bytes")[i].innerHTML= '<canvas id="bytes-chart'+i+'"></canvas>'
    
    //  2. Change the innerText of the Card depending on the data
    ipElements = document.getElementsByClassName('mac-addr');
    packetsSentElements =  document.getElementsByClassName('packets-sent');
    packetsReceivedElements =  document.getElementsByClassName('packets-received');
    bytesSentElements =  document.getElementsByClassName('bytes-sent');
    bytesReceivedElements =  document.getElementsByClassName('bytes-received');

    ipElements[ipElements.length - 1].innerText = graphData[i]['ip'];
    packetsSentElements[packetsSentElements.length - 1].innerText = graphData[i]['total-packets-sent'][0]; // latest value
    packetsReceivedElements[packetsReceivedElements.length - 1].innerText = graphData[i]['total-packets-received'][0];
    bytesSentElements[bytesSentElements.length - 1].innerText = graphData[i]['total-bytes-sent'][0];
    bytesReceivedElements[bytesReceivedElements.length - 1].innerText = graphData[i]['total-bytes-received'][0];
    //  3.Create the graphs
      // for (var j = 0; j < chartTypes.length; j++){
      //   //setupChartConfig(chartTypes[j], graphData[i], i);
      //   //test(i)
        
      // }

      
   }
   return graphData
}


// MANUAL STUFF


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

 async function CreateGraphs (){
  let chartTypes = ['packets-chart', 'bytes-chart'];
  let graphData= await createClientGraphs();
  for (var i = 0; i < graphData.length; i++){
  for (var j = 0; j < chartTypes.length; j++){
    setupChartConfig(chartTypes[j], graphData[i], i);
    
    
  }
}
 } 
 CreateGraphs()

  // Packets Diagram

})