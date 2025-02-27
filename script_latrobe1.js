// -------------------Map initialization, pre-set location unitaetsarchive herrnhut------------------------------
const map1 = L.map('map1').setView([51.441667,0.368611 ], 12);

// osm layer (baselayer)
var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});
osm.addTo(map1);

// -------------Marker Icons for different levels of certainty----------------- is das sinnvoll???
// Icons for marker 
// starting certain 

const certain_icon = L.icon({
  iconUrl: 'marker_icons/inhabited_place.png',  // relative path to image!
  iconSize: [40, 40],
  iconAnchor: [40, 20],
  popupAnchor: [-3, -76]
});

// probable

const less_certain_icon = L.icon({
    iconUrl: 'marker_icons/first_nation_reserve.png',  // relative path to image!
    iconSize: [40, 40],
    iconAnchor: [40, 20],
    popupAnchor: [-3, -76]
});
    
//vague
    
const uncertain_icon = L.icon({
    iconUrl: 'marker_icons/continent.png',  // relative path to image!
    iconSize: [40, 40],
    iconAnchor: [40, 20],
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
    data.forEach(waypoint => {
      let markerIcon;

      // Selecting correct icon based on AAT-type
      switch (waypoint.certainty) {
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

      //---------------------HTML----------------------- 
      //Creating the popup content for each place --> anpassen, wenn json geschrieben
      const popupContent = `
        <h2>${waypoint.title}</h2>
        <div class="info-group">
          ${waypoint.role ? `<p class="subtitle">Role:</p> ${waypoint.role}`: ''}
          <p><strong>References:</strong> <a href="${waypoint.closeMatch}" target="_blank">${waypoint.closeMatch}</a></p>
        </div>

        <div class="info-group">
          <p><strong>Certainty:</strong> ${waypoint.certainty}<br>
          <strong>Role:</strong> ${waypoint.role}</p>
        </div>

        <div class="info-group">
          <h3>Notes:</h3>
          <p>${waypoint.note}</p>
        </div>

        <div class="info-group">
          <p><strong>Coordinates:</strong> ${waypoint.coordinates}</p>
          <p><strong>Date:</strong> <a>${waypoint.time}</a></p>
          <p><strong>Source:</strong> <a>${waypoint.wasDerivedFrom}
        </div>
      `;

      // ---------------Create marker--------------------
      const marker = L.marker([waypoint.coordinates], { icon: markerIcon })
        .bindPopup(popupContent) // Popup when clicking
        .bindTooltip(waypoint.title, { permanent: false, direction: "top", offset: [0, -10], className: 'custom-tooltip' }); // Tooltip when hovering;

      // Add Marker to allMarkersLayer (for "Select All")
      allMarkersLayer.addLayer(marker);

      // -----------------------------Add marker to the appropriate LayerGroup based on AAT-type-------------------------------
      switch (waypoint.certainty) {
        case 'certain':
          certaintyLayers['Certain Waypoint'].addLayer(marker);
          break;
        case 'less-certain':
          aatLayers['Less Certain Waypoint'].addLayer(marker);
          break;
        case 'uncertain':
          aatLayers['Uncertain Waypoint'].addLayer(marker);
          break;
      }
    });

    // Layer control for switching between base maps and overlay layers
    const baseMaps = {
      "OpenStreetMap": osm //naming the variables mit strings; add ',' after 'osm' when using more map-layers
    };

    // -----------------Create and add layer control to the map--------------------------------------
    L.control.layers(baseMaps, certaintyLayers).addTo(map1);

    // set "Select All"-Layer as default
    map1.addLayer(allMarkersLayer);

  })
  .catch(error => console.error('Fehler beim Laden der JSON-Daten:', error));


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