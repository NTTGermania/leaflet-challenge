// Geojson url for tectonic plates and earthquakes in the last 7 days
const geojson_earthquake_url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Your data markers should reflect the magnitude of the earthquake by their size and the depth of the earthquake by color. 
// Earthquakes with higher magnitudes should appear larger, and earthquakes with greater depth should appear darker in color.


// Getting our Geojson data with a get request to the query URL
d3.json(geojson_earthquake_url).then(function(data){
    console.log(data)
    createFeatures(data.features);
});

// Marker colours function
function markercolours(depth){
    switch (true) {
        case depth > 90:
            return "#58184c";
        case depth> 70:
            return "#900c43";
        case depth> 50:
            return "#c7004c";
        case depth > 30:
            return "#ff5733";
        case depth> 10:
            return "#ffc400";
        default:
            return "#DAF7A6";
        }
}

// Create markers that have size and colour correspond with magnitude and depth
function pointToLayer(feature, latlng) {
    return L.circleMarker(latlng, {radius: feature.properties.mag*4,
    fillColor: markercolours(feature.geometry.coordinates[2]),
    weight: 0.7,
    opacity: 0.8,
    fillOpacity: 0.9
    });      
}
// Increase marker size based on magnitude
function markerSize(magnitude) {
    if (magnitude === 0) {
        return 1;
    }
    return magnitude * 7;
}
// Create feature function
function createFeatures(earthquakeData){

    function onEachFeature(feature, layer){
        layer.bindPopup(`<h4>Location:</h4> ${feature.properties.place}<h4> Magnitude:</h4> ${feature.properties.mag}<h4> Depth:</h4> ${feature.geometry.coordinates[2]}`);
    } 

    // Create a GeoJSON layer that contains the features array on the earthquakeData object.
    // Run the onEachFeature function for each piece of data in the array.

    let earthquakes = L.geoJSON(earthquakeData, {
        pointToLayer: pointToLayer,
        onEachFeature: onEachFeature
      });  
    // Send earthquakes layer to the createMap function
    createMap(earthquakes);
}


// Create a function with marker colours based on depth
function createMap(earthquakes){

     // Create the base layer
     let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      });
    // Create the topo layer
    let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
      });

     // Creating the base map
     let baseMaps = {
        "Street Map": street,
        "Topographic Map": topo,
      };
    
    // Create an overlay object to hold our overlay.
    let overlayMaps = {
        Earthquakes: earthquakes
      };

    // Creating the map object
    let myMap = L.map("map", {
        center: [37.09, -95.71],
        zoom: 5,
        layers: [street, earthquakes]
    });

    // Create a control
    // Pass in baseMaps and overlayMaps
    // Add the control to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap); 

    // Create Legend
    let legend = L.control({ position: "bottomright" });
    legend.onAdd = function() {
        let div = L.DomUtil.create("div", "info legend"), 
        Earthquake_grades = [0, 10, 30, 50, 70, 90];

        div.innerHTML += "<h3>Magnitude</h3>"

        for (let i = 0; i < Earthquake_grades.length; i++) {
            div.innerHTML +=
                '<i style="background: ' + markercolours(Earthquake_grades[i] + 1) + '"></i> ' +
                Earthquake_grades[i] + (Earthquake_grades[i + 1] ? '&ndash;' + Earthquake_grades[i + 1] + '<br>' : '+');
        }
        return div;
    };
    // Add Legend to the Map
    legend.addTo(myMap);
}


