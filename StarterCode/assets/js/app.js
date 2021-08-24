
//----------------------------------//
//----------------------------------//
//----------------------------------//
//adding margins
var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter") //(".chart")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";

function xScale(healthData, chosenXAxis) {
  //create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(healthData, d => d[chosenXAxis]) *0.8,
      d3.max(healthData, d => d[chosenXAxis]) *1.2
    ])
    .range([0, width]);

  return xLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating circles group with a transition to new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));

  return circlesGroup;
}

// function used for updating text group with a transaction to new circles
function renderText(circlesGroupBubble, newXScale, chosenXAxis) {

  circlesGroupBubble.transition()
    .duration(1000)
    .attr("dx", d => newXScale(d[chosenXAxis]));

  return circlesGroupBubble;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {

  var label;

  if (chosenXAxis === "poverty") {
    label = "Poverty:";
  }
  else {
    label = "Income:";
  }

  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([40, -60])
    .html(function(d) {
      return (`${d.state}<br>${label} ${d[chosenXAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data, this);
  })
    // onmouseout event
    .on("mouseout", function(healthData, index) {
      toolTip.hide(healthData);
    });

  return circlesGroup;
}

// Load data.csv from data file - name as healthData
d3.csv("assets/data/data.csv").then(function(healthData) {

    // Print the healthData
    console.log(healthData);

    // cast the data from the csv as numbers
  healthData.forEach(function(data) {
    data.poverty = +data.poverty;
    data.povertyMoe = +data.povertyMoe;
    data.age = +data.age;
    data.ageMoe = +data.ageMoe;
    data.income = +data.income;
    data.incomeMoe = +data.incomeMoe;
    data.healthcare = +data.healthcare;
    data.healthcareLow = +data.healthcareLow;
    data.healthcareHigh = +data.healthcareHigh;
    data.obesity = +data.obesity;
    data.obesityLow = +data.obesityLow;
    data.obesityHigh = +data.obesityHigh;
    data.smokes = +data.smokes;
    data.smokesLow = +data.smokesLow;
    data.smokesHigh = +data.smokesHigh;
  });

    console.log(healthData)

    // xLinearScale function above csv import
    var xLinearScale = xScale(healthData, chosenXAxis);

    // Create y scale function
    var yLinearScale = d3.scaleLinear()
    .domain([0, d3.max(healthData, d => d.healthcare)])
    .range([height, 0]);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup.append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);

    // append y axis
    chartGroup.append("g")
      .call(leftAxis);
     
    var circlesGroupEnter = chartGroup.selectAll("circle")
      .data(healthData)
      .enter()

    // append initial circles
    var circlesGroup = circlesGroupEnter
      .append("circle")
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d.healthcare))
      .attr("r", 15)
      .attr("fill", "blue")
      .attr("opacity", ".5"); // add in semi-colon 
      // .text(function(d){return d.abbr}); 

    // create abbr
    var circlesGroupBubble = circlesGroupEnter
      .append("text")
      .text(function(d){return d.abbr;})
      .attr("dx", function (d) {return xLinearScale(d[chosenXAxis]);})
      .attr("dy", function (d) {return yLinearScale(d.healthcare);});

//-----------------------------------------------------//

// Create group for two x-axis labels
var labelsGroup = chartGroup.append("g")
  .attr("transform", `translate(${width / 2}, ${height + 20})`);

var povertyLabel = labelsGroup.append("text")
  .attr("x", 0)
  .attr("y", 20)
  .attr("value", "poverty") // value to grab for event listener
  .classed("active", true)
  .text("Poverty Percentage");

var incomeLabel = labelsGroup.append("text")
  .attr("x", 0)
  .attr("y", 40)
  .attr("value", "income") // value to grab for event listener
  .classed("inactive", true)
  .text("Income in Dollars");

// append y axis
chartGroup.append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", 0 - margin.left)
  .attr("x", 0 - (height / 2))
  .attr("dy", "1em")
  .classed("axis-text", true)
  .text("Percent without Healthcare");

// updateToolTip function above csv import
var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

// x axis labels event listener
labelsGroup.selectAll("text")
  .on("click", function() {
    // get value of selection
    var value = d3.select(this).attr("value");
    if (value !== chosenXAxis) {

      // replaces chosenXAxis with value
      chosenXAxis = value;

      // console.log(chosenXAxis)

      // functions here found above csv import
      // updates x scale for new data
      xLinearScale = xScale(healthData, chosenXAxis);

      // updates x axis with transition
      xAxis = renderAxes(xLinearScale, xAxis);

      // updates circles with new x values
      circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

      // circlesGroupBubble.append("text").text(function(d){
      //     return d.abbr;
      // })
      // .attr("dx", function (d) {
      //      return xLinearScale(d[chosenXAxis])-displacementX;
      // })
      // .attr("dy", function (d) {
      //      return yLinearScale(d.healthcare)-displacementY;
      // });

      // updates tooltips with new info
      circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

      // update text when x-axis is changed
      circlesGroupBubble = renderText(circlesGroupBubble, xLinearScale, chosenXAxis);

      // changes classes to change bold text
      if (chosenXAxis === "income") {
        incomeLabel
          .classed("active", true)
          .classed("inactive", false);
        povertyLabel
          .classed("active", false)
          .classed("inactive", true);
      }
      else {
        incomeLabel
          .classed("active", false)
          .classed("inactive", true);
        povertyLabel
          .classed("active", true)
          .classed("inactive", false);
      }
    }
  });
}).catch(function(error) {
console.log(error);
});
