function createMap(){
    //create the map
    var map = L.map('map', {
        center:  [37.117, -103.333],
        zoom: 5
    });

    //add OSM base tilelayer
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(map);

    //call getData function
    getData(map);
};

//function to retrieve the data and place it on the map
////This snippet loops through the geojson and prepares a popup for each feature/////
function onEachFeature(feature, layer) {
    //no property named popupContent; instead, create html string with all properties
    var popupContent = "";
    if (feature.properties) {
        //loop to add feature property names and values to html string
        for (var property in feature.properties){
            popupContent += "<p>" + property + ": " + feature.properties[property] + "</p>";
        }
        layer.bindPopup(popupContent);
    };
};
function getData(map){
    //load the data
    $.ajax("data/outsideTop25.geojson", {
        dataType: "json",
        success: function(response){
            var geoJsonMarkerOptions = {
                radius: 8,
                fillColor: "#ff7800",
                color: "000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            };

            //create a Leaflet GeoJSON layer and add it to the map
            L.geoJson(response, {
                pointToLayer: function(feature, latlng){
                    return L.circleMarker(latlng, geoJsonMarkerOptions)
                }, 
                onEachFeature: onEachFeature
            }).addTo(map);
        }
    });
};

$(document).ready(createMap);