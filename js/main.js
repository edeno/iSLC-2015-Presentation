
var mystack = stack()
    .on("activate", activate)
    .on("deactivate", deactivate);

var section = d3.selectAll("section"),
    hist = d3.select("#histogram"),
    histIndex = section[0].indexOf(hist.node()),
    eff = d3.select("#effectiveVis"),
    pathIndex = section[0].indexOf(eff.node()),
    join = d3.select("#joinsec"),
    joinIndex = section[0].indexOf(join.node()),
    bound = d3.select("#dataBound"),
    boundIndex = section[0].indexOf(bound.node());


var histInterval;

function activate(d, i) {
  if (i === histIndex) {
    startHist();
    histInterval = setInterval(function() {
              startHist();
      }, 3000);
    };
  if (i === pathIndex) drawPath();
  if (i === joinIndex) drawJoin();
  if (i === boundIndex) drawBound();

}

function deactivate(d, i) {
  if (i === histIndex) stopHist();
  if (i === pathIndex) eff.selectAll("svg").remove();
  if (i === joinIndex) join.selectAll("svg").remove();
  if (i === boundIndex) bound.selectAll("svg").remove();
}

// Histogram
function startHist() {
  var n = 50,
      randomFunc = d3.random.normal(5, 3),
      dataset = d3.range(n).map(randomFunc),
      histFig = hist.select("#histVis");

  var margin = {top: 10, right: 30, bottom: 30, left: 30},
      width = 400 - margin.left - margin.right,
      height = 200 - margin.top - margin.bottom;

  var xScale = d3.scale.linear()
            .domain([-15,25])
            .range([0, width]);

  var binned = d3.layout.histogram()
        .bins(xScale.ticks(40))
        (dataset);

  var histMean = d3.mean(dataset);
  var yScale = d3.scale.linear()
            .domain([0, d3.max(binned, function(d) { return d.y; })])
            .range([height, 0]);

  var xAxis = d3.svg.axis()
                .scale(xScale)
                .orient("bottom");

  var svg = histFig.selectAll("svg").data([{}]);
      svg.enter()
              .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom);

  var svgG = svg.selectAll("g#drawingArea").data([{}]);
      svgG.enter()
        .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
          .attr("id", "drawingArea");

  var bar = svgG.selectAll("g.bar")
                .data(binned);
      bar.exit()
        .remove();
      bar.enter()
        .append("g")
            .attr("class", "bar");
      bar
        .attr("transform", function(d) {
          return "translate(" + xScale(d.x) + "," + 0 + ")";
        });

  var rect = bar.selectAll("rect")
                .data(function(d) {return [d];});
      rect.enter()
          .append("rect")
            .attr("x", 1);
  var rectSize = Math.abs(xScale(binned[0].x) - xScale(binned[0].x + binned[0].dx));
      rect
        .transition()
          .duration(1000)
        .attr("height", function(d) {
            return height - yScale(d.y);
        })
        .attr("y", function(d) {
            return yScale(d.y);
        })
        .attr("width", function(d) {
          return rectSize - 1;
        });
  var gAxis = svgG.selectAll("g.xAxis").data([{}]);
      gAxis.enter()
        .append("g")
          .attr("class", "xAxis")
          .attr("transform", "translate(0," + height + ")");
      gAxis
        .call(xAxis);

  var meanBar = svgG.selectAll("rect#Mean")
                    .data([histMean]);
      meanBar.enter()
        .append("rect")
          .attr("id", "Mean")
          .attr("height", height)
          .attr("y", 0)
          .attr("fill", "red")
          .attr("opacity", .6);
     meanBar
       .transition()
         .duration(500)
       .attr("x", function(d) {return xScale(d);})
       .attr("width", rectSize/2);

}

