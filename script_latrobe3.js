document.addEventListener('DOMContentLoaded', function() {
  
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

map3.createPane('markersPane3');  
map3.getPane('markersPane3').style.zIndex = 650; // Höherer z-Index für Marker  

map3.createPane('linesPane3');  
map3.getPane('linesPane3').style.zIndex = 600; // Niedrigerer z-Index für Linien  

  // Initialisation of Layer for all Markers ???
  const allMarkersLayer3 = L.layerGroup(); // Layer for all Markers

  // Create LayerGroups for each certainty-type ???
  const certaintyLayers3 = {
      'Select All': allMarkersLayer3, // combined Layer for all markers
      'Certain Waypoint': L.layerGroup(),
      'Less certain Waypoint': L.layerGroup(),
      'Uncertain Waypoint': L.layerGroup(),
  };

let markersWithDates3 = [];
let uniqueDates3 = new Set();

// -----Time Slider Setup 3-----
const slider3 = document.createElement("input");
slider3.type = "range";
slider3.min = 0;
slider3.value = 0;
slider3.className = "time-slider3";
document.getElementById("slider-container3").appendChild(slider3);

const sliderValue3 = document.createElement("span");
sliderValue3.id = "slider-value3";
document.getElementById("slider-container3").appendChild(sliderValue3);

function formatDate(date) {
  let day = date.getDate().toString().padStart(2, '0'); // Tag
  let month = (date.getMonth() + 1).toString().padStart(2, '0'); // Monat
  let year = date.getFullYear(); // Jahr
  
  return `${day}.${month}.${year}`;
}

slider3.addEventListener("input", function () {
  let selectedDate3 = [...uniqueDates3][slider3.value]; // Holen des Datums aus der Set
  let dateObj3 = new Date(selectedDate3); // Umwandeln in ein Date-Objekt
  let formattedDate3 = formatDate(dateObj3); // Formatieren des Datums
  sliderValue3.textContent = `Date: ${formattedDate3}`; // Wert anzeigen
});

// ------------------Fetching data from JSON-File-----------------------------
  fetch('latrobe3.json')
  .then(response => response.json())
  .then(data4 => {

    //const latlngs = []; ----Polyline

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

      const date3 = new Date(time3);

      uniqueDates3.add(date3);
    

    // set markers and popup
      const popupContent3 = `
          <h3>${title3}</h3>
          <div class="info-group">
            <p class="subtitle">Role: ${role3}</p>

            ${closeMatch3[0] !== null || closeMatch3[1] !== null ? `
            <p><strong>References:</strong><br>
              ${closeMatch3[0] !== null ? `<a href="${closeMatch3[0]}" target="_blank">GeoNames</a>` : ''}
              <br>
              ${closeMatch3[1] !== null ? `<a href="${closeMatch3[1]}" target="_blank">WikiData</a>` : ''}
            </p>
            ` : ''}
          </div>

          <div class="info-group">
            <p><strong>Certainty:</strong> <br>${certainty3}<br><br>
            <strong>Role:</strong> <br>${role3}</p>
          </div>

          <div class="info-group">
            <p><strong>Notes:</strong><br>
            ${note3}</p>
          </div>

          <div class="info-group">
            <p><strong>Coordinates:</strong><br> [${lat3}, ${lng3}]</p>
            <p><strong>Date:</strong> ${time3}</p>
            ${wasDerivedFrom3 ? `<p><strong>Source:</strong><br><a href="${wasDerivedFrom3[1]}" target="blank">${wasDerivedFrom3[0]}</a>`: ''}
          </div>
        `;

      // Berechnung der Markergröße und Opazität basierend auf dem Certainty-Level
      let radius3 = 100; // Standardgröße
      let opacity3 = 1; // Standardopazität
      let color3 = "#008078";

      switch(certainty3) {
        case 'certain':
          radius3 = 500; // Größer für 'certain'
          opacity3 = 0.9;
          color3 = "#008078";
          break;
        case 'less-certain':
          radius3 = 2000; // Kleiner für 'less-certain'
          opacity3 = 0.6;
          color3 = "#FF9800";
          break;
        case 'uncertain':
          radius3 = 2000; // Noch kleiner für 'uncertain'
          opacity3 = 0.4;
          color3 = "#50052b";
          break;
      }

    // create marker, select opacity and size
    const marker3 = L.circle([lat3, lng3],{
      pane: 'markersPane3',
      radius: radius3,
      color: color3,
      opacity: opacity3,
      fillOpacity: opacity3
    })
      .bindPopup(popupContent3) // Popup when clicking
      .bindTooltip(title3, { permanent: false, direction: "top", offset: [0, -10], className: 'custom-tooltip' });


    // Add Marker to allMarkersLayer (for "Select All")
    allMarkersLayer3.addLayer(marker3);
    marker3.time = date3;
    markersWithDates3.push(marker3);

      

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

    

    // ---get coordinates for polyline
    //latlngs.push([lat3, lng3]);
  
  });

  // ---create polyline with collected coordinates
  //if (latlngs.length > 1) {  // Stelle sicher, dass es mehr als einen Punkt gibt
    //L.polyline(latlngs, { 
      //color: '#004641',
      //weight: 4,
      //pane: 'linesPane3' 
    //})
    //.addTo(map3);
  //}

  

 // set "Select All"-Layer as default
 map3.addLayer(allMarkersLayer3);
 
fetch('latrobe4.json')
  .then(response => response.json())
  .then(data5 => {

    //const latlngs2 = []; ---polyline

    // iterate through GeoJSON to creat points of polyline
    data5.features.forEach(feature => {
      const [lng4, lat4] = feature.geometry.coordinates;
      
   // setting properties as constantes 
      const title4 = feature.properties.title;
      const note4 = feature.properties.note;
      const role4 = feature.properties.role;
      const wasDerivedFrom4 = feature.properties.wasDerivedFrom;
      const closeMatch4 = feature.properties.closeMatch;
      const certainty4 = feature.properties.certainty;
      const time4 = feature.time;

      const date4 = new Date (time4);
    
      uniqueDates3.add(date4);

    // set markers and popup

    

      const popupContent4 = `
          <h3>${title4}</h3>
          <div class="info-group">
            <p class="subtitle">Role: ${role4}</p>

            ${closeMatch4[0] !== null || closeMatch4[1] !== null ? `
            <p><strong>References:</strong><br>
              ${closeMatch4[0] !== null ? `<a href="${closeMatch4[0]}" target="_blank">GeoNames</a>` : ''}
              <br>
              ${closeMatch4[1] !== null ? `<a href="${closeMatch4[1]}" target="_blank">WikiData</a>` : ''}
            </p>
            ` : ''}
          </div>

          <div class="info-group">
            <p><strong>Certainty:</strong> <br>${certainty4}<br><br>
            <strong>Role:</strong> <br>${role4}</p>
          </div>

          <div class="info-group">
            <h3>Notes:</h3>
            <p>${note4}</p>
          </div>

          <div class="info-group">
            <p><strong>Coordinates:</strong><br> [${lat4}, ${lng4}]</p>
            <p><strong>Date:</strong> ${time4}</p>
            ${wasDerivedFrom4 ? `<p><strong>Source:</strong><br><a href="${wasDerivedFrom4[1]}" target="blank">${wasDerivedFrom4[0]}</a>`: ''}
          </div>
        `;

      // Berechnung der Markergröße und Opazität basierend auf dem Certainty-Level
      let radius4 = 100; // Standardgröße
      let opacity4 = 1; // Standardopazität
      let color4 = "green";

      switch(certainty4) {
        case 'certain':
          radius4 = 500; // Größer für 'certain'
          opacity4 = 0.9;
          color4 = "#008078";
          break;
        case 'less-certain':
          radius4 = 2000; // Kleiner für 'less-certain'
          opacity4 = 0.6;
          color4 = "#FF9800";
          break;
        case 'uncertain':
          radius4 = 2000; // Noch kleiner für 'uncertain'
          opacity4 = 0.4;
          color4 = "#50052b";
          break;
      }

    // create marker, select opacity and size
    const marker4 = L.circle([lat4, lng4],{
      pane: 'markersPane3',
      radius: radius4,
      color: color4,
      opacity: opacity4,
      fillOpacity: opacity4
    })
      .bindPopup(popupContent4) // Popup when clicking
      .bindTooltip(title4, { permanent: false, direction: "top", offset: [0, -10], className: 'custom-tooltip' });


    // Add Marker to allMarkersLayer (for "Select All")
    allMarkersLayer3.addLayer(marker4);
    marker4.time = date4;
    markersWithDates3.push(marker4);

   
    // -----------------------------Add marker to the appropriate LayerGroup based on Certainty-type-------------------------------
      switch (certainty4) {
        case 'certain':
          certaintyLayers3['Certain Waypoint'].addLayer(marker4);
          break;
        case 'less-certain':
          certaintyLayers3['Less certain Waypoint'].addLayer(marker4);
          break;
        case 'uncertain':
          certaintyLayers3['Uncertain Waypoint'].addLayer(marker4);
      }

    

    // get coordinates for polyline
    //latlngs2.push([lat4, lng4]);
  
  });

  slider3.max = [...uniqueDates3].length - 1;

  // ---slider handler setup---

  slider3.oninput = function () {
    let selectedDate3 = [...uniqueDates3][this.value];
    markersWithDates3.forEach(marker3 => {
      if (marker3.time <= selectedDate3) {
        map3.addLayer(marker3);
      } else {
        map3.removeLayer(marker3);
      }
    });
  };

  // initial Date handling
  let selectedDate3 = [...uniqueDates3][slider3.value];
  markersWithDates3.forEach(marker3 => {
    if (marker3.time <= selectedDate3) {
      map3.addLayer(marker3);
    }
  });
 
})
.catch(err => console.error('Fehler beim Laden der GeoJSON-Datei:', err));

if (uniqueDates3.size > 0) {
    slider3.max = [...uniqueDates3].length - 1;
    let initialDate3 = [...uniqueDates3][slider3.value];
    let initialDateObj3 = new Date(initialDate3);
    sliderValue3.textContent = `Date: ${formatDate(initialDateObj3)}`;
  }

  // create polyline with collected coordinates
  //if (latlngs2.length > 1) {  // Stelle sicher, dass es mehr als einen Punkt gibt
    //L.polyline(latlngs2, { 
      //color: '#8B0000',
      //weight: 4,
      //pane: 'linesPane3'

    //})
    //.addTo(map3);
  //}

  map3.addLayer(certaintyLayers3['Certain Waypoint']);
  map3.addLayer(certaintyLayers3['Less certain Waypoint']);
  map3.addLayer(certaintyLayers3['Uncertain Waypoint']);

  
})
.catch(err => console.error('Fehler beim Laden der GeoJSON-Datei:', err));



  // Layer control for switching between base maps and overlay layers
  const baseMap3 = {
    "OpenTopoMap": OpenTopoMap 
  };
  // -----------------Create and add layer control to the map (still not sure wether I need it)--------------------------------------
  L.control.layers(baseMap3, certaintyLayers3, {
    position: 'topright'
  }).addTo(map3);

  // Legende erstellen
