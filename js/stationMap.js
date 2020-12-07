
/*
 *  StationMap - Object constructor function
 *  @param _parentElement   -- HTML element in which to draw the visualization
 *  @param _data            -- Array with all stations of the bike-sharing network
 */

class StationMap {

	/*
	 *  Constructor method
	 */
	constructor(parentElement, mapViewPoint) {
		this.parentElement = parentElement;
		this.mapViewPoint = mapViewPoint;

		this.initVis();
	}


	/*
	 *  Initialize station map
	 */
	initVis () {
		let vis = this;

		vis.map = L.map(vis.parentElement).setView(vis.mapViewPoint, 6.5)

		L.Icon.Default.imagePath = 'img/';

		L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
			attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
		}).addTo(vis.map);

		vis.stationMarkers = L.layerGroup().addTo(vis.map);

	}


	/*
	 *  Data wrangling
	 */
	wrangleData () {
		let vis = this;

		vis.locationData = locationData;

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
					locationName = e.target.options.className;
					latlng = e.latlng;
					showAQ();
					fullpage_api.moveTo(2)
				});
			vis.stationMarkers.addLayer(marker);
		});




	}
}

