// Perform an API call to the USGS endpoint
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson", function(earthquakeData) {

    // When the first API call is complete, perform another call to the tectontic plate endpoint
    d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json", function(plateData) {
        
        // Create a GeoJSON layer containing the features array on the earthquakeData object
        // Run the onEachFeature function once for each piece of data in the array
        var earthquakes = L.geoJSON(earthquakeData, {
            style: function(feature) {
                var color;
                if (feature.properties.mag <= 2.5){
                    color = 'white'}
                else if (feature.properties.mag > 2.5 && feature.properties.mag <= 4.5 ){
                    color = 'yellow'}
                else if (feature.properties.mag > 4.5 && feature.properties.mag <= 7){
                    color = 'orange'}
                else {
                    color = 'red'};
        
                return {
                    color:color
                };
            },
            pointToLayer: function(feature, latlng) {
                return new L.CircleMarker(latlng, {
        	        radius: feature.properties.mag * 3, 
        	        fillOpacity: 0.35
                });
            },
            onEachFeature: function (feature, layer) {
                layer.bindPopup("<h3>" + feature.properties.place +
                "</h3><hr><p>" + new Date(feature.properties.time) + "</p>"+
                "<p> Magnitude:" + feature.properties.mag + "</p>");
            }
            
        });
         
        //Create a GeoJSON layer containing the features of the array on the plateData object
        var faultlines = L.geoJSON(plateData, {
            style: function(feature) {
                return {
                    color:'blue'
                };
            },
        });
    
        //Import Mapbox token
        var access_token = "pk.eyJ1Ijoic2VwYXJrczA5IiwiYSI6ImNqajBrczlwMzBmcTczcG80MG14ZWR1eDYifQ._75_Bd3eFokbGpthNA3v3w";

        // Define streetmap and darkmap layers
        var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v9/tiles/256/{z}/{x}/{y}?" +
            "access_token="+access_token);

        var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?" +
            "access_token="+access_token);

        // Define a baseMaps object to hold our base layers
        var baseMaps = {
            "Dark Map": darkmap,
            "Satellite Map": streetmap
        };

        // Create overlay object to hold our overlay layer
        var overlayMaps = {
            Earthquakes: earthquakes,
            Faultlines: faultlines
        };

        // Create our map, giving it the streetmap and earthquakes layers to display on load
        var myMap = L.map("map-id", {
            center: [
            8.7832, -114.5085
            ],
            zoom: 3,
            layers: [darkmap, earthquakes],
            //After many failed attempts, this is the closest I got to a time element on markers.  I know I need
            // to associate time interval to my geoJSON pull as well as make timeDimension act on the 
            //earthquake layer.  Didn't get there, but I can add the control.  I also spend a good time of time
            //with a plug-in called SliderControl that was more difficult than this one.
            timeDimension: true,
            timeDimensionOptions: {
                timeInterval: "2018-06-25/2018-07-01",
                period: "PT1H"
            },
            timeDimensionControl: true,
        });
        // Create a layer control,pass in our baseMaps and overlayMaps,add the layer control to the map
        L.control.layers(baseMaps, overlayMaps, {
            collapsed: false
        }).addTo(myMap);

        // Create a legend to display information about our map
        var legend = L.control({
            position: "bottomleft"
        });
  
        // When the layer control is added, insert a div with the class of "legend"
        legend.onAdd = function() {
            var div = L.DomUtil.create("div", "legend");
            grades = ["","white","yellow","orange","red"],
            labels = ["Magnitude","<2.5","2.5-4.5","4.5-7.0",">7.0"];
            for (var i = 0; i < grades.length; i++){
                div.innerHTML +='<i style="background:'+grades[i]+'">&nbsp;</i>&nbsp;&nbsp;'+labels[i]+'<br/>';
            }
            return div;
        };

        // Add the info legend to the map
        legend.addTo(myMap);

    }); 
});

