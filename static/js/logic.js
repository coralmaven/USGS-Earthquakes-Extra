function createMap(earthquakeLocations, techtonicPlates) {

   var satellitemap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"http://mapbox.com\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.satellite",
        accessToken: API_KEY
    });

    var grayscalemap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"http://mapbox.com\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.light",
        accessToken: API_KEY
    });

    var outdoorsmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"http://mapbox.com\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.outdoors",
        accessToken: API_KEY
    });

    const baseMaps = {
        Satellite: satellitemap,
        Grayscale: grayscalemap,
        Outdoors: outdoorsmap
    };

    // Create an overlayMaps object to hold the earthquakes layer
    var overlayMaps = {
        "Fault Lines": techtonicPlates,
        "Earthquakes": earthquakeLocations
    };


    // Create the map object with options
    var map = L.map("map-id", {
        center: [38.754, -122.585],
        zoom: 5,
        layers: [
            satellitemap,
            techtonicPlates,
            earthquakeLocations
        ]
    });

    // Create a layer control, pass in the baseMaps and overlayMaps. Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(map);

    // Create a legend to display information about our map
    const info = L.control({
        position: "bottomright"
    });

    // When the layer control is added, insert a div with the class of "legend"
    info.onAdd = function() {
        const div = L.DomUtil.create("div", "legend");
        return div;
    };
    // Add the info legend to the map
    info.addTo(map);
    
    
}

const magRange = ['0-1', '1-2', '2-3', '3-4', '4-5', '5-6', '6-7', '7-8', '8-9', '9-10','10+'];
const   colors = [ "#006837","#1a9850", "#66bd63", "#a6d96a", "#d9ef8b",
                "#ffffbf", "#fee08b", "#fdae61", "#f46d43","#d73027",
                   "#a50026"]

function createLegend(){

    legend = document.querySelector(".legend")

    for (i = 0; i < magRange.length; i++) {
        var magnitude = magRange[i];
        var color = colors[i];
        var item = document.createElement('div');
        var key = document.createElement('span');
        key.className = 'legend-key';
        key.style.backgroundColor = color;
      
        var value = document.createElement('span');
        value.innerHTML = magnitude;
        item.appendChild(key);
        item.appendChild(value);
        legend.appendChild(item);
      }
}

function createCircles(response) {

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

        const earthquake = L.circle(coord, {
            color: "black", //colors[ 10 - Math.round(magnitude)],
            fillColor: colors[ Math.round(magnitude)],
            stroke: false,
            fillOpacity: 0.75,
            radius: (10000 * Math.round(magnitude))
         }).bindPopup(popupMsg);

        return earthquake;
    })

    return new L.layerGroup(locations);

}

function createPlates(techtonicPlates){
    allplates = techtonicPlates.features;

    const plates = allplates.map(feature => {
        const coord = []
        feature.geometry.coordinates[0].forEach(function(c){
            coord.push([c[1], c[0]])
        })
        const popupMsg = "<h3>" + feature.properties.PlateName + "-" + feature.properties.Code + "</h3>";
        const plate = L.polygon([coord], {
            color: "orange", 
            fillOpacity: 0
         }).bindPopup(popupMsg);

        return plate;
    })
    
    return new L.LayerGroup(plates);

}

// Perform an API call to the Citi Bike API to get station information. Call createMarkers when complete
(async function(){

    const url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
    const response = await d3.json(url)
    earthquakelocations = createCircles(response)

    const platesurl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json"
    const techtonicPlatesInfo = await d3.json(platesurl)
    faultlines = createPlates(techtonicPlatesInfo)

    // Create a layer group made from the bike markers array, pass it into the createMap function
    createMap(earthquakelocations, faultlines);

    createLegend()

})()

