//Klammerfunktion, die Inhalte korrekt laden soll 
document.addEventListener('DOMContentLoaded', function() {



// -------------------Map initialization, pre-set location for each map------------------------------
const map1 = L.map('map1', {
  center: [16.737222, -22.936111], // set to Gravesend
  zoom: 3,
  zoomSnap: 0.5,
  minZoom: 3,  //preset zoom-span 
  maxZoom: 8
}); 

// osm tile (baselayer)
var osm1 = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});
osm1.addTo(map1);


// Initialisation of Layer for all Markers 
const allMarkersLayer1 = L.layerGroup(); // Layer for all Markers

// Create LayerGroups for each certanty-type 
const roleLayers1 = {
    'Select All': allMarkersLayer1, // combined Layer for all markers
    'Visited': L.layerGroup(),
    'Visited nearby': L.layerGroup(),
  };

let markersWithDates1 = [];
let uniqueDates1 = new Set();

// -----Time Slider Setup 1-----
const slider1 = document.createElement("input");
slider1.type = "range";
slider1.min = 0;
slider1.value = 0;
slider1.className = "time-slider1";
document.getElementById("slider-container1").appendChild(slider1);

const sliderValue1 = document.createElement("span");
sliderValue1.id = "slider-value1";
document.getElementById("slider-container1").appendChild(sliderValue1);

function formatDate(date) {
  let day = date.getDate().toString().padStart(2, '0'); // Tag
  let month = (date.getMonth() + 1).toString().padStart(2, '0'); // Monat
  let year = date.getFullYear(); // Jahr
  
  return `${day}.${month}.${year}`;
}

slider1.addEventListener("input", function () {
  let selectedDate1 = [...uniqueDates1][slider1.value]; // Holen des Datums aus der Set
  let dateObj = new Date(selectedDate1); // Umwandeln in ein Date-Objekt
  let formattedDate = formatDate(dateObj); // Formatieren des Datums
  sliderValue1.textContent = `Date: ${formattedDate}`; // Wert anzeigen
});



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
      
      const date1 = new Date(time1);

      let radius1 = 35;
      let color1 = "green";
      let opacity1 = 1;
      

      // adjust size and opacity based on level of certainty and role
      switch (certainty1) {
        case 'certain':
          color1 = "#09556B";
          break;
        case 'less-certain':
          color1 = "#BF4D00";
          break;
        case 'uncertain':
          color1 = "#5B215E";
          break;
      }


      switch(role1) {
        case 'visited':
          radius1 = 8000;
          opacity1 = 1; // opaque
          break;
        case 'visited_nearby':
          radius1 = 15000
          opacity1 = 0.4; // slightly translucent
          break;
        default:
          opacity1 = 1; // default opacity
      }

      uniqueDates1.add(date1);
      
      //---------------------HTML-ish----------------------- 
      //Creating the popup content for each place 
      const popupContent1 = `
        
        <div class="info-group">
          <h3>${title1}</h3>
          <p class="subtitle">Role: ${role1}</p>
          ${closeMatch1[0] !== null || closeMatch1[1] !== null ? `
            <p><strong>References:</strong><br>
              ${closeMatch1[0] !== null ? `<a href="${closeMatch1[0]}" target="_blank">GeoNames</a>` : ''}
              <br>
              ${closeMatch1[1] !== null ? `<a href="${closeMatch1[1]}" target="_blank">WikiData</a>` : ''}
            </p>
          ` : ''}
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
          ${wasDerivedFrom1 ? `<p><strong>Source:</strong><br><a href="${wasDerivedFrom1[1]}" target="blank">${wasDerivedFrom1[0]}</a>`: ''}
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
    marker1.time = date1;
    markersWithDates1.push(marker1);
    
      

      // -----------------------------Add marker to the appropriate LayerGroup based on role-type-------------------------------
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

    slider1.max = [...uniqueDates1].length - 1;
    slider1.oninput = function () {
      let selectedDate1 = [...uniqueDates1][this.value];
      markersWithDates1.forEach(marker1 => {
        if (marker1.time <= selectedDate1) {
          map1.addLayer(marker1);
        } else {
          map1.removeLayer(marker1);
        }
      });
    };

    let selectedDate1 = [...uniqueDates1][slider1.value];
    markersWithDates1.forEach(marker1 => {
      if (marker1.time <= selectedDate1) {
        map1.addLayer(marker1);
      }
    });
    
  // Legende

   // Legende erstellen
const legend1= L.control({ position: "bottomleft" });

legend1.onAdd = function () {
    const div = L.DomUtil.create("div", "legend-map1");
    div.innerHTML = `
        <div style="margin-bottom:5px;"><strong>Legend</strong></div>
        <div class="legend-item"><span class="legend-circle" style="background:#09556B;"></span> certain waypoint</div>
        <div class="legend-item"><span class="legend-circle" style="background:#BF4D00;"></span> less certain waypoint</div>
        <div class="legend-item"><span class="legend-circle" style="background:#5B215E;"></span> uncertain waypoint</div>
        <div class="legend-item" style="margin-top:10px;"><span class="legend-line" style="background:#50052b;"></span> historical trade route</div>
        <div class="legend-item" style="margin-top:10px;"><span class="legend-line" style="background:#004641;"></span> likely route of Albion</div>
    `;

    return div;
};

// Legende zur Karte hinzufügen
legend1.addTo(map1);

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


  // Zeige den Startwert an, formatiert

if (uniqueDates1.size > 0) {
  slider1.max = [...uniqueDates1].length - 1;
  let initialDate = [...uniqueDates1][slider1.value];
  let initialDateObj = new Date(initialDate);
  sliderValue1.textContent = `Date: ${formatDate(initialDateObj)}`;
}

//-----------historical trade route added-----------
  fetch('traderoute.json')
    .then(response => response.json())
    .then(data2 => {

  // load GeoJSON
  console.log(data2);

  // polyline from GeoJSON
    L.geoJSON(data2, {
      style: function () {
        return {
          color: "#50052b",
          weight: 10,
          opacity: 0.2,
          dashArray: "6, 12"
       };
     }
    })
    .bindTooltip("average Trade Ships", { permanent: false, direction: "top", offset: [0, -10] })
    .bindPopup("<h3>Historical Trade Route</h3><p>This line shows one of the most common routes sailing ships used during the 19th century due to the influence of currents and trade winds.</p>")
    .addTo(map1);
  })
  .catch(error => {
    console.error('Fehler beim Laden des GeoJSON:', error);
  });

  //-------------------most likely route for the Albion added--------------
  fetch('latrobe_route1.geojson')
  .then(response => response.json())
  .then(data6 => {

  // load GeoJSON
  console.log(data6);

  // polyline from GeoJSON
    L.geoJSON(data6, {
      style: function () {
        return {
          color: "#004641",
          weight: 4,
          opacity: 0.4
       };
     }
    })
    .bindTooltip("Albion", { permanent: false, direction: "top", offset: [0, -10] })
    .bindPopup("<h3>Likely route of the brig Albion</h3><p>This line is an assumption of the most likely route of the Albion, derived from a combination of close reading and automated evaluation of the travel journal of Christian Igantius Latrobe.</p>")
    .addTo(map1);
  })
  .catch(error => {
    console.error('Fehler beim Laden des GeoJSON:', error);
  });

});