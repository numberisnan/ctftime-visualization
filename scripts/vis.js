// Load data from data/ctf_data.json
d3.json("data/ctf_data.json").then(renderVisualization);

const width = window.innerWidth - 100;
const height = window.innerHeight - 150;
const maxRank = 10;

function renderVisualization(data) {
    const competitions = Object.values(data).sort((a, b) => new Date(a.time) - new Date(b.time)); // Sort competitions by time


    // Scales

    const vis = d3.select("#vis").append("svg")
        .attr("width", width + 100)
        .attr("height", height + 100)
        .append("g")
        .attr("transform", `translate(${50}, ${50})`);

    const xScale = d3.scalePoint()
        .domain(competitions.map(d => d.time))
        .range([0, width])
        .padding(0.5) // Add padding to make space for labels

    const yScale = d3.scaleLinear()
        .domain([1, maxRank]) // Rank 1 is at the top
        .range([0, height]); // Inverted range to place Rank 1 at the top of the chart

    /*const colorScale = d3.scaleOrdinal()
        .domain(teams)
        .range(['#1e88e5', '#ffb300', '#00bcd4', '#43a047', '#e53935']); // Distinct colors*/


    // X axis
    vis.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xScale).tickSize(0).tickFormat(() => ""))
        .selectAll("text")
        .attr("class", "text-sm axis-label");

    // Y axis
    vis.append("g")
        .call(d3.axisLeft(yScale).ticks(maxRank).tickFormat(d3.format("d")))
        .selectAll("text")
        .attr("class", "text-sm axis-label");

    // Draw lines for each team
    vis.append("g")
        .data(competitions)
        .selectAll(".competition-line")
        .data(d => d.scores)
        .append("path")
        .attr("class", "competition-line")
        .attr("fill", "none")
        .attr("stroke", "#1e88e5")
        .attr("stroke-width", 2)
}
