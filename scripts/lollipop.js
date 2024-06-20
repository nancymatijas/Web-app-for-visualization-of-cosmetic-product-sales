const margin = { top: 30, right: 10, bottom: 130, left: 150 };
const width = 800 - margin.left - margin.right;
const height = 450 - margin.top - margin.bottom;

const svg = d3.select("#my_data")
              .append("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
              .append("g")
              .attr("transform", `translate(${margin.left},${margin.top})`);

d3.json("../data/data.json", function (error, data) {
    if (error) throw error;
    
    var allCountries = d3.set(data.map(function (d) { return d.Country; })).values();

    d3.select("#selectButton")
        .selectAll("myOptions")
        .data(allCountries)
        .enter()
        .append("option")
        .text(function (d) { return d; })
        .attr("value", function (d) { return d; });

    var parseDate = d3.timeParse("%d/%m/%Y");

    data.forEach(function (d) {
        d.OrderDate = parseDate(d["Order Date"]);
        d.UnitsSold = +d["Units Sold"];
    });

    var x = d3.scaleTime()
              .domain(d3.extent(data, function (d) { return d.OrderDate; }))
              .range([0, width]);
    svg.append("g")
       .attr("transform", "translate(0," + height + ")")
       .call(d3.axisBottom(x));
    svg.append("text")
       .attr("transform", "translate(" + width / 2 + " ," + (height + margin.top + 20) + ")")
       .style("text-anchor", "middle")
       .text("Order Date");

    var y = d3.scaleLinear()
              .domain([0, d3.max(data, function (d) { return d.UnitsSold; })])
              .range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y));
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 60)
        .attr("x", 0 - height / 2)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Units Sold");

    var initialData = data.filter(function (d) { return d.Country == allCountries[0]; });

    var circles = svg.selectAll("circle")
                     .data(initialData, function(d) { return d.OrderDate; })
                     .enter()
                     .append("circle")
                     .attr("cx", function (d) { return x(d.OrderDate); })
                     .attr("cy", function (d) { return y(d.UnitsSold); })
                     .attr("r", 6)
                     .style("fill", "#E6006A");

    var lines = svg.selectAll(".line")
                    .data(initialData, function(d) { return d.OrderDate; })
                    .enter()
                    .append("line")
                    .attr("class", "line")
                    .attr("x1", function (d) { return x(d.OrderDate); })
                    .attr("y1", function (d) { return y(d.UnitsSold); })
                    .attr("x2", function (d) { return x(d.OrderDate); })
                    .attr("y2", height)
                    .style("stroke", "gray")
                    .style("stroke-dasharray", "4")
                    .style("opacity", 1);

    var tooltip = d3.select("#tooltip");
    var showTooltip = function (d) {
        tooltip.transition()
               .duration(200);
        tooltip.style("opacity", 1)
                .html("Order Date: " + d3.timeFormat("%d/%m/%Y")(d.OrderDate) + "<br>Units Sold: " + d.UnitsSold)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 50) + "px")
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


    function update(selectedCountry) {
        var filteredData = data.filter(function(d) { return d.Country == selectedCountry; });
        
        var circles = svg.selectAll("circle")
                         .data(filteredData, function(d) { return d.OrderDate; });
        
         circles.transition()
                .duration(1000)
                .attr("cx", function(d) { return x(d.OrderDate); })
                .attr("cy", function(d) { return y(d.UnitsSold); });
        
         circles.enter()
                .append("circle")
                .attr("cx", function(d) { return x(d.OrderDate); })
                .attr("cy", function(d) { return y(d.UnitsSold); })
                .attr("r", 0)
                .style("fill", "#E6006A")
                .merge(circles) 
                .transition()
                .duration(1000)
                .attr("r", 6)
                .style("opacity", 1);
        
         circles.exit()
                .transition()
                .duration(1000)
                .attr("r", 0)
                .remove();
        
        var lines = svg.selectAll(".line")
                        .data(filteredData, function(d) { return d.OrderDate; });
        
        lines.transition()
             .duration(1000)
             .attr("x1", function(d) { return x(d.OrderDate); })
             .attr("y1", function(d) { return y(d.UnitsSold); })
             .attr("x2", function(d) { return x(d.OrderDate); });
        
        lines.enter()
             .append("line")
             .attr("class", "line")
             .attr("x1", function(d) { return x(d.OrderDate); })
             .attr("y1", function(d) { return y(d.UnitsSold); })
             .attr("x2", function(d) { return x(d.OrderDate); })
             .attr("y2", height)
             .style("stroke", "gray")
             .style("stroke-dasharray", "4")
             .style("opacity", 0)
             .merge(lines) 
             .transition()
             .duration(1000)
             .style("opacity", 1);
        
        lines.exit()
             .transition()
             .duration(1000)
             .style("opacity", 0)
             .remove();
        
        svg.selectAll("circle")
           .on("mouseover", showTooltip)
           .on("mouseout", hideTooltip);
        }
          
    d3.select("#selectButton").on("change", function () {
        var selectedCountry = d3.select(this).property("value");
        update(selectedCountry);
    });
});
