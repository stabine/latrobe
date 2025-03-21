// ---------------------Website-Setup--------------------------
// Get the button:
let BTTButton = document.getElementById("bttButton");

// When scrolled down 20px from the top of the document, show the button
window.onscroll = function() {scrollFunction()};

function scrollFunction() {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    BTTButton.style.display = "block";
  } else {
    BTTButton.style.display = "none";
  }
}

// When the user clicks on the button, scroll to the top of the document
function topFunction() {
  document.body.scrollTop = 0; // For Safari
  document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}



// -------------------Map initialization, pre-set location for each map------------------------------
const map1 = L.map('map1', {
  center: [16.737222, -22.936111], // set to Gravesend
  zoom: 3,
  minZoom: 3,  //preset zoom-span 
  maxZoom: 8
}); 

// osm layer (baselayer)
var osm1 = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});
osm1.addTo(map1);

   


// Initialisation of Layer for all Markers ???
const allMarkersLayer1 = L.layerGroup(); // Layer for all Markers

// Create LayerGroups for each certanty-type ???
const roleLayers1 = {
    'Select All': allMarkersLayer1, // combined Layer for all markers
    'Visited': L.layerGroup(),
    'Visited nearby': L.layerGroup(),
  };


// ------------------Fetching data from JSON-File-----------------------------

fetch('latrobe1.json')
  .then(response => response.json())
  .then(data => {

// Iterate through each place and create markers
    data.features.forEach(feature => {
      
      const [lng1, lat1] = feature.geometry.coordinates;

    // setting properties as constantes 
      const title1 = feature.properties.title;
      const note1 = feature.properties.note;
      const role1 = feature.properties.role;
      const wasDerivedFrom1 = feature.properties.wasDerivedFrom;
      const closeMatch1 = feature.properties.closeMatch;
      const certainty1 = feature.properties.certainty;
      const time1 = feature.time;
      
      let radius1 = 35;
      let color1 = "green";
      let opacity1 = 1;
      

      // adjust size and opacity based on level of certainty and role
      switch (certainty1) {
        case 'certain':
          color1 = "green";
          break;
        case 'less-certain':
          color1 = "yellow";
          break;
        case 'uncertain':
          color1 = "red";
          break;
      }


      switch(role1) {
        case 'visited':
          radius1 = 800;
          opacity1 = 1; // opaque
          break;
        case 'visited_nearby':
          radius1 = 15000
          opacity1 = 0.4; // slightly translucent
          break;
        default:
          opacity1 = 1; // default opacity
      }

      
      
      //---------------------HTML-ish----------------------- 
      //Creating the popup content for each place 
      const popupContent1 = `
        <h3>${title1}</h3>
        <div class="info-group">
          <p class="subtitle">Role: ${role1}</p>
          <p><strong>References:</strong><br><a href="${closeMatch1[0]}" target="_blank">GeoNames</a>
          <br><a href="${closeMatch1[1]}" target="_blank">WikiData</a></p>
        </div>

        <div class="info-group">
          <p><strong>Certainty:</strong> <br>${certainty1}<br>
          <strong>Role:</strong> <br>${role1}</p>
        </div>

        <div class="info-group">
          <h3>Notes:</h3>
          <p>${note1}</p>
        </div>

        <div class="info-group">
          <p><strong>Coordinates:</strong> [${lng1}, ${lat1}]</p>
          <p><strong>Date:</strong> ${time1}</p>
          ${wasDerivedFrom1 ? `<p><strong>Source:</strong><br>${wasDerivedFrom1}`: ''}
        </div>
      `;

      

      // ---------------Create circle marker for each waypoint--------------------
      
      const marker1 = L.circle([lat1,lng1], { 
        radius: radius1,
        color: color1,
        opacity: opacity1,
        fillOpacity: opacity1
      })
        .bindPopup(popupContent1) // Popup when clicking
        .bindTooltip(title1, { permanent: false, direction: "top", offset: [0, -10], className: 'custom-tooltip' }); // Tooltip when hovering;

    // Add Marker to allMarkersLayer (for "Select All")
    allMarkersLayer1.addLayer(marker1);

      

      // -----------------------------Add marker to the appropriate LayerGroup based on Certainty-type-------------------------------
      switch (role1) {
        case 'visited':
          roleLayers1['Visited'].addLayer(marker1);
          break;
        case 'visited_nearby':
          roleLayers1['Visited nearby'].addLayer(marker1);
          break;        
      }
    });
      

  // set "Select All"-Layer as default
    map1.addLayer(allMarkersLayer1);

    map1.addLayer(roleLayers1['Visited']);
    map1.addLayer(roleLayers1['Visited nearby']);
    

    // Layer control for switching between base maps and overlay layers
    const baseMaps = {
      "OpenStreetMap": osm1 //naming the variables mit strings; add ',' after 'osm' when using more map-layers
    };

    // -----------------Create and add layer control to the map (still not sure wether I need it)--------------------------------------
    L.control.layers(baseMaps, roleLayers1, {
      position: 'topright'
    }).addTo(map1);

    //----------------------------- Update marker radius and position when zooming or panning--------------------------------------------------------------
    function updateMarker() {
      allMarkersLayer1.eachLayer(function(marker1) {
        marker1.setLatLng(marker1.getLatLng()); // Re-set position to update it correctly
      });
    }

    // Update markers on zoom or pan
    map1.on('moveend', updateMarker); // When panning ends

  })
    .catch(error => console.error('Fehler beim Laden der GeoJSON-Daten:', error));

fetch('traderoute.json')
  .then(response => response.json())
  .then(data2 => {

  // load GeoJSON
  console.log(data2);

  // polyline from GeoJSON
    L.geoJSON(data2, {
      style: function () {
        return {
          color: "#004641",
          weight: 10,
          opacity: 0.2,
          dashArray: "4, 15"
       };
     }
    })
    .bindTooltip("Historical sailing route for trade ships.", { permanent: false, direction: "top", offset: [0, -10] })
    .bindPopup("<h3>Historical Trade Route</h3><p>This line shows one of the most common routes sailing ships used during the 19th century due to trade winds.</p>")
    .addTo(map1);
  })
  .catch(error => {
    console.error('Fehler beim Laden des GeoJSON:', error);
  });


  // -------------------Map2 initialization, pre-set location Gnadenthal, very close------------------------------
const map2 = L.map('map2', {
  center: [-34.034086373788035, 19.557620864951964], // set to Gnadenthal
  zoom: 18,
  minZoom: 15,  //preset zoom-span 
  maxZoom: 19.5
});

// osm layer (baselayer2)
var osm2 = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});
osm2.addTo(map2);

// Initialisation of Layer for all Markers ???
const allMarkersLayer2 = L.layerGroup(); // Layer for all Markers

// Create LayerGroups for each certainty-type ???
const certaintyLayers2 = {
    'Select All': allMarkersLayer2, // combined Layer for all markers
    'Certain Waypoint': L.layerGroup(),
    'Less certain Waypoint': L.layerGroup(),
    'Uncertain Waypoint': L.layerGroup(),
};

fetch('latrobe2.json')
  .then(response => response.json())
  .then(data3 => {

    const latlngs = [];

    // iterate through GeoJSON to creat points of polyline
    data3.features.forEach(feature => {
      const [lng2, lat2] = feature.geometry.coordinates;
      
   // setting properties as constantes 
      const title2 = feature.properties.title;
      const note2 = feature.properties.note;
      const role2 = feature.properties.role;
      const wasDerivedFrom2 = feature.properties.wasDerivedFrom;
      const closeMatch2 = feature.properties.closeMatch;
      const certainty2 = feature.properties.certainty;
      const time2 = feature.time;
    

    // set markers and popup
      const popupContent2 = `
          <h3>${title2}</h3>
          <div class="info-group">
            <p class="subtitle">Role: ${role2}</p>
            <p><strong>References:</strong><br><a href="${closeMatch2[0]}" target="_blank">GeoNames</a>
            <br><a href="${closeMatch2[1]}" target="_blank">WikiData</a></p>
          </div>

          <div class="info-group">
            <p><strong>Certainty:</strong> <br>${certainty2}<br>
            <strong>Role:</strong> <br>${role2}</p>
          </div>

          <div class="info-group">
            <h3>Notes:</h3>
            <p>${note2}</p>
          </div>

          <div class="info-group">
            <p><strong>Coordinates:</strong> [${lng2}, ${lat2}]</p>
            <p><strong>Date:</strong> ${time2}</p>
            ${wasDerivedFrom2 ? `<p><strong>Source:</strong><br>${wasDerivedFrom2}`: ''}
          </div>
        `;

      // set marker based on certainty level 
      let radius2 = 25; // default
      let opacity2 = 1; // default
      let color2 = "green";

      switch(certainty2) {
        case 'certain':
          radius2 = 5; 
          opacity2 = 1;
          color2 = "green";
          break;
        case 'less-certain':
          radius2 = 20; 
          opacity2 = 0.6;
          color2 = "yellow";
          break;
        case 'uncertain':
          radius2 = 30; 
          opacity2 = 0.4;
          color2 = "red";
          break;
      }

    // create marker, select opacity and size
    const marker2 = L.circleMarker([lat2, lng2],{
      radius: radius2,
      color: color2,
      opacity: opacity2,
      fillOpacity: opacity2
    })
      .bindPopup(popupContent2) // Popup when clicking
      .bindTooltip(title2, { permanent: false, direction: "top", offset: [0, -10], className: 'custom-tooltip' });


    // Add Marker to allMarkersLayer (for "Select All")
    allMarkersLayer2.addLayer(marker2);

      

    // -----------------------------Add marker to the appropriate LayerGroup based on Certainty-type-------------------------------
      switch (certainty2) {
        case 'certain':
          certaintyLayers2['Certain Waypoint'].addLayer(marker2);
          break;
        case 'less-certain':
          certaintyLayers2['Less certain Waypoint'].addLayer(marker2);
          break;
        case 'uncertain':
          certaintyLayers2['Uncertain Waypoint'].addLayer(marker2);
      }
    
      // get coordinates for polyline
      latlngs.push([lat2, lng2]);  

    });

    // create polyline with collected coordinates
    if (latlngs.length > 1) {  // to ensure more than 1 point
      L.polyline(latlngs, { color: '#50052b', weight: 2 }).addTo(map2);
    }

    // set "Select All"-Layer as default
    map2.addLayer(allMarkersLayer2);

    map2.addLayer(certaintyLayers2['Certain Waypoint']);
    map2.addLayer(certaintyLayers2['Less certain Waypoint']);
    map2.addLayer(certaintyLayers2['Uncertain Waypoint']);

    // Layer control for switching between base maps and overlay layers
    const baseMap2 = {
      "OpenStreetMap": osm2 //naming the variables mit strings; add ',' after 'osm' when using more map-layers
    };

    // -----------------Create and add layer control to the map (still not sure wether I need it)--------------------------------------
    L.control.layers(baseMap2, certaintyLayers2, {
      position: 'topright'
    }).addTo(map2);

  
    
  })
  .catch(err => console.error('Fehler beim Laden der GeoJSON-Datei:', err));



  // -------------------Map3 initialization, pre-set location Cape Colony; topografical map------------------------------

  const map3 = L.map('map3',{
    center: [-33.775120570267205, 22.333937355866688],
    zoom: 8,
    minZoom: 8,  //preset zoom-span 
    maxZoom: 13
  });

  // OpenTopoMap layer (baselayer3)
  var OpenTopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });
  OpenTopoMap.addTo(map3);

  // Initialisation of Layer for all Markers ???
  const allMarkersLayer3 = L.layerGroup(); // Layer for all Markers

  // Create LayerGroups for each certainty-type ???
  const certaintyLayers3 = {
      'Select All': allMarkersLayer3, // combined Layer for all markers
      'Certain Waypoint': L.layerGroup(),
      'Less certain Waypoint': L.layerGroup(),
      'Uncertain Waypoint': L.layerGroup(),
  };

  fetch('latrobe3.json')
  .then(response => response.json())
  .then(data4 => {

    const latlngs = [];

    // iterate through GeoJSON to creat points of polyline
    data4.features.forEach(feature => {
      const [lng3, lat3] = feature.geometry.coordinates;
      
   // setting properties as constantes 
      const title3 = feature.properties.title;
      const note3 = feature.properties.note;
      const role3 = feature.properties.role;
      const wasDerivedFrom3 = feature.properties.wasDerivedFrom;
      const closeMatch3 = feature.properties.closeMatch;
      const certainty3 = feature.properties.certainty;
      const time3 = feature.time;
    

    // set markers and popup

    

      const popupContent3 = `
          <h3>${title3}</h3>
          <div class="info-group">
            <p class="subtitle">Role: ${role3}</p>
            <p><strong>References:</strong><br><a href="${closeMatch3[0]}" target="_blank">GeoNames</a>
            <br><a href="${closeMatch3[1]}" target="_blank">WikiData</a></p>
          </div>

          <div class="info-group">
            <p><strong>Certainty:</strong> <br>${certainty3}<br><br>
            <strong>Role:</strong> <br>${role3}</p>
          </div>

          <div class="info-group">
            <h3>Notes:</h3>
            <p>${note3}</p>
          </div>

          <div class="info-group">
            <p><strong>Coordinates:</strong> [${lng3}, ${lat3}]</p>
            <p><strong>Date:</strong> ${time3}</p>
            ${wasDerivedFrom3 ? `<p><strong>Source:</strong><br><a href="${wasDerivedFrom3[1]}" target="blank">${wasDerivedFrom3[0]}</a>`: ''}
          </div>
        `;

      // Berechnung der Markergröße und Opazität basierend auf dem Certainty-Level
      let radius3 = 100; // Standardgröße
      let opacity3 = 1; // Standardopazität
      let color3 = "green";

      switch(certainty3) {
        case 'certain':
          radius3 = 100; // Größer für 'certain'
          opacity3 = 1;
          color3 = "green";
          break;
        case 'less-certain':
          radius3 = 3000; // Kleiner für 'less-certain'
          opacity3 = 0.6;
          color3 = "yellow";
          break;
        case 'uncertain':
          radius3 = 3000; // Noch kleiner für 'uncertain'
          opacity3 = 0.4;
          color3 = "red";
          break;
      }

    // create marker, select opacity and size
    const marker3 = L.circle([lat3, lng3],{
      radius: radius3,
      color: color3,
      opacity: opacity3,
      fillOpacity: opacity3
    })
      .bindPopup(popupContent3) // Popup when clicking
      .bindTooltip(title3, { permanent: false, direction: "top", offset: [0, -10], className: 'custom-tooltip' });


    // Add Marker to allMarkersLayer (for "Select All")
    allMarkersLayer3.addLayer(marker3);

      

    // -----------------------------Add marker to the appropriate LayerGroup based on Certainty-type-------------------------------
      switch (certainty3) {
        case 'certain':
          certaintyLayers3['Certain Waypoint'].addLayer(marker3);
          break;
        case 'less-certain':
          certaintyLayers3['Less certain Waypoint'].addLayer(marker3);
          break;
        case 'uncertain':
          certaintyLayers3['Uncertain Waypoint'].addLayer(marker3);
      }

    

    // get coordinates for polyline
    latlngs.push([lat3, lng3]);
  
  });

  // create polyline with collected coordinates
  if (latlngs.length > 1) {  // Stelle sicher, dass es mehr als einen Punkt gibt
    L.polyline(latlngs, { 
      color: '#50052b',
      weight: 3 
    })
    .addTo(map3);
  }

  // set "Select All"-Layer as default
  map3.addLayer(allMarkersLayer3);

  map3.addLayer(certaintyLayers3['Certain Waypoint']);
  map3.addLayer(certaintyLayers3['Less certain Waypoint']);
  map3.addLayer(certaintyLayers3['Uncertain Waypoint']);

  // Layer control for switching between base maps and overlay layers
  const baseMap3 = {
    "OpenTopoMap": OpenTopoMap //naming the variables mit strings; add ',' after 'osm' when using more map-layers
  };

  // -----------------Create and add layer control to the map (still not sure wether I need it)--------------------------------------
  L.control.layers(baseMap3, certaintyLayers3, {
    position: 'topright'
  }).addTo(map3);
})
.catch(err => console.error('Fehler beim Laden der GeoJSON-Datei:', err));