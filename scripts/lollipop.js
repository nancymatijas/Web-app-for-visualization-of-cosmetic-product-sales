// set the dimensions and margins of the graph
var margin = { top: 30, right: 30, bottom: 60, left: 60 },
    width = 1000 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#my_data")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Load the JSON data
d3.json("../data/data.json", function (error, data) {
    if (error) throw error;

    // Extract unique countries
    var allCountries = d3.set(data.map(function (d) { return d.Country; })).values();

    // Add the options to the select button
    d3.select("#selectButton")
        .selectAll("myOptions")
        .data(allCountries)
        .enter()
        .append("option")
        .text(function (d) { return d; })
        .attr("value", function (d) { return d; });

    // Extract unique regions
    var allRegions = d3.set(data.map(function (d) { return d.Region; })).values();

    // A color scale: one color for each region
    var regionColorScale = d3.scaleOrdinal()
        .domain(allRegions)
        .range(d3.schemeSet2);

    // Parse the dates
    var parseDate = d3.timeParse("%m/%d/%Y");

    // Format the data
    data.forEach(function (d) {
        d.OrderDate = parseDate(d["Order Date"]);
        d.UnitsSold = +d["Units Sold"];
    });

    // Add X axis
    var x = d3.scaleTime()
        .domain(d3.extent(data, function (d) { return d.OrderDate; }))
        .range([0, width]);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    // X Axis Label
    svg.append("text")
        .attr("transform", "translate(" + width / 2 + " ," + (height + margin.top + 10) + ")")
        .style("text-anchor", "middle")
        .text("Order Date");

    // Add Y axis
    var y = d3.scaleLinear()
        .domain([0, d3.max(data, function (d) { return d.UnitsSold; })])
        .range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y));

    // Y Axis Label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - height / 2)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Units Sold");

    // Initialize lollipop chart with first country of the list
    var circles = svg.selectAll("circle")
        .data(data.filter(function (d) { return d.Country == allCountries[0]; }))
        .enter()
        .append("circle")
        .attr("cx", function (d) { return x(d.OrderDate); })
        .attr("cy", function (d) { return y(d.UnitsSold); })
        .attr("r", 7) // Adjust circle size according to your preference
        .style("fill", function (d) { return regionColorScale(d.Region); });

    // Add lines under circles
    var lines = svg.selectAll(".line")
        .data(data.filter(function (d) { return d.Country == allCountries[0]; }))
        .enter()
        .append("line")
        .attr("class", "line")
        .attr("x1", function (d) { return x(d.OrderDate); })
        .attr("y1", function (d) { return y(d.UnitsSold); })
        .attr("x2", function (d) { return x(d.OrderDate); })
        .attr("y2", height)
        .style("stroke", "gray")
        .style("stroke-dasharray", "4");

    // Show tooltip when hovering over circle
    var tooltip = d3.select("#tooltip");

    var showTooltip = function (d) {
        tooltip.transition().duration(200);
        tooltip
            .style("opacity", 1)
            .html("Units Sold: " + d.UnitsSold)
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 28) + "px")
            .style("background-color", "#FF5BA7")
            .style("font-size", "15px")
            .style("color", "white");
    };

    var hideTooltip = function (d) {
        tooltip.transition()
            .duration(500)
            .style("opacity", 0);
    };

    circles.on("mouseover", showTooltip)
        .on("mouseout", hideTooltip);

    // Function to update the chart based on selected country
    function update(selectedCountry) {
        var filteredData = data.filter(function (d) { return d.Country == selectedCountry; });

        // Update circles
        circles.data(filteredData)
            .exit()
            .remove()
            .enter()
            .append("circle")
            .merge(circles)
            .transition()
            .duration(1000)
            .attr("cx", function (d) { return x(d.OrderDate); })
            .attr("cy", function (d) { return y(d.UnitsSold); })
            .style("fill", function (d) { return regionColorScale(d.Region); });

        // Update lines
        lines.data(filteredData)
            .exit()
            .remove()
            .enter()
            .append("line")
            .merge(lines)
            .transition()
            .duration(1000)
            .attr("x1", function (d) { return x(d.OrderDate); })
            .attr("y1", function (d) { return y(d.UnitsSold); })
            .attr("x2", function (d) { return x(d.OrderDate); })
            .attr("y2", height);
    }

    // When the button for countries is changed, run the update function
    d3.select("#selectButton").on("change", function (d) {
        var selectedCountry = d3.select(this).property("value");
        update(selectedCountry);
    });
});
