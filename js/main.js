// Variable for the visualization instance
let stationMap,
    timelineChart,
    airQualityChart,
    fireChart,
    locationData,
    airQualityData,
    displayAirQualityData,
    fireDataAll,
    fireData,
    displayFireData,
    locationName,
    latlng;

let dateFormatter = d3.utcFormat("%Y-%m-%dT%H:%M:%S%Z");
let dateParser = d3.utcParse("%Y-%m-%dT%H:%M:%S%Z");
let location_url = 'https://api.openaq.org/v1/locations';
let location_params = {
    country: 'US',
    parameter: "o3",
    has_geo: true,
    limit: 10000
};

let selectionDomain;

d3.csv("data/carbon_emission.csv", row => {
    row.id = +row.id;
    row.lat = +row.lat;
    row.lon = +row.lon;
    row.time = d3.utcParse("%Y-%m-%d")(row.time);
    row.emission = +row.emission;
    return row;
}).then(fire_data => {
    fireDataAll = fire_data;
    stationMap = new StationMap(
        "station-map",
        [38.56319009231658, -118.08817443255774]
    );
    timelineChart = new Timeline("timeline");
    airQualityChart = new AirQuality("chart1");
    fireChart = new FireEmission("chart2")
    getLocations("o3");
})

function changeGas() {
    let gas_param = $('#gas').val();
    console.log("gas param changed to", gas_param);
    getLocations(gas_param)
}

function getLocations(gas_param) {
    location_params.parameter = gas_param;
    let location_qs = new URLSearchParams(location_params);
    fetch(location_url+'?'+location_qs + "&activationDate[]=2018/01/01&activationDate[]=2019/01/01")
        .then(response => response.json())
        .then(data => {
            let location_list = data.results.filter(el => {
                return !(el.location.includes("Mobile") || el.location.includes("MMCA"))
            });
            locationData = new Map();

            location_list.forEach(location => {
                locationData.set(
                    location.location,
                    {
                        "name": location.location,
                        "lon": location.coordinates.longitude,
                        "lat": location.coordinates.latitude
                    })
            });
            // Display number of stations in DOM
            $("#station-count").html(Array.from(locationData.keys()).length);
            stationMap.wrangleData();
        });
}

function showAQ() {
    $("#location-name").html(locationName);
    $("#coords").html("lat: " + latlng.lat + ", lon: " + latlng.lng);
    let gas_param = $('#gas').val();
    $("#contaminant").html(contam_dict[gas_param]);
    let url = 'https://api.openaq.org/v1/measurements';
    let qs = new URLSearchParams({
        location: locationName,
        date_from: "2018-01-01",
        date_to: "2018-12-31",
        limit: 10000,
        sort: 'asc',
        parameter: gas_param,
        format: 'json'
    });
    fetch(url+'?'+qs)
        .then(response => response.json())
        .then(d => d.results)
        .then(data => {
            console.log("measurements loaded")
            airQualityData = data;
            selectionDomain = d3.extent(airQualityData, d => dateParser(d.date.utc));
            wrangleAQdata();
            gridFireData();
            wrangleFireData();
            timelineChart.wrangleData();
            airQualityChart.wrangleData();
            fireChart.wrangleData();
            fullpage_api.moveTo(2)
        });
}

function brushed() {

    // Get the extent of the current brush
    let selectionRange = d3.brushSelection(d3.select(".brush").node());

    // Convert the extent into the corresponding domain values
    if (selectionRange) {
        selectionDomain = selectionRange.map(timelineChart.x.invert);
    } else {
        selectionDomain = d3.extent(airQualityData, d => dateParser(d.date.utc))
    }
    wrangleAQdata()
    wrangleFireData()
    airQualityChart.wrangleData();
    fireChart.wrangleData()

}
