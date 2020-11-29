
/*
 *  StationMap - Object constructor function
 *  @param _parentElement   -- HTML element in which to draw the visualization
 *  @param _data            -- Array with all stations of the bike-sharing network
 */

class StationMap {

	/*
	 *  Constructor method
	 */
	constructor(parentElement, locationData, ozoneData, mapViewPoint) {
		this.parentElement = parentElement;
		this.locationData = locationData;
		this.ozoneData = ozoneData
		this.mapViewPoint = mapViewPoint;

		this.initVis();
	}


	/*
	 *  Initialize station map
	 */
	initVis () {
		let vis = this;

		vis.map = L.map(vis.parentElement).setView(vis.mapViewPoint, 8)

		L.Icon.Default.imagePath = 'img/';

		L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
			attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
		}).addTo(vis.map);

		vis.stationMarkers = L.layerGroup().addTo(vis.map);

		vis.parameter

		// vis.MBTALayer = L.layerGroup().addTo(vis.map);
		//
		// d3.json("data/MBTA-Lines.json")
		// 	.then(data => {
		// 		let MBTA = L.geoJSON(data, {
		// 			style: styleLine,
		// 			weight: 3,
		// 			onEachFeature: onEachLine
		// 		}).addTo(vis.map);
		// 		vis.MBTALayer.addLayer(MBTA);
		// 	});
		//
		// function styleLine(feature) {
		// 	return {color: feature.properties.LINE.toLowerCase()};
		// 	// switch (feature.properties.LINE) {
		// 	// 	case 'GREEN': return {color: 'green'};
		// 	// 	case 'RED': return {color: 'red'};
		// 	// 	case 'SILVER': return {color: 'silver'};
		// 	// 	case 'BLUE': return {color: 'blue'};
		// 	// 	case 'ORANGE': return {color: 'orange'};
		// 	// }
		// }
		//
		// function onEachLine(feature, layer) {
		// 	layer.bindPopup(feature.properties.LINE + " LINE");
		// }

		vis.wrangleData();
	}


	/*
	 *  Data wrangling
	 */
	wrangleData () {
		let vis = this;

		// Update the visualization
		vis.updateVis();
	}

	updateVis() {
		let vis = this;

		vis.stationMarkers.clearLayers()

		vis.locationData.forEach(location => {
			let popupContent =  "<strong>" + location.name + "</strong>";
			// Create a marker and bind a popup with a particular HTML content
			let marker = L.circleMarker(
				[location.lat, location.lon],
				{
					className: location.name,
					radius: 5,
					weight: 0.5,
					color: 'black',
					fill: true,
					fillColor: 'red',
					fillOpacity: 1,
					interactive: true
				})
				.bindPopup(popupContent)
				.addTo(vis.map)
				.on('click', function(e) {
					let location_name = e.target.options.className;
					let latlng = e.latlng;
					showAQ(location_name, latlng);
				});
			vis.stationMarkers.addLayer(marker);
		});




	}
}

