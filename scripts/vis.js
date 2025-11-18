const default_options = { connect_days: 28 };

// Load data from data/flattened_scores.json
d3.json("data/flattened_scores.json").then( data => renderVisualization(data, default_options) );

const width = window.innerWidth - 100;
const height = window.innerHeight - 150;
const maxRank = 10;

function renderVisualization(data, options) {
    const scores = data.sort((a, b) => new Date(a.time) - new Date(b.time)).filter(d => d.team_name.includes("L3ak"))
    console.log(scores);

    // Scales and Axes
    d3.select("#bump")
        .attr("width", width + 100)
        .attr("height", height + 100)
    
    const vis = d3.select(".main")
        .attr("transform", `translate(${50}, ${50})`);

    let mintime = d3.min(scores, d => d.time);
    let maxtime = d3.max(scores, d => d.time);

    const xScale = d3.scaleLinear()
        .domain([mintime, maxtime])
        .range([0, width]);

    const yScale = d3.scaleLinear()
        .domain([1, maxRank]) // Rank 1 is at the top
        .range([0, height]); // Inverted range to place Rank 1 at the top of the chart

    const bumpLine = d3.line()
        .x(d => xScale(d.time))
        .y(d => yScale(d.place))
        .curve(d3.curveMonotoneX) // Smooth curve
        .defined((d, i, data) => {
            let s = data.filter(score => score.team_id === d.team_id && score.time != d.time && Math.abs(score.time - d.time) < options.connect_days * 24 * 3600) // Only connect points within x days
            console.log(s);
            return s.length > 0;
        });

    let date_ticks = d3.range(11).map(i => {
        return mintime + i * (maxtime - mintime) / 10;
    });

    //console.log(date_ticks);

    // X axis
    vis.select(".x_axis")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xScale).tickValues(date_ticks).tickFormat(d => new Date(d * 1000).toLocaleDateString()))
        .selectAll("text")
        .attr("class", "text-sm axis-label");

    // Y axis
    vis.select(".y_axis")
        .call(d3.axisLeft(yScale).ticks(maxRank).tickFormat(d3.format("d")))
        .selectAll("text")
        .attr("class", "text-sm axis-label");

    // Draw lines for each team
    vis.select(".lines")
        .selectAll(".line")
        .data(d3.group(scores, d => d.team_id)) // Group data by team
        .enter()
        .append("path")
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", (d, i) => d3.schemeCategory10[i % 10]) // Use D3's category10 color scheme
        .attr("stroke-width", 2)
        .attr("d", d => bumpLine(d[1])); // d[1] contains the array of scores for the team
}

function updateVisualization(data, options) {
    // Future implementation for dynamic updates
}