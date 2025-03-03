// ---------------------Website-Setup--------------------------
// Get the button:
let BTTButton = document.getElementById("bttButton");

// When the user scrolls down 20px from the top of the document, show the button
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
  minZoom: 3,
  maxZoom: 11
}); 

// osm layer (baselayer)
var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});
osm.addTo(map1);

// -------------Marker Icons for different levels of certainty----------------- is das sinnvoll???
// Icons for marker 
// starting certain 

const certain_icon = L.icon({
  iconUrl: 'marker_icons/certain_icon.png',  // relative path to image!
  iconSize: [15, 15],
  iconAnchor: [0, 0],
  popupAnchor: [-3, -76]
});

// less-certain

const less_certain_icon = L.icon({
  iconUrl: 'marker_icons/less_certain_icon.png',  // relative path to image!
  iconSize: [15, 15],
  iconAnchor: [0, 0],
  popupAnchor: [-3, -76]
});
    
//uncertain
    
const uncertain_icon = L.icon({
  iconUrl: 'marker_icons/uncertain_icon.png',  // relative path to image!
  iconSize: [15, 15],
  iconAnchor: [0, 0],
  popupAnchor: [-3, -76]
});
    


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
      
      const [lng, lat] = feature.geometry.coordinates;

    // Extrahiere Titel und Notiz
      const title = feature.properties.title;
      const note = feature.properties.note;
      const role = feature.properties.role;
      const wasDerivedFrom = feature.properties.wasDerivedFrom;
      const closeMatch = feature.properties.closeMatch;
      const certainty = feature.properties.certainty;
      const time = feature.time;
      
      let markerIcon;

      // Selecting correct icon based on certainty-type
      switch (certainty) {
        case 'certain':
          markerIcon = certain_icon;
          break;
        case 'less-certain':
          markerIcon = less_certain_icon;
          break;
        case 'uncertain':
          markerIcon = uncertain_icon;
          break;
        default:
          markerIcon = certain_icon; // default setting
      }

      let iconSize, opacity;

      switch(role) {
        case 'visited':
          iconSize = [15, 15]; // Kleinere Marker für 'visited'
          opacity = 1; // Vollständig sichtbar
          break;
        case 'visited_nearby':
          iconSize = [35, 35]; // Größere Marker für 'visited_nearby'
          opacity = 0.4; // Marker sind weniger sichtbar
          break;
        default:
          iconSize = [15, 15]; // Standardgröße
          opacity = 1; // Standarddeckkraft
      }
      
      // Erstelle das Icon mit den finalen Einstellungen
      const finalIcon = L.icon({
        iconUrl: markerIcon.options.iconUrl,
        iconAnchor: markerIcon.options.iconAnchor,
        popupAnchor: markerIcon.options.popupAnchor,
        iconSize: iconSize,
        opacity: opacity
      });


      
      

      //---------------------HTML----------------------- 
      //Creating the popup content for each place --> anpassen, wenn json geschrieben
      const popupContent = `
        <h3>${title}</h3>
        <div class="info-group">
          <p class="subtitle">Role: ${role}</p>
          <p><strong>References:</strong><br><a href="${closeMatch[0]}" target="_blank">GeoNames</a>
          <br><a href="${closeMatch[1]}" target="_blank">WikiData</a></p>
        </div>

        <div class="info-group">
          <p><strong>Certainty:</strong> <br>${certainty}<br>
          <strong>Role:</strong> <br>${role}</p>
        </div>

        <div class="info-group">
          <h3>Notes:</h3>
          <p>${note}</p>
        </div>

        <div class="info-group">
          <p><strong>Coordinates:</strong> [${lng}, ${lat}]</p>
          <p><strong>Date:</strong> ${time}</p>
          ${wasDerivedFrom ? `<p><strong>Source:</strong><br>${wasDerivedFrom}`: ''}
        </div>
      `;

      // ---------------Create marker--------------------
      const marker = L.marker([lat,lng], { icon: finalIcon, opacity: opacity })
        .bindPopup(popupContent) // Popup when clicking
        .bindTooltip(title, { permanent: false, direction: "top", offset: [0, -10], className: 'custom-tooltip' }); // Tooltip when hovering;

      // Add Marker to allMarkersLayer (for "Select All")
      allMarkersLayer.addLayer(marker);

      

      // -----------------------------Add marker to the appropriate LayerGroup based on AAT-type-------------------------------
      switch (certainty) {
        case 'certain':
          certaintyLayers['Certain Waypoint'].addLayer(marker);
          break;
        case 'less-certain':
          certaintyLayers['Less Certain Waypoint'].addLayer(marker);
          break;
        case 'uncertain':
          certaintyLayers['Uncertain Waypoint'].addLayer(marker);
          break;
      }

      

       // set "Select All"-Layer as default
       map1.addLayer(allMarkersLayer);
    });

    // Layer control for switching between base maps and overlay layers
    const baseMaps = {
      "OpenStreetMap": osm //naming the variables mit strings; add ',' after 'osm' when using more map-layers
    };

    // -----------------Create and add layer control to the map--------------------------------------
    L.control.layers(baseMaps, certaintyLayers).addTo(map1);

   

  })
  .catch(error => console.error('Fehler beim Laden der GeoJSON-Daten:', error));


  // -------------------Map initialization, pre-set location unitaetsarchive herrnhut------------------------------
const map2 = L.map('map2').setView([-34.034086373788035, 19.557620864951964 ], 18);

// osm layer (baselayer2)
var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});
osm.addTo(map2);



  // -------------------Map initialization, pre-set location unitaetsarchive herrnhut------------------------------
  const map3 = L.map('map3').setView([-33.775120570267205, 22.333937355866688 ], 8);

  // OpenTopoMap layer (baselayer3)
  var OpenTopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });
  OpenTopoMap.addTo(map3);