const options = { connect_days: 28 };
const filter = { team_filter: "", title_filter: "", country_filter: "" };
const teams_to_compare = ["", ""];

const width = window.innerWidth - 100;
const height = window.innerHeight - 300;
const maxRank = 10;

function renderVisualization(data, options) {
    const scores = data.sort((a, b) => new Date(a.time) - new Date(b.time));
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
            return s.length > 0;
        });

    let date_ticks = d3.range(11).map(i => {
        return mintime + i * (maxtime - mintime) / 10;
    });

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
    let lines = vis.select(".lines")
        .selectAll(".line")
        .data(d3.group(scores, d => d.team_id)) // Group data by team
    
    lines.exit().remove(); // Remove old lines

    lines
        .enter()
        .append("path")
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", d => d3.schemeCategory10[d[0] % 10]) // Use D3's category10 color scheme
        .attr("stroke-width", 2)
        .attr("d", d => bumpLine(d[1])); // d[1] contains the array of scores for the team

    // Draw points
    points = vis.select(".points")
        .selectAll(".point")
        .data(scores)

    points.exit().remove(); // Exit

    // Enter
    const pointsEnter = points
        .enter()
        .append("circle")
        .attr("class", "point")
        .attr("r", 4)
        .attr("fill", d => d3.schemeCategory10[d.team_id % 10]); // Use team_id for color scheme

    pointsEnter
        .append("title")
        .text(d => `${d.team_name}\nRank: ${d.place}\nDate: ${new Date(d.time * 1000).toLocaleDateString()}\nCompetition: ${d.competition_title}\nCountry: ${d.country_name}`);

    // Merge Enter and Update selections
    points = pointsEnter.merge(points);

    // Apply transitions and positional updates to the MERGED selection (Enter + Update)
    points
        .transition()
        .duration(200)
        .attr("cx", d => xScale(d.time))
        .attr("cy", d => yScale(d.place));

    // Update selection: Ensure color and title are correct for existing points (the 'points' selection before merge)
    points
        // Select the title element of the updated points and update its text
        .select("title")
        .text(d => `${d.team_name}\nRank: ${d.place}\nDate: ${new Date(d.time * 1000).toLocaleDateString()}\nCompetition: ${d.competition_title}\nCountry: ${d.country_name}`);

    // Update the fill color for all merged points, including those that existed before (if their team_id/data changed)
    points
        .attr("fill", d => d3.schemeCategory10[d.team_id % 10]);
}

function on_data_loaded(data) {
    renderVisualization(data, options);

    // Attach event listener to the range input
    d3.select("#connect_days").on("input", function() {
        const connect_days = +this.value;
        d3.select("#connect_days_value").text(connect_days);
        const new_options = { ...options, connect_days: connect_days };
        d3.select(".lines").selectAll("*").remove(); // Clear existing visualization
        renderVisualization(data, new_options);
    });

    d3.select("#team_filter").on("input", function() {
        filter.team_filter = this.value;
        d3.select(".lines").selectAll("*").remove(); // Clear existing visualization
        const filtered_data = data.filter(d => (d.country.includes(filter.country_filter) || d.country_name.includes(filter.country_filter)) && d.team_name.includes(filter.team_filter) && d.competition_title.includes(filter.title_filter));
        renderVisualization(filtered_data, options);
    });

    d3.select("#title_filter").on("input", function() {
        filter.title_filter = this.value;
        d3.select(".lines").selectAll("*").remove(); // Clear existing visualization
        const filtered_data = data.filter(d => (d.country.includes(filter.country_filter) || d.country_name.includes(filter.country_filter)) && d.team_name.includes(filter.team_filter) && d.competition_title.includes(filter.title_filter));
        renderVisualization(filtered_data, options);
    });

    d3.select("#country_filter").on("input", function() {
        filter.country_filter = this.value;
        d3.select(".lines").selectAll("*").remove(); // Clear existing visualization
        const filtered_data = data.filter(d => (d.country.includes(filter.country_filter) || d.country_name.includes(filter.country_filter)) && d.team_name.includes(filter.team_filter) && d.competition_title.includes(filter.title_filter));
        renderVisualization(filtered_data, options);
    });

    d3.select("#compare_mode").on("input", function() {
        teams_to_compare[0] = this.value;
        d3.select(".lines").selectAll("*").remove(); // Clear existing visualization
        const filtered_data = data.filter(d => d.team_name === teams_to_compare[0] || d.team_name === teams_to_compare[1]);
        renderVisualization(filtered_data, options);
    });

    d3.select("#compare_mode_2").on("input", function() {
        teams_to_compare[1] = this.value;
        d3.select(".lines").selectAll("*").remove(); // Clear existing visualization
        const filtered_data = data.filter(d => d.team_name === teams_to_compare[0] || d.team_name === teams_to_compare[1]);
        renderVisualization(filtered_data, options);
    });
}

// Load data from data/flattened_scores.json
d3.json("data/data.json").then( data => on_data_loaded(data));