function stopHist() {
  histInterval = clearInterval(histInterval);
}
// Moving Line
function drawPath() {
  var n = 40,
      randomFunc = d3.random.normal(0, .4),
      data = d3.range(n).map(randomFunc),
      pathFig = eff.select("#pathVis");
  var margin = {top: 20, right: 20, bottom: 20, left: 40},
      width = 800 - margin.left - margin.right,
      height = 200 - margin.top - margin.bottom;
  var xScale = d3.scale.linear()
            .domain([0, n - 1])
            .range([0, width]);
  var yScale = d3.scale.linear()
            .domain([-1, 1])
            .range([height, 0]);
  var line = d3.svg.line()
            .interpolate("basis")
            .x(function(d, i) { return xScale(i); })
            .y(function(d, i) { return yScale(d); });
  var svg = pathFig.selectAll("svg").data([{}]);
      svg.enter()
              .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom);

  var svgG = svg.selectAll("g#drawingArea").data([{}]).enter()
        .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
          .attr("id", "drawingArea");

  var defs = svgG.selectAll("defs").data([{}]).enter()
          .append("defs")
            .append("clipPath")
              .attr("id", "clip")
            .append("rect")
              .attr("width", width)
              .attr("height", height);

  var xAxis = d3.svg.axis()
                  .scale(xScale)
                  .ticks(0)
                  .orient("bottom");
  var xAxisG = svgG.selectAll("g.xAxis").data([{}]);
  xAxisG.enter()
      .append("g")
        .attr("class", "xAxis")
        .attr("transform", "translate(0," + yScale(0) + ")");
  xAxisG
    .call(xAxis);
  var yAxis = svgG.selectAll("g.yAxis").data([{}]);
  yAxis.enter()
    .append("g")
      .attr("class", "yAxis");
  yAxis
    .call(d3.svg.axis().scale(yScale).ticks(3).orient("left"));
  var clip = svgG.selectAll("g#clip").data([{}]);
      clip.enter()
        .append("g")
        .attr("id", "clip")
        .attr("clip-path", "url(#clip)");

  var path = clip.selectAll("path.line")
              .data([data]);
  path.enter()
    .append("path")
    .attr("class", "line");
  path
    .attr("d", line);
  var format = d3.format(".1f");
  tick();

  function tick() {
    // push a new data point onto the back
    data.push(randomFunc());
    // redraw the line, and slide it to the left
    path
      .attr("d", line)
      .attr("transform", null)
    .transition()
      .duration(500)
      .ease("linear")
    .attr("transform", "translate(" + xScale(-1) + ",0)")
      .each("end", tick);
    var text = clip.selectAll("text.number")
          .data(data);
    text.exit()
        .remove();
    text.enter()
      .append("text")
      .attr("class", "number")
      .attr("y", height)
      .style("font-size", "9px");
    text
      .attr("x", function(d, i) {
        return xScale(i);
      })
      .text(function(d) {
        return format(d);
        });
    // pop the old data point off the front
    data.shift();
  }
}
//
function drawJoin() {

  var joinFig = join.selectAll("#join"),
      margin = {top: 30, right: 30, bottom: 30, left: 30},
      width = 400 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;
  var svg = joinFig.selectAll("svg").data([{}]);
      svg.enter()
              .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom);

  var svgG = svg.selectAll("g#drawingArea").data([{}]);
      svgG.enter()
        .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
          .attr("id", "drawingArea");

  var data = svgG.append("g").attr("transform", "translate(110,110)");
      data.append("circle").style("fill", "#3182bd");
      data.append("text").attr("y", -120).text("Data").style("font-weight", "bold");
      data.append("text").attr("x", -50).text("Enter");

  svgG.append("text").attr("x", 170).attr("y", 110).text("Update");

  var elements = svgG.append("g").attr("transform", "translate(230,110)");
  elements.append("circle").style("fill", "#e6550d");
  elements.append("text").attr("y", -120).text("Elements").style("font-weight", "bold");
  elements.append("text").attr("x", 50).text("Exit");

  svgG.selectAll("circle")
      .attr("r", 110);

  svgG.selectAll("text")
      .attr("dy", ".35em")
      .attr("text-anchor", "middle");
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
