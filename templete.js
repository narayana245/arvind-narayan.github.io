// Load the data
const socialMedia = d3.csv("socialMedia.csv");

// Once the data is loaded, proceed with plotting
socialMedia.then(data => {
    // Convert string values to numbers
    data.forEach(d => d.Likes = +d.Likes);

    // Define the dimensions and margins for the SVG
    const margin = {top: 20, right: 30, bottom: 60, left: 60},
          width = 800 - margin.left - margin.right,
          height = 500 - margin.top - margin.bottom;

    // Create the SVG container
    const svg = d3.select("#boxplot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Set up scales for x and y axes
    const xScale = d3.scaleBand()
        .domain(["Adolescent Adults", "Mature Adults", "Senior Adults"])
        .range([0, width])
        .padding(0.2);

    const yScale = d3.scaleLinear()
        .domain([0, 1000])
        .range([height, 0]);

    // Add scales     
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale));

    svg.append("g").call(d3.axisLeft(yScale));

    // Add x-axis label
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + 50)
        .attr("text-anchor", "middle")
        .text("Age Group");

    // Add y-axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -45)
        .attr("text-anchor", "middle")
        .text("Number of Likes");

    const rollupFunction = group => {
        const values = group.map(d => d.Likes).sort(d3.ascending);
        return {
            min: d3.min(values),
            q1: d3.quantile(values, 0.25),
            median: d3.quantile(values, 0.5),
            q3: d3.quantile(values, 0.75),
            max: d3.max(values)
        };
    };

    // Groups the data by AgeGroup and calculates quartile statistics (min, q1, median, q3, max) for each group using the rollupFunction
    const quantilesByGroups = d3.rollup(data, rollupFunction, d => d.AgeGroup);

    // iterates through each age group and its calculated quantiles, extracting the x-position and box width for drawing the boxplot elements
    quantilesByGroups.forEach((q, AgeGroup) => {
        const x = xScale(AgeGroup),
              bw = xScale.bandwidth();

        // Draw vertical lines
        svg.append("line")
            .attr("x1", x + bw / 2).attr("x2", x + bw / 2)
            .attr("y1", yScale(q.min)).attr("y2", yScale(q.max))
            .attr("stroke", "black");

        // Draw box
        svg.append("rect")
            .attr("x", x).attr("y", yScale(q.q3))
            .attr("width", bw)
            .attr("height", yScale(q.q1) - yScale(q.q3))
            .attr("fill", "#f5f9ff").attr("stroke", "black").attr("stroke-width", 2);

        // Draw median line
        svg.append("line")
            .attr("x1", x).attr("x2", x + bw)
            .attr("y1", yScale(q.median)).attr("y2", yScale(q.median))
            .attr("stroke", "black").attr("stroke-width", 2);
    });
});

// Prepare you data and load the data again. 
// This data should contains three columns, platform, post type and average number of likes. 
const socialMediaAvg = d3.csv("socialMediaAvg.csv");

socialMediaAvg.then(data => {
    // Convert string values to numbers
    data.forEach(d => d.AvgLikes = +d.AvgLikes);

    // Define the dimensions and margins for the SVG
    const margin = {top: 60, right: 30, bottom: 60, left: 60},
          width = 800 - margin.left - margin.right,
          height = 500 - margin.top - margin.bottom;

    // Create the SVG container
    const svg = d3.select("#barplot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Define four scales
    const x0 = d3.scaleBand()
        .domain([...new Set(data.map(d => d.Platform))])
        .range([0, width])
        .padding(0.2);

    const x1 = d3.scaleBand()
        .domain([...new Set(data.map(d => d.PostType))])
        .range([0, x0.bandwidth()])
        .padding(0.05);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.AvgLikes)])
        .range([height, 0]);

    const color = d3.scaleOrdinal()
        .domain([...new Set(data.map(d => d.PostType))])
        .range(["#1f77b4", "#ff7f0e", "#2ca02c"]);    
         
    // Add scales x0 and y     
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x0));

    svg.append("g").call(d3.axisLeft(y));

    // Add x-axis label
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + 50)
        .attr("text-anchor", "middle")
        .text("Platform");

    // Add y-axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -45)
        .attr("text-anchor", "middle")
        .text("Average Number of Likes");

    // Draw bars
    svg.selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", d => x0(d.Platform) + x1(d.PostType))
        .attr("y", d => y(d.AvgLikes))
        .attr("width", x1.bandwidth())
        .attr("height", d => height - y(d.AvgLikes))
        .attr("fill", d => color(d.PostType));

    // Add the legend
    const legend = svg.append("g").attr("transform", `translate(${width - 100}, -40)`),
          types = [...new Set(data.map(d => d.PostType))];

    types.forEach((type, i) => {
        legend.append("rect")
            .attr("x", 0).attr("y", i * 20)
            .attr("width", 15).attr("height", 15)
            .attr("fill", color(type));

        legend.append("text")
            .attr("x", 20).attr("y", i * 20 + 7.5)
            .text(type).attr("alignment-baseline", "middle");
    });
});

// Prepare you data and load the data again. 
// This data should contains two columns, date (3/1-3/7) and average number of likes. 
const socialMediaTime = d3.csv("SocialMediaTime.csv");

socialMediaTime.then(data => {
    // Convert string values to numbers
    data.forEach(d => d.AvgLikes = +d.AvgLikes);

    // Define the dimensions and margins for the SVG
    const margin = {top: 20, right: 30, bottom: 60, left: 60},
          width = 800 - margin.left - margin.right,
          height = 500 - margin.top - margin.bottom;

    // Create the SVG container
    const svg = d3.select("#lineplot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Set up scales for x and y axes  
    const xScale = d3.scaleBand()
        .domain(data.map(d => d.Date))
        .range([0, width])
        .padding(0.1);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.AvgLikes)])
        .range([height, 0]);

    // Draw the axis, you can rotate the text in the x-axis here
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

    svg.append("g").call(d3.axisLeft(yScale));

    // Add x-axis label
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + 50)
        .attr("text-anchor", "middle")
        .text("Date");

    // Add y-axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -45)
        .attr("text-anchor", "middle")
        .text("Average Number of Likes");

    // Draw the line and path. Remember to use curveNatural. 
    const line = d3.line()
        .x(d => xScale(d.Date) + xScale.bandwidth() / 2)
        .y(d => yScale(d.AvgLikes))
        .curve(d3.curveNatural);

    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2)
        .attr("d", line);

    // Add points at each data point
    svg.selectAll(".dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "dot")
        .attr("cx", d => xScale(d.Date) + xScale.bandwidth() / 2)
        .attr("cy", d => yScale(d.AvgLikes))
        .attr("r", 5)
        .attr("fill", "steelblue")
        .attr("stroke", "white")
        .attr("stroke-width", 2);
});
