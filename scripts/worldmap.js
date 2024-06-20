const width = 600, height = 450;

const projection = d3.geoMercator()
                     .scale(90)
                     .translate([width / 2, height / 1.5]);
                     
const path = d3.geoPath()
               .projection(projection);

const svg = d3.select("#worldmap")
              .attr("width", width)
              .attr("height", height);

const tooltip = d3.select("body")
                  .append("div")
                  .attr("class", "tooltip")
                  .style("opacity", 1)
                  .style("visibility", "hidden")
                  .style("background-color", "#FF5BA7")
                  .style("font-size", "15px")
                  .style("color", "white");

const colors = ["#F48FB1", "#F06292", "#E91E63", "#C2185B"]; 
const profitRanges = [15000000, 17000000, 20000000];

d3.json("https://unpkg.com/world-atlas@2.0.2/countries-110m.json")
  .then(worldData => {
    d3.json("../data/data.json")
      .then(profitData => {
        const countryProfitMap = new Map();
        profitData.forEach(item => {
            const country = item.Country;
            const profit = item["Total Profit"];
            if (countryProfitMap.has(country)) {
                countryProfitMap.set(country, countryProfitMap.get(country) + profit);
            } else {
                countryProfitMap.set(country, profit);
            }
        });

        const countries = topojson.feature(worldData, worldData.objects.countries);
        svg.selectAll("path")
           .data(countries.features)
           .enter()
           .append("path")
           .attr("d", path)
           .style("fill", function(d) {   
                const profit = countryProfitMap.get(d.properties.name) || null;

                if (profit !== null) {
                    if (profit <= profitRanges[0]) {
                        return colors[0];
                    } else if (profit <= profitRanges[1]) {
                        return colors[1];
                    } else if (profit <= profitRanges[2]) {
                        return colors[2];
                    } else {
                        return colors[3];
                    }
                } else {
                    return "#BDBDBD"; 
                }
            })
            .on("mouseover", function(d) {
                const totalProfit = countryProfitMap.get(d.properties.name) || null;
                tooltip.html(`${d.properties.name}<br>Total Profit: ${totalProfit !== null ? totalProfit
                       .toFixed(2) + "$" : "N/A"}`)
                       .style("visibility", "visible");
            })
            .on("mousemove", d => tooltip.style("top", (d3.event.pageY - 10) + "px")
                                         .style("left", (d3.event.pageX + 10) + "px"))
            .on("mouseout", function(d) {
                tooltip.style("visibility", "hidden");
            })
            .on("click", function(d) {
                //Zoom
                const bounds = path.bounds(d);
                const [x0, y0] = bounds[0];
                const [x1, y1] = bounds[1];
                const dx = x1 - x0;
                const dy = y1 - y0;
                const x = (x0 + x1) / 2;
                const y = (y0 + y1) / 2;
                const scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / width, dy / height)));
                const translate = [width / 2 - scale * x, height / 2 - scale * y];

                svg.transition()
                   .duration(750)
                   .call(zoom.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale));
                svg.selectAll("path")
                   .classed("zoomed", false);
                d3.select(this)
                  .classed("zoomed", true);
                setTimeout(() => { 
                    svg.transition()
                       .duration(750)
                       .call(zoom.transform, d3.zoomIdentity); 
                    svg.selectAll("path")
                       .classed("zoomed", false); 
                    }, 5000);
            });
        
        const zoom = d3.zoom()
                      .scaleExtent([1, 8])
                      .on("zoom", () => svg.selectAll("path")
                                           .attr("transform", d3.event.transform));
        svg.call(zoom);
      });
  });

  const legend = d3.select("#legend")
                   .selectAll(".legend")
                   .data(profitRanges.concat([Infinity]))
                   .enter()
                   .append("div")
                   .attr("class", "legend")
                   .html(function (d, i) {
                        const color = i < colors.length ? colors[i] : colors[colors.length - 1];
                        const rangeStart = i === 0 ? 0 : profitRanges[i - 1];
                        const rangeEnd = d;
                        return `<span class="color-box" style="--color:${color};"></span>$${rangeStart.toLocaleString()}${rangeEnd !== Infinity ? ' to $' + rangeEnd.toLocaleString() : ' and more'}`;
  });
