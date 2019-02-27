function createMap(){
    //create the map
    var OSMLayer = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    });
    
     //add black and white base tilelayer
    var blackAndWhite = L.tileLayer('http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });
    
    //add stamen map
    var topo = L.tileLayer('http://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.{ext}', {
        attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> — Map data © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        subdomains: 'abcd',
        minZoom: 0,
        maxZoom: 20,
        ext: 'png'
    });

    var baseMaps = {
        "OpenStreetMap": OSMLayer,
        "Black and White": blackAndWhite,
        "Stamen Tiles": topo
        
    };
    var map = L.map('map', {
        center:  [37.117, -103.333],
        zoom: 5,
        layers: [OSMLayer]
    });

    //add OSM base tilelayer
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(map);

        let cities =L.layerGroup()
    jQuery.getJSON("data/outsideTop25.geojson", function(json){
        L.geoJSON(json, {
            onEachFeature: addMyData, 
            color: 'black',
            fillColor: 'yellow',
            fillOpacity: 0.2,
            weight: 1,
            opacity: 1,
        })
    })
   //adds a featuer to cities for every record found in the geojson
    function addMyData(feature, layer){
        cities.addLayer(layer)
    };

    	//control layers
    L.control.layers(baseMaps).addTo(map);
    
    getData(map);
};

// function to retrieve the data and place it on the map
// This snippet loops through the geojson and prepares a popup for each feature/////
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
function createPropSymbols(data, map){
    //create marker options
    var geojsonMarkerOptions = {
        radius: 8,
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };
     //Step 4: Determine which attribute to visualize with proportional symbols
    var attribute = "Pop_2010";

    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: function (feature, latlng) {
            //Step 5: For each feature, determine its value for the selected attribute
            var attValue = Number(feature.properties[attribute]);

            //Step 6: Give each feature's circle marker a radius based on its attribute value
            geojsonMarkerOptions.radius = calcPropRad(attValue);

            //examine the attribute value to check that it is correct
            console.log(feature.properties, attValue);

            //create circle markers
            return L.circleMarker(latlng, geojsonMarkerOptions);
        }

    }).addTo(map);
};

//Step 2: Import GeoJSON data
function getData(map){
    //load the data
    $.ajax("data/outsideTop25.geojson", {
        dataType: "json",
        success: function(response){
            //call function to create proportional symbols
            createPropSymbols(response, map);
        }
    });
};

function calcPropRad(attValue) {
    //scale factor to adjust symbol size evenly
    var scaleFactor = .003;
    //area based on attribute value and scale factor
    var area = attValue * scaleFactor;
    //radius calculated based on area
    var radius = Math.sqrt(area/Math.PI);

    return radius;

};


$(document).ready(createMap);