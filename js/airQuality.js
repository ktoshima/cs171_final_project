/*
 *  AirQuality - Object constructor function
 *  @param _parentElement   -- HTML element in which to draw the visualization
 *  @param _data            -- Array with all stations of the bike-sharing network
 */


class AirQuality {

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

        vis.margin = {top: 40, right: 60, bottom: 60, left: 60};

        vis.width = $('#' + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $('#' + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;


        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        vis.svg.append("text")
            .text("Contaminant concentration & Carbon emission from wildfire")
            .attr("transform", "translate(" + vis.width/2 + ", -10)")
            .attr("class", "chart-title");


        // // Overlay with path clipping
        // vis.svg.append("defs").append("clipPath")
        //     .attr("id", "clip")
        //
        //     .append("rect")
        //     .attr("width", vis.width)
        //     .attr("height", vis.height);

        // Scales and axes
        vis.x = d3.scaleUtc()
            .range([0, vis.width]);

        vis.y_aq = d3.scaleLinear()
            .range([vis.height, 0]);

        vis.y_fire = d3.scaleLinear()
            .range([vis.height, 0]);

        vis.xAxis = d3.axisBottom()
            .scale(vis.x)
            .ticks(5);

        vis.yAxisLeft = d3.axisLeft()
            .scale(vis.y_aq);

        vis.yAxisRight= d3.axisRight()
            .scale(vis.y_fire);

        vis.svg.append("g")
            .attr("class", "x-axis axis")
            .attr("transform", "translate(0," + vis.height + ")")
            .append("text")
            .attr("x", vis.width/2)
            .attr("y", 30)
            .attr("class", "axis-label x-axis-label");


        vis.svg.append("g")
            .attr("class", "y-axis y-axis-left axis-blue")
            .append("text")
            .attr("x", -vis.height/2)
            .attr("y", -40)
            .attr("class", "axis-label y-axis-label y-axis-label-left")
            .attr("transform", "rotate(-90)");

        vis.svg.append("g")
            .attr("class", "y-axis y-axis-right axis-red")
            .attr("transform", "translate(" + vis.width + " ,0)")
            .append("text")
            .attr("x", -vis.height/2)
            .attr("y", 40)
            .attr("class", "axis-label y-axis-label y-axis-label-right")
            .attr("transform", "rotate(-90)");

        vis.svg.append("path")
            .attr("stroke", "none")
            .attr("fill", "steelblue")
            .attr("fill-opacity", 0.5)
            .attr('class', 'aq-line')

        vis.svg.append("path")
            .attr("stroke", "none")
            .attr("fill", "red")
            .attr("fill-opacity", 0.5)
            .attr('class', 'fire-line')

    }

    /*
     * Data wrangling
     */
    wrangleData(){
        let vis = this;

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
        vis.x.domain(selectionDomain);
        vis.y_aq.domain([0, d3.max(displayAirQualityData, d => d.value)]);
        vis.y_fire.domain([0, Math.max(d3.max(displayFireData, d => d.emission), 1.)]);

        // SVG area path generator
        vis.area_aq = d3.area()
            .defined(d => {
                return !isNaN(d.value)
            })
            .x(function(d) {
                return vis.x(dateParser(d.date.utc));
            })
            .y0(vis.height)
            .y1(function(d) {
                return vis.y_aq(d.value);
            });

        vis.area_fire = d3.area()
            .x(function(d) {
                return vis.x(d.time);
            })
            .y0(vis.height)
            .y1(function(d) {
                return vis.y_fire(d.emission);
            });

        // Draw area by using the path generator
        vis.svg.select("path.aq-line")
            .datum(displayAirQualityData.filter(vis.area_aq.defined()))
            .transition()
            .attr("d", vis.area_aq);

        vis.svg.select("path.fire-line")
            .datum(displayFireData)
            .transition()
            .attr("d", vis.area_fire);

        // Call axis functions with the new domain
        vis.svg.select(".x-axis")
            .transition()
            .call(vis.xAxis);
        vis.svg.select(".y-axis-left")
            .transition()
            .call(vis.yAxisLeft);
        vis.svg.select(".y-axis-right")
            .transition()
            .call(vis.yAxisRight);

        vis.svg.select(".y-axis-label-left")
            .text(contam_dict[displayAirQualityData[0].parameter] + " concentration (" + displayAirQualityData[0].unit + ")");

        vis.svg.select(".y-axis-label-right")
            .text("Carbon emission per day g-C/m2");

    }
}