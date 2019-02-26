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
var attributes;
var index;

function createSequenceControls(map, attributes){
    //create range input element (slider)
	var SequenceControl = L.Control.extend({
        options: {
            position: 'bottomleft'
        },

       onAdd: function (map) {
            // create the control container with a particular class name
            var container = L.DomUtil.create('div', 'sequence-control-container');

            //create range input element (slider)
            $(container).append('<input class="range-slider" type="range">');

            //add skip buttons
            $(container).append('<button class="skip" id="reverse" title="Previous Year">Previous</button>');
            $(container).append('<button class="skip" id="forward" title="Next Year">Next</button>');

            $(container).on('mousedown dblclick', function(e){
				L.DomEvent.stopPropagation(e);
            });

            return container;
        }
    });
    map.addControl(new SequenceControl());
	
    //set slider attributes
    $('.range-slider').attr({
        max: 8,
        min: 0,
        value: 0,
        step: 1
        
    });
      
    $('.skip').click(function(){
        //get the old index value
        var index = $('.range-slider').val();
        
     //Step 6: increment or decrement depending on button clicked
        if ($(this).attr('id') == 'forward'){
            index++;
            //Step 9: pass new attribute to update symbols
            updatePropSymbols(map, attributes[index]);
			
            //Step 7: if past the last attribute, wrap around to first attribute
            index = index > 7 ? 0 : index;
        } else if ($(this).attr('id') == 'reverse'){
            index--;
            //Step 7: if past the first attribute, wrap around to last attribute
            index = index < 0 ? 7 : index;
            updatePropSymbols(map, attributes[index]);
		                                      
        };
       //Step 8: update slider
        $('.range-slider').val(index);
        updatePropSymbols(map, attributes[index]);
		                
        $('.range-slider').on('input', function(){
        //Step 6: get the new index value
        var index = $(this).val();
			// updateLegend(map,attribute[index]);
			updatePropSymbols(map, attributes[index]);
						
            //check
            console.log(attributes)
        });
    });
};

//function called to update the symbols and popup with slider and buttons
function updatePropSymbols(map,attribute){
    map.eachLayer(function(layer){
        if (layer.feature && layer.feature.properties[attribute]){
            //access feature properties
            var props = layer.feature.properties;

            //update each feature's radius based on new attribute values
            var radius = calcPropRad(props[attribute]);
            layer.setRadius(radius);
			// updateLegend(map, attribute);			
            createPopup(props, attribute, layer, radius);
			
			
				
		};
	});
	
};
// function to retrieve the data and place it on the map
//This snippet loops through the geojson and prepares a popup for each feature/////
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