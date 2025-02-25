// -------------------Map initialization, pre-set location unitaetsarchive herrnhut------------------------------
const map = L.map('map1').setView([0.368611, 51.441667], 15);

// osm layer (baselayer)
var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});
osm.addTo(map);

// -------------Marker Icons for different levels of certanty----------------- 
// Icons for marker 
// starting certain 

const certain_icon = L.icon({
  iconUrl: 'marker_icons/inhabited_place.png',  // relative path to image!
  iconSize: [40, 40],
  iconAnchor: [40, 20],
  popupAnchor: [-3, -76]
});

// probable

const probable_icon = L.icon({
    iconUrl: 'marker_icons/first_nation_reserve.png',  // relative path to image!
    iconSize: [40, 40],
    iconAnchor: [40, 20],
    popupAnchor: [-3, -76]
});
    
//vague
    
const vague_icon = L.icon({
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
    'Certain Place': L.layerGroup(),
    'Probable Place': L.layerGroup(),
    'Vague Place': L.layerGroup(),
  };


// ------------------Fetching data from JSON-File-----------------------------

fetch('latrobe1.json')
  .then(response => response.json())
  .then(data => {

// Iterate through each place and create markers
    data.forEach(place => {
      let markerIcon;

      // Selecting correct icon based on AAT-type
      switch (place.certanty) {
        case 'certain':
          markerIcon = certain_icon;
          break;
        case 'probable':
          markerIcon = probable_icon;
          break;
        case 'vague':
          markerIcon = vague_icon_icon;
          break;
        default:
          markerIcon = certain_icon_icon; // default setting
      }

      //---------------------HTML----------------------- 
      //Creating the popup content for each place --> anpassen, wenn json geschrieben
      const popupContent = `
        <h2>${place.bezeichnung}</h2>
        <div class="info-group">
          ${place.aktuelle_bezeichnung ? `<p class="subtitle">aktuelle Bezeichnung:</p> ${place.aktuelle_bezeichnung}`: ''}
          <p><strong>AAT Getty Klasse:</strong> <a href="http://vocab.getty.edu/page/aat/${place.aat_id}" target="_blank">${place.aat}</a></p>
        </div>

        <div class="info-group">
          <p><strong>Land:</strong> ${place.land}<br>
          <strong>Kontinent:</strong> ${place.kontinent}</p>
        </div>

        <div class="info-group">
          <h3>Beschreibung:</h3>
          <p>${place.beschreibung}</p>
        </div>

        <div class="info-group">
          <p><strong>Koordinaten:</strong> ${place.latitude}, ${place.longitude}</p>
          <p><strong>Wikidata:</strong> <a href="${place.wikidata_url}" target="_blank">${place.wikidata_id}</a></p>
        </div>
      `;

      // ---------------Create marker--------------------
      const marker = L.marker([place.latitude, place.longitude], { icon: markerIcon })
        .bindPopup(popupContent) // Popup when clicking
        .bindTooltip(place.bezeichnung, { permanent: false, direction: "top", offset: [0, -10], className: 'custom-tooltip' }); // Tooltip when hovering;

      // Add Marker to allMarkersLayer (for "Select All")
      allMarkersLayer.addLayer(marker);

      // -----------------------------Add marker to the appropriate LayerGroup based on AAT-type-------------------------------
      switch (place.aat) {
        case 'certain':
          certaintyLayers['Certain Place'].addLayer(marker);
          break;
        case 'probable':
          aatLayers['Probable Place'].addLayer(marker);
          break;
        case 'vague':
          aatLayers['Vague place'].addLayer(marker);
          break;
        default:
          break;
      }
    });

    // Layer control for switching between base maps and overlay layers
    const baseMaps = {
      "OpenStreetMap": osm //naming the variables mit strings; add ',' after 'osm' when using more map-layers
    };

    // -----------------Create and add layer control to the map--------------------------------------
    L.control.layers(baseMaps, certaintyLayers).addTo(map);

    // set "Select All"-Layer as default
    map.addLayer(allMarkersLayer);

  })
  .catch(error => console.error('Fehler beim Laden der JSON-Daten:', error));