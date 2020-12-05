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

        vis.y_aq = d3.scaleLinear()
            .range([vis.height, 0]);

        vis.y_fire = d3.scaleLinear()
            .range([vis.height, 0]);

        vis.xAxis = d3.axisBottom()
            .scale(vis.x);

        vis.yAxisLeft = d3.axisLeft()
            .scale(vis.y_aq);

        vis.yAxisRight= d3.axisRight()
            .scale(vis.y_fire);

        vis.svg.append("g")
            .attr("class", "x-axis axis")
            .attr("transform", "translate(0," + vis.height + ")");

        vis.svg.append("g")
            .attr("class", "y-axis y-axis-left axis")
            // .style("fill", "steelblue");

        vis.svg.append("g")
            .attr("class", "y-axis y-axis-right axis")
            .attr("transform", "translate(" + vis.width + " ,0)")
            // .style("fill", "red");

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

        let aqdata = airQualityData.filter(elem => {
            let row_date = dateParser(elem.date.utc)
            return selectionDomain[0] <= row_date && row_date < selectionDomain[1];
        });
        console.log(aqdata);

        let firedata = fireData.filter(elem => {
            return selectionDomain[0] <= elem.time && elem.time < selectionDomain[1]
                && elem.lat >= latlng.lat && latlng.lat >= elem.lat - 2.5
                && elem.lon <= latlng.lng && latlng.lng <= elem.lon + 2.5;
        });
        console.log(firedata);

        // Update the visualization
        vis.updateVis(aqdata, firedata);
    }

    /*
     * The drawing function - should use the D3 update sequence (enter, update, exit)
     * Function parameters only needed if different kinds of updates are needed
     */
    updateVis(aqdata, firedata){
        let vis = this;

        // Update domain
        // Get the maximum of the multi-dimensional array or in other words, get the highest peak of the uppermost layer
        vis.x.domain(selectionDomain);
        vis.y_aq.domain([0, d3.max(aqdata, d => d.value)]);
        vis.y_fire.domain([0, Math.max(d3.max(firedata, d => d.emission), 1.)]);

        // SVG area path generator
        vis.area_aq = d3.area()
            .defined(d => !isNaN(d.value))
            .x(function(d) {
                return vis.x(dateParser(d.date.utc));
            })
            .y0(vis.height)
            .y1(function(d) { return vis.y_aq(d.value); });

        vis.area_fire = d3.area()
            .x(function(d) {
                return vis.x(d.time);
            })
            .y0(vis.height)
            .y1(function(d) { return vis.y_fire(d.emission); });

        // Draw area by using the path generator
        vis.svg.select("path.aq-line")
            .datum(aqdata.filter(vis.area_aq.defined()))
            .transition()
            .attr("d", vis.area_aq);

        vis.svg.select("path.fire-line")
            .datum(firedata)
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

    }
}