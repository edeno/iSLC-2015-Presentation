
var mystack = stack()
    .on("activate", activate)
    .on("deactivate", deactivate);

var section = d3.selectAll("section"),
    anscombe = d3.select("#anscombe"),
    anscombeIndex = section[0].indexOf(anscombe.node()),
    bound = d3.select("#dataBound"),
    boundIndex = section[0].indexOf(bound.node());

function activate(d, i) {
  if (i === anscombeIndex) {loadAnscombe();};
  if (i === boundIndex) {drawBound();}

}

function deactivate(d, i) {
  if (i === boundIndex) {bound.selectAll("svg").remove();}
  if (i === anscombeIndex) {anscombe.selectAll("div.chart").remove();}
}

// Anscombe's Quartet
function loadAnscombe() {
  d3.json('DATA/anscombeQuartet.json', function(error, anscombeData) {
    var anscombeFig = anscombe.select("#anscombeVis");
    var margin = {top: 10, right: 10, bottom: 10, left: 10},
        width = 290 - margin.left - margin.right,
        height = 230 - margin.top - margin.bottom;

    var plotDiv = anscombeFig.selectAll('div.chart').data(anscombeData);
    plotDiv.enter()
      .append('div')
        .attr('class', 'chart')
      .append('svg')
        .append('g');
    var plotSVG = plotDiv.select('svg')
      .attr('width', width + margin.left + margin.right )
      .attr('height', height + margin.top + margin.bottom );
    var plotG = plotSVG.select('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    plotG.each(drawData)

    function drawData(dataset) {

      var curPlot = d3.select(this);

      var xScale = d3.scale.linear()
        .domain([4,22])
        .range([0, width]);
      var yScale = d3.scale.linear()
        .domain([0,14])
        .range([height, 0]);

      setTimeout(drawTable, 0)

      function drawTable() {
        var yValues = d3.range(0,13,13/11);

        var datapoint = curPlot.selectAll('g.datapoint').data(dataset.values, function(d) {return d.x + '-' + d.y});
        datapoint.exit()
          .remove();
        var datapointEnter = datapoint.enter()
          .append('g')
            .attr('class', 'datapoint')
            .attr('transform', function(d, index) {
              return 'translate(' + xScale(8) + ',' + yScale(yValues[index]) + ')';
            });
        datapointEnter
            .append('circle')
              .attr('r', 6)
              .attr('opacity', 1E-6);
        datapointEnter
          .append('text')
            .attr('x', 10)
            .attr('y', 4.5)
            .text(function(d) {return '(' + d.x + ', ' + d.y + ')'});

        curPlot.selectAll('path').remove();
        datapoint
          .call(moveDot, 3000)

        curPlot.selectAll('text')
          .call(showCoordinates, 3000);

        setTimeout(drawRegressionLine, 9000)

        function moveDot(selection, duration) {
          selection.transition()
            .duration(duration)
            .attr('transform', function(d, index) {
              return 'translate(' + xScale(8) + ',' + yScale(yValues[index]) + ')';
            })
            .each('end', function() {
              curPlot.selectAll('circle').transition()
                .duration(1000)
                .attr('opacity', 0.7);
            });
        }

        function showCoordinates(selection, duration) {
          selection.transition()
            .duration(duration)
            .attr('opacity', 0.7);
        }
      }

      function drawRegressionLine() {
        var datapoint = curPlot.selectAll('g.datapoint');

        datapoint
          .call(moveDot, 3000);
        curPlot.selectAll('text')
          .call(fadeCoordinates, 3000);

        var lineFun = d3.svg.line()
          .x(function(d) { return xScale(d.x); })
          .y(function(d) { return yScale(3 + (0.500 * d.x)); })
          .interpolate('linear');

        var line = curPlot.selectAll('path').data([dataset.values])


        setTimeout(drawScatter, 9000);

        function moveDot(selection, duration) {
          selection.transition()
            .duration(duration)
            .attr('transform', function(d) {
              return 'translate(' + xScale(d.x) + ',' + yScale(3 + (0.500 * d.x)) + ')';
            })
            .each('end', function() {
              line.enter().append('path')
                .attr('d', lineFun)
                .attr('stroke-width', '3px');
            });
        }

        function fadeCoordinates(selection, duration) {
          selection.transition()
            .duration(duration)
            .attr('opacity', 1E-6);
        }
      }
      function drawScatter() {

        var datapoint = curPlot.selectAll('g.datapoint');
        datapoint
          .call(moveDot, 3000);
        curPlot.selectAll('text')
          .call(fadeCoordinates, 3000);

        setTimeout(drawTable, 9000);

        function moveDot(selection, duration) {
          selection.transition()
            .duration(duration)
            .attr('transform', function(d) {
              return 'translate(' + xScale(d.x) + ',' + yScale(d.y) + ')';
            });
        }

        function fadeCoordinates(selection, duration) {
          selection.transition()
            .duration(duration)
            .attr('opacity', 1E-6);
        }
      }
    }

  })
}

function drawBound() {
  var boundFig = bound.selectAll("#boundFig"),
      margin = {top: 30, right: 30, bottom: 30, left: 30},
      width = 600 - margin.left - margin.right,
      height = 200 - margin.top - margin.bottom;
  var svg = boundFig.selectAll("svg").data([{}]);
      svg.enter()
              .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom);

  var svgG = svg.selectAll("g#drawingArea").data([{}]);
      svgG.enter()
        .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
          .attr("id", "drawingArea");

  var circle = svgG.selectAll("circle")
    .data([300, 1000, 7000], function(d) { return d; });

  circle.enter()
    .append("circle")
      .attr("cy", 60)
      .attr("cx", function(d, i) { return i * 200 + 30; });
  var text = svgG.selectAll("text")
    .data([600, 1000, 7000], function(d) { return d; });
  text.enter()
      .append("text")
        .attr("y", 60)
        .attr("x", function(d, i) { return i * 200 + 15; })
        .style("font-size", "12px")
        .text(function(d) {return d;});
  circle
      .attr("r", function(d) { return Math.sqrt(d); });

  circle.exit().remove();
}
