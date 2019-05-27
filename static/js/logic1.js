function createMap(earthquakeLocations) {

    // Create the tile layer that will be the background of our map
    var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"http://mapbox.com\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.light",
        accessToken: API_KEY
    });

    // Create a baseMaps object to hold the lightmap layer
    var baseMaps = {
        "Light Map": lightmap
    };

    // Create an overlayMaps object to hold the bikeStations layer
    var overlayMaps = {
        "Earthquakes": earthquakeLocations
    };

    // Create the map object with options
    var map = L.map("map-id", {
        center: [38.754, -122.585],
        zoom: 5,
        layers: [lightmap, earthquakeLocations]
    });

    // Create a layer control, pass in the baseMaps and overlayMaps. Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(map);
}


function createCircles(response) {
    colors = [ "#a50026", "#d73027", "#f46d43", "#fdae61", 
                "#fee08b", "#d9ef8b", "#a6d96a", "#66bd63"
                ,"#1a9850", "#006837"]

    
    const earthquakes = response.features;

    // Loop through the stations array
    const locations = earthquakes.map(feature => {
        // For each earthquake, create a circle and bind a popup 
        // with the details of the earthquake
        const magnitude = feature.properties.mag;
        const coord = [feature.geometry.coordinates[1], feature.geometry.coordinates[0]];
        const popupMsg = "<h3>" + feature.properties.place + "</h3><hr>" + 
                            "<p>"  + magnitude + "</p><hr>" +
                            "<p>"  + new Date(feature.properties.time) + "</p>";
        console.log(magnitude)
        const earthquake = L.circle(coord, {
            color: "black", //colors[ 10 - Math.round(magnitude)],
            fillColor: colors[ 10 - Math.round(magnitude)],
            stroke: false,
            fillOpacity: 0.75,
            radius: (10000 * Math.round(magnitude))
         }).bindPopup(popupMsg);
        // Add the marker to the bikeMarkers array
        return earthquake;
    })

    // Create a layer group made from the bike markers array, pass it into the createMap function
    createMap(L.layerGroup(locations));
}


// Perform an API call to the Citi Bike API to get station information. Call createMarkers when complete
(async function(){
    const url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
    const response = await d3.json(url)
    createCircles(response)
})()
