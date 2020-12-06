function wrangleAQdata() {
    displayAirQualityData = airQualityData.filter(elem => {
        let row_date = dateParser(elem.date.utc);
        return selectionDomain[0] <= row_date && row_date < selectionDomain[1];
    })
}

function gridFireData() {
    fireData = fireDataAll.filter(elem => {
        return elem.lat >= latlng.lat && latlng.lat >= elem.lat - 2.5
            && elem.lon <= latlng.lng && latlng.lng <= elem.lon + 2.5;
    });
}

function wrangleFireData() {
    displayFireData = fireData.filter(elem => {
        return selectionDomain[0] <= elem.time && elem.time < selectionDomain[1]
    });
}