/*
 *  AirQuality - Object constructor function
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

        vis.margin = {top: 40, right: 40, bottom: 60, left: 40};

        vis.width = $('#' + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $('#' + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;


        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        // Overlay with path clipping
        vis.svg.append("defs").append("clipPath")
            .attr("id", "clip")

            .append("rect")
            .attr("width", vis.width)
            .attr("height", vis.height);

        // Scales and axes
        vis.x = d3.scaleUtc()
            .range([0, vis.width]);

        vis.y = d3.scaleLinear()
            .range([vis.height, 0]);

        vis.xAxis = d3.axisBottom()
            .scale(vis.x);

        vis.yAxis = d3.axisLeft()
            .scale(vis.y);

        vis.svg.append("g")
            .attr("class", "x-axis axis")
            .attr("transform", "translate(0," + vis.height + ")");

        vis.svg.append("g")
            .attr("class", "y-axis axis");

        vis.svg.append("path")
            .attr('class', 'aq-line')

    }

    /*
     * Data wrangling
     */
    wrangleData(){
        let vis = this;

        let data = airQualityData.filter(elem => {
            let row_date = dateParser(elem.date.utc)
            return selectionDomain[0] <= row_date && row_date < selectionDomain[1];
        })

        // Update the visualization
        vis.updateVis(data);
    }

    /*
     * The drawing function - should use the D3 update sequence (enter, update, exit)
     * Function parameters only needed if different kinds of updates are needed
     */
    updateVis(data){
        let vis = this;

        // Update domain
        // Get the maximum of the multi-dimensional array or in other words, get the highest peak of the uppermost layer
        vis.x.domain(selectionDomain);
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
        vis.svg.select("path.aq-line")
            .datum(data.filter(vis.area.defined()))
            .transition()
            .attr("fill", "#ccc")
            .attr("d", vis.area);

        // Call axis functions with the new domain
        vis.svg.select(".x-axis")
            .transition()
            .call(vis.xAxis);
        vis.svg.select(".y-axis")
            .transition()
            .call(vis.yAxis);
        vis.svg.select("path.aq-line")
    }
}