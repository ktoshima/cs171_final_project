
/*
 * Timeline - ES6 Class
 * @param  parentElement 	-- the HTML element in which to draw the visualization
 * @param  data             -- the data the timeline should use
 */

class Timeline {

    // constructor method to initialize Timeline object
    constructor(parentElement){
        this._parentElement = parentElement;
        this.initVis();
    }

    // create initVis method for Timeline class
    initVis() {

        // store keyword this which refers to the object it belongs to in variable vis
        let vis = this;

        vis.margin = {top: 10, right: 0, bottom: 20, left: 0};

        vis.width = $('#' + vis._parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $('#' + vis._parentElement).height() - vis.margin.top - vis.margin.bottom;

        // SVG drawing area
        vis.svg = d3.select("#" + vis._parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        // Scales and axes
        vis.x = d3.scaleUtc()
            .range([0, vis.width]);

        vis.y = d3.scaleLinear()
            .range([vis.height, 0]);

        vis.xAxis = d3.axisBottom()
            .scale(vis.x);

        vis.svg.append("g")
            .attr("class", "x-axis axis")
            .attr("transform", "translate(0," + vis.height + ")")

        vis.svg.append("path")
            .attr("class", "timeline")

        let brush = d3.brushX()
            .extent([[0, 0], [vis.width, vis.height]])
            .on("end", brushed);
        vis.svg.append("g")
            .attr("class", "brush")
            .call(brush);

    }


    /*
     *  Data wrangling
     */
    wrangleData () {
        let vis = this;
        let data = displayData;
        vis.updateVis(data);
    }

    updateVis(data) {
        let vis = this;

        // console.log(d3.extent(data, d => d3.utcParse(d.date.utc)));
        vis.x.domain(d3.extent(data, d => dateParser(d.date.utc)))
        vis.y.domain([0, d3.max(data, d => d.value)]);

        // SVG area path generator
        vis.area = d3.area()
            .defined(d => !isNaN(d.value))
            .x(function(d) {
                return vis.x(dateParser(d.date.utc));
            })
            .y0(vis.height)
            .y1(function(d) { return vis.y(d.value); });

        // Draw area by using the path generator
        vis.svg.select("path.timeline")
            .datum(data.filter(vis.area.defined()))
            .transition()
            .attr("fill", "#ccc")
            .attr("d", vis.area);

        vis.svg.select(".x-axis")
            .transition()
            .call(vis.xAxis);

    }

}