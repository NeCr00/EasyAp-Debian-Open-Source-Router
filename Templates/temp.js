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
    colorAxis: {minValue: 0,  colors: ['yellow',  '#ff6347']},
    backgroundColor: '#0C1A32',
    datalessRegionColor: 'grey',
    defaultColor: '#666',
    keepAspectRatio:true
  };

  var chart = new google.visualization.GeoChart(document.getElementById('regions_div'));

  chart.draw(data, options);
}