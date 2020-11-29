// Variable for the visualization instance
let stationMap,
    timelineChart,
    airQualityChart,
    displayData;

let dateFormatter = d3.utcFormat("%Y-%m-%dT%H:%M:%S%Z");
let dateParser = d3.utcParse("%Y-%m-%dT%H:%M:%S%Z");

let selectionDomain = [dateParser("2018-01-01T00:00:00Z"), dateParser("2019-01-01T00:00:00Z")]

let location_url = 'https://api.openaq.org/v1/locations'
let location_qs = new URLSearchParams({
    country: 'US',
    parameter: ['o3'],
    has_geo: true,
    limit: 10000
})

let promises = [
    // d3.json("data/locations_2018.json"),
    fetch(location_url+'?'+location_qs + "&activationDate[]=2018/01/01&activationDate[]=2019/01/01",)
        .then(response => response.json()),
];

Promise.all(promises)
    .then( function(data){ gettingStarted(data)})
    .catch( function (err){console.log(err)} );


// function that gets called once data has been fetched.
// We're handing over the fetched data to this function.
// From the data, we're creating the final data structure we need and create a new instance of the StationMap
function gettingStarted(dataArray) {

    // log data
    console.log(dataArray);

    let location_list = dataArray[0].results.filter(el => {
        return !(el.location.includes("Mobile") || el.location.includes("MMCA"))
    });
    let location_data = new Map();

    location_list.forEach(location => {
        location_data.set(
            location.location,
            {
                "name": location.location,
                "lon": location.coordinates.longitude,
                "lat": location.coordinates.latitude,
                "parameters": location.parameters
            })
    });

    let ozoneData = dataArray[1]

    // Display number of stations in DOM
    $("#station-count").html(Array.from(location_data.keys()).length);

    // Instantiate visualization object (bike-sharing stations in Boston)
    stationMap = new StationMap("station-map", location_data, ozoneData, [42.360082, -71.058880]);
    timelineChart = new Timeline("timeline")
    airQualityChart = new AirQuality("chart1")
}

function showAQ(location_name, latlng) {
    let url = 'https://api.openaq.org/v1/measurements';
    let qs = new URLSearchParams({
        location: location_name,
        date_from: "2018-01-01",
        date_to: "2018-12-31",
        limit: 10000,
        sort: 'asc',
        parameter: ['o3'],
        format: 'json'
    })
    fetch(url+'?'+qs)
        .then(response => response.json())
        .then(d => d.results)
        .then(data => {
            displayData = data;
            timelineChart.wrangleData();
            airQualityChart.wrangleData();
            // fireChart.wrangleData(location_name, latlng);
        });
}

function brushed() {

    // Get the extent of the current brush
    let selectionRange = d3.brushSelection(d3.select(".brush").node());

    // Convert the extent into the corresponding domain values
    selectionDomain = selectionRange.map(timelineChart.x.invert);

    airQualityChart.wrangleData();

}