const legend3 = L.control({ position: "bottomleft" });

legend3.onAdd = function () {
    const div = L.DomUtil.create("div", "legend-map3");
    div.innerHTML = `
        <div style="margin-bottom:5px;"><strong>Certainty Levels</strong></div>
        <div class="legend-item"><span class="legend-circle" style="background:#008078;"></span> Certain</div>
        <div class="legend-item"><span class="legend-circle" style="background:#FF9800;"></span> Less certain</div>
        <div class="legend-item"><span class="legend-circle" style="background:#50052b;"></span> Uncertain</div>
        
        
    `;

    return div;
};

// Legende zur Karte hinzufügen
legend3.addTo(map3);

//--------Outbound-Layer----------
fetch('l3_lcp-master.geojson')
.then(response => response.json())
.then(data7 => {

// load GeoJSON
console.log(data7);

// polyline from GeoJSON
L.geoJSON(data7, {
  style: function () {
    return {
      color: "#004641",
      weight: 2,
      opacity: 0.7      
   };
 }
})
.bindTooltip("Outbound-route (LCP)", { permanent: false, direction: "top", offset: [0, -10] })
.bindPopup("<h3>Outbound-route assumed using Least-Cost-Path-Analysis in QGIS</h3><p>This line shows a likely outbound route, assumed by using a least-cost-path analysis in QGIS.</p>")
.addTo(map3);
})
.catch(error => {
console.error('Fehler beim Laden des GeoJSON:', error);
});

//--------Return-Layer----------
fetch('l4_lcp-master.geojson')
.then(response => response.json())
.then(data8 => {

// load GeoJSON
console.log(data8);

// polyline from GeoJSON
L.geoJSON(data8, {
  style: function () {
    return {
      color: "#8B0000",
      weight: 2,
      opacity: 0.7      
   };
 }
})
.bindTooltip("Return-route (LCP)", { permanent: false, direction: "top", offset: [0, -10] })
.bindPopup("<h3>Return-route assumed using Least-Cost-Path-Analysis in QGIS</h3><p>This line shows a likely return route, assumed by using a least-cost-path analysis in QGIS.</p>")
.addTo(map3);
})
.catch(error => {
console.error('Fehler beim Laden des GeoJSON:', error);
});

});