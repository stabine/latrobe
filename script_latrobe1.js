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
  maxZoom: 11
}); 

// osm layer (baselayer)
var osm1 = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});
osm1.addTo(map1);

   


// Initialisation of Layer for all Markers ???
const allMarkersLayer = L.layerGroup(); // Layer for all Markers

// Create LayerGroups for each certanty-type ???
const certaintyLayers = {
    'Select All': allMarkersLayer, // Der kombinierte Layer für alle Marker
    'Certain Waypoint': L.layerGroup(),
    'Less Certain Waypoint': L.layerGroup(),
    'Uncertain Waypoint': L.layerGroup(),
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
      
      
      let color = "green";
      let opacity;
      

      // adjust size and opacity based on level of certainty
      switch (certainty1) {
        case 'certain':
          color = "green";
          break;
        case 'less-certain':
          color = "yellow";
          break;
        case 'uncertain':
          color = "red";
          break;
      }


      switch(role1) {
        case 'visited':
          opacity = 1; // opaque
          break;
        case 'visited_nearby':
          opacity = 0.4; // slightly translucent
          break;
        default:
          opacity = 1; // default opacity
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

      // ---------------------Function to calculate radius based on Zoom level-----------------------
      function getMarkerRadius(role, zoomLevel) {
        let baseRadius = 15;  // Default radius for the marker

        // Adjust base size according to 'role'
        switch(role) {
          case 'visited':
            baseRadius = 15;
            break;
          case 'visited_nearby':
            baseRadius = 35;
            break;
          default:
            baseRadius = 15;
            break;
        }

        // Adjust size based on the zoom level (e.g. more zoom -> bigger marker)
        return baseRadius * (zoomLevel / 15);
      }

      // ---------------Create circle marker for each waypoint--------------------
      const initialRadius = getMarkerRadius(role1, map1.getZoom());

      const marker1 = L.circleMarker([lat1,lng1], { 
        radius: initialRadius,
        color: color,
        opacity: opacity,
        fillOpacity: opacity
      })
        .bindPopup(popupContent1) // Popup when clicking
        .bindTooltip(title1, { permanent: false, direction: "top", offset: [0, -10], className: 'custom-tooltip' }); // Tooltip when hovering;

    // Add Marker to allMarkersLayer (for "Select All")
    allMarkersLayer.addLayer(marker1);

      

      // -----------------------------Add marker to the appropriate LayerGroup based on Certainty-type-------------------------------
      switch (certainty1) {
        case 'certain':
          certaintyLayers['Certain Waypoint'].addLayer(marker1);
          break;
        case 'less-certain':
          certaintyLayers['Less Certain Waypoint'].addLayer(marker1);
          break;
        case 'uncertain':
          certaintyLayers['Uncertain Waypoint'].addLayer(marker1);
          break;
      }
    });
      

  // set "Select All"-Layer as default
    map1.addLayer(allMarkersLayer);

    map1.addLayer(certaintyLayers['Certain Waypoint']);
    map1.addLayer(certaintyLayers['Less Certain Waypoint']);
    map1.addLayer(certaintyLayers['Uncertain Waypoint']);
    

    // Layer control for switching between base maps and overlay layers
    const baseMaps = {
      "OpenStreetMap": osm1 //naming the variables mit strings; add ',' after 'osm' when using more map-layers
    };

    // -----------------Create and add layer control to the map (still not sure wether I need it)--------------------------------------
    L.control.layers(baseMaps, certaintyLayers, {
      position: 'topright'
    }).addTo(map1);

    //----------------------------- Update marker radius and position when zooming or panning--------------------------------------------------------------
    function updateMarker() {
      allMarkersLayer.eachLayer(function(marker) {
        marker.setLatLng(marker.getLatLng()); // Re-set position to update it correctly
      });
    }

    // Update markers on zoom or pan
    map1.on('moveend', updateMarker); // When panning ends

  })
    .catch(error => console.error('Fehler beim Laden der GeoJSON-Daten:', error));

fetch('traderoute.json')
  .then(response => response.json())
  .then(data2 => {

  // GeoJSON laden
  console.log(data2);

  // Polyline direkt aus GeoJSON
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

      // Berechnung der Markergröße und Opazität basierend auf dem Certainty-Level
      let radius = 25; // Standardgröße
      let opacity = 1; // Standardopazität
      let color = "green";

      switch(certainty2) {
        case 'certain':
          radius = 5; // Größer für 'certain'
          opacity = 1;
          color = "green";
          break;
        case 'less-certain':
          radius = 20; // Kleiner für 'less-certain'
          opacity = 0.6;
          color = "yellow";
          break;
        case 'uncertain':
          radius = 30; // Noch kleiner für 'uncertain'
          opacity = 0.4;
          color = "red";
          break;
      }

    // create marker, select opacity and size
    const marker2 = L.circleMarker([lat2, lng2],{
      radius: radius,
      color: 'green',
      opacity: opacity,
      fillOpacity: opacity
    })
      .bindPopup(popupContent2) // Popup when clicking
      .bindTooltip(title2, { permanent: false, direction: "top", offset: [0, -10], className: 'custom-tooltip' });

    //add marker to map   
    marker2.addTo(map2)

    // get coordinates for polyline
    latlngs.push([lat2, lng2]);
  
  });

  // create polyline with collected coordinates
  if (latlngs.length > 1) {  // Stelle sicher, dass es mehr als einen Punkt gibt
    L.polyline(latlngs, { color: 'green' }).addTo(map2);
  }
})
.catch(err => console.error('Fehler beim Laden der GeoJSON-Datei:', err));

  // -------------------Map initialization, pre-set location Cape Colony; topografical map------------------------------
  const map3 = L.map('map3').setView([-33.775120570267205, 22.333937355866688 ], 8);

  // OpenTopoMap layer (baselayer3)
  var OpenTopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });
  OpenTopoMap.addTo(map3);