const margin = { top: 30, right: 10, bottom: 130, left: 90 };
const width = 1100 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

const svg = d3.select("#my_data")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

// Definiranje tooltip-a
const tooltip = d3.select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0)
  .style("visibility", "hidden")
  .style("background-color", "#FF5BA7")
  .style("font-size", "15px")
  .style("color", "white");

function sortData(isDescending) {
  svg.selectAll("*").remove();
  d3.json("../data/data.json", function(data) {
    // Zbrojiti podatke ako postoje više stavki za istu državu
    const countryData = {};
    data.forEach(item => {
      const country = item.Country;
      if (!countryData[country]) {
        countryData[country] = {
          Country: country,
          UnitsSold: 0
        };
      }
      countryData[country].UnitsSold += item["Units Sold"];
    });

    // Pretvoriti objekt u niz
    const dataArray = Object.values(countryData);

    // Sortirati podatke prema prodanim jedinicama
    dataArray.sort((a, b) => isDescending ? b.UnitsSold - a.UnitsSold : a.UnitsSold - b.UnitsSold);

    const topData = dataArray.slice(0, 10);

    const x = d3.scaleBand()
      .range([0, width])
      .domain(topData.map(d => d.Country))
      .padding(0.2);
    const y = d3.scaleLinear()
      .domain([0, d3.max(topData, d => parseFloat(d.UnitsSold))])
      .range([height, 0]);

    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end");

    svg.append("g").call(d3.axisLeft(y));

    // X oznaka
    svg.append("text")
      .attr("transform", `translate(${width / 2}, ${height + margin.bottom / 2})`)
      .style("text-anchor", "middle")
      .text("Country");

    // Y oznaka
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - height / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Units Sold");

    svg.selectAll(".bar")
      .data(topData)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.Country))
      .attr("width", x.bandwidth())
      .attr("y", d => y(parseFloat(d.UnitsSold)))
      .attr("height", d => height - y(parseFloat(d.UnitsSold)))
      .attr("fill", "#AFAFB1")
      .on("mouseover", function(d) {
        tooltip.style("visibility", "visible");
        tooltip.transition()
          .duration(200)
          .style("opacity", .9);
        tooltip.html(`<strong>${d.Country}</strong><br/>Units Sold: ${d.UnitsSold}`)
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY - 28) + "px");
      })
      .on("mousemove", function() {
        tooltip.style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY - 28) + "px");
      })
      .on("mouseout", function() {
        tooltip.style("visibility", "hidden");
        tooltip.transition()
          .duration(500)
          .style("opacity", 0);
      });
  });
}
