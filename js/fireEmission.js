/*
 *  FireEmission - Object constructor function
 *  @param _parentElement   -- HTML element in which to draw the visualization
 *  @param _data            -- Array with all stations of the bike-sharing network
 */


class FireEmission {

// constructor method to initialize StackedAreaChart object
    constructor(parentElement) {
        this.parentElement = parentElement;
        this.initVis();
    }


    /*
     * Method that initializes the visualization (static content, e.g. SVG area or axes)
     */
    initVis(){
        let vis = this;

        vis.margin = {top: 60, right: 40, bottom: 60, left: 60};

        vis.width = $('#' + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $('#' + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;


        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        vis.svg.append("text")
            .text("Average concentration v. total carbon emission (weekly)")
            .attr("transform", "translate(" + vis.width/2 + ", -15)")
            .attr("class", "chart-title");

        // Overlay with path clipping
        // vis.svg.append("defs").append("clipPath")
        //     .attr("id", "clip")
        //
        //     .append("rect")
        //     .attr("width", vis.width)
        //     .attr("height", vis.height);

        // Scales and axes
        vis.x = d3.scaleLinear()
            .range([0, vis.width]);

        vis.y = d3.scaleLinear()
            .range([vis.height, 0]);

        vis.radius = d3.scaleLinear()
            .range([3, 10]);

        vis.aqColor = d3.scaleSequential(d3.interpolateReds);

        vis.xAxis = d3.axisBottom()
            .scale(vis.x);

        vis.yAxisLeft = d3.axisLeft()
            .scale(vis.y);

        vis.svg.append("g")
            .attr("class", "x-axis axis axis-red")
            .attr("transform", "translate(0," + vis.height + ")")
            .append("text")
            .attr("x", vis.width/2)
            .attr("y", 35)
            .attr("class", "axis-label x-axis-label");

        vis.svg.append("g")
            .attr("class", "y-axis y-axis-left axis axis-blue")
            .attr("transform", "translate(" + -10 + " ,0)")
            .append("text")
            .attr("x", -vis.height/2)
            .attr("y", -40)
            .attr("class", "axis-label y-axis-label y-axis-label-left")
            .attr("transform", "rotate(-90)");


    }

    /*
     * Data wrangling
     */
    wrangleData(){
        let vis = this;


        let start_date = selectionDomain[0]
        let end_date = selectionDomain[1]
        start_date.setDate(start_date.getDate() - 1);
        end_date.setDate(end_date.getDate() + 1);
        let date_range = d3.utcDay.range(start_date, end_date, 7);
        vis.scatter_data = [];
        date_range.forEach(date_a => {
            let date_b = new Date(date_a)
            date_b.setDate(date_b.getDate() + 7);
            date_b = date_b < end_date ? date_b : end_date
            // console.log(date_a, date_b)

            let meanAQ = d3.mean(
                displayAirQualityData.filter(elem => {
                    return date_a <= dateParser(elem.date.utc) && dateParser(elem.date.utc) < date_b
                }),
                d => d.value
            );
            let sumEmission = d3.sum(
                displayFireData.filter(elem => date_a <= elem.time && elem.time < date_b),
                d => d.emission
            );
            vis.scatter_data.push({
                date: date_a,
                value: meanAQ,
                emission: sumEmission
            });
        });


        // Update the visualization
        vis.updateVis();
    }

    /*
     * The drawing function - should use the D3 update sequence (enter, update, exit)
     * Function parameters only needed if different kinds of updates are needed
     */
    updateVis(){
        let vis = this;

        // Update domain
        // Get the maximum of the multi-dimensional array or in other words, get the highest peak of the uppermost layer
        let emission_max = d3.max(vis.scatter_data, d => d.emission)
        let value_max = d3.max(vis.scatter_data, d => d.value)
        vis.x.domain([0, emission_max * 1.05]);
        vis.y.domain([0, value_max * 1.05]);
        vis.radius.domain([0, d3.max(vis.scatter_data, d => d.value)]);
        vis.aqColor.domain([0, d3.max(vis.scatter_data, d => d.emission)]);

        let circles = vis.svg.selectAll("circle.scatter")
            .data(vis.scatter_data, d => d.date);

        circles
            // adding
            .enter()
            .append("circle")
            .attr("class", "scatter")
            .attr("fill-opacity", .8)
            .attr('stroke', 'black')
            // merging
            .merge(circles)
            .transition()
            .attr("r", d => vis.radius(d.value))
            .attr("fill", d => vis.aqColor(d.emission))
            .attr("cx", d => vis.x(d.emission))
            .attr("cy", d => vis.y(d.value));

        circles.exit().remove();

        // Call axis functions with the new domain
        vis.svg.select(".x-axis")
            .transition()
            .call(vis.xAxis);
        vis.svg.select(".y-axis-left")
            .transition()
            .call(vis.yAxisLeft);

        vis.svg.select(".y-axis-label-left")
            .text("Weekly average " + contam_dict[displayAirQualityData[0].parameter] + " concentration (" + displayAirQualityData[0].unit + ")");

        vis.svg.select(".x-axis-label")
            .text("Carbon emission per week g-C/m²");

    }
}