document.addEventListener('DOMContentLoaded', function() {
  
  // -------------------Map2 initialization, pre-set location Gnadenthal, very close------------------------------
  const map2 = L.map('map2', {
    center: [-34.03143020008334, 19.55655308951873], // set to Gnadenthal
    zoom: 16.5,
    zoomSnap: 0.5,
    minZoom: 15,  //preset zoom-span 
    maxZoom: 19
  });
  
  // osm layer (baselayer2)
  var osm2 = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
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
  
  let markersWithDates2 = [];
  let uniqueDates2 = new Set();
  
  // -----Time Slider Setup 2-----
  const slider2 = document.createElement("input");
  slider2.type = "range";
  slider2.min = 0;
  slider2.value = 0;
  slider2.className = "time-slider2";
  document.getElementById("slider-container2").appendChild(slider2);
  
  const sliderValue2 = document.createElement("span");
  sliderValue2.id = "slider-value2";
  document.getElementById("slider-container2").appendChild(sliderValue2);
  
  function formatDate(date) {
    let day = date.getDate().toString().padStart(2, '0'); // Tag
    let month = (date.getMonth() + 1).toString().padStart(2, '0'); // Monat
    let year = date.getFullYear(); // Jahr
    
    return `${day}.${month}.${year}`;
  }
  
  slider2.addEventListener("input", function () {
    let selectedDate2 = [...uniqueDates2][slider2.value]; // Holen des Datums aus der Set
    let dateObj2 = new Date(selectedDate2); // Umwandeln in ein Date-Objekt
    let formattedDate2 = formatDate(dateObj2); // Formatieren des Datums
    sliderValue2.textContent = `Date: ${formattedDate2}`; // Wert anzeigen
  });
  
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
  
        const date2 = new Date(time2);
      
        uniqueDates2.add(date2);
  
      // set markers and popup
        const popupContent2 = `
        
        <div class="info-group">
          <h3>${title2}</h3>
          <p><strong>Certainty:</strong> ${certainty2}<br>
          ${role2 == "visited" ? `<strong>Role:</strong> visited`: ''}
          ${role2 == "visited_nearby" ? `<strong>Role:</strong> visited nearby`: ''}<br>
          <p><strong>Date:</strong> ${time2}</p>
          </p>
        </div>

        <div class="info-group">
          <p><strong>Notes:</strong></p>
          <p>${note2}</p>
        </div>

        <div class="info-group">
          <p><strong>Coordinates:</strong> ${lat2}, ${lng2}</p>
          ${closeMatch2[0] !== null || closeMatch2[1] !== null ? `
              <p><strong>References:</strong><br>
                ${closeMatch2[0] !== null ? `<a href="${closeMatch2[0]}" target="_blank">GeoNames</a>` : ''}
                <br>
                ${closeMatch2[1] !== null ? `<a href="${closeMatch2[1]}" target="_blank">WikiData</a>` : ''}
              </p>
            ` : ''} 
        </div>
        
        <div class="info-group">          
          ${wasDerivedFrom2 ? `<p><strong>Source:</strong><br><a href="${wasDerivedFrom2[1]}" target="blank">${wasDerivedFrom2[0]}</a></p>`: ''}
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
            color2 = "#008078";
            break;
          case 'less-certain':
            radius2 = 20; 
            opacity2 = 0.6;
            color2 = "#FF9800";
            break;
          case 'uncertain':
            radius2 = 30; 
            opacity2 = 0.4;
            color2 = "#50052b";
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
      marker2.time = date2;
      markersWithDates2.push(marker2);
  
        
  
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
  
      //--------Outbound-Layer----------
      fetch('l2_lcp-master.geojson')
      .then(response => response.json())
      .then(data2_1 => {

      // load GeoJSON
      console.log(data2_1);

      // polyline from GeoJSON
      L.geoJSON(data2_1, {
        style: function () {
          return {
            color: "#8B0000",
            weight: 2,
            opacity: 0.7      
        };
      }
      })
      .bindTooltip("Outbound-route (LCP)", { permanent: false, direction: "top", offset: [0, -10] })
      .bindPopup("<h3>Latrobe's path</h3><p>This line shows a likely path Latrobe could have used, assumed by using a least-cost-path analysis in QGIS.</p>")
      .addTo(map2);
      })
      .catch(error => {
      console.error('Fehler beim Laden des GeoJSON:', error);
      });
  
      // set "Select All"-Layer as default
      map2.addLayer(allMarkersLayer2);
  
      map2.addLayer(certaintyLayers2['Certain Waypoint']);
      map2.addLayer(certaintyLayers2['Less certain Waypoint']);
      map2.addLayer(certaintyLayers2['Uncertain Waypoint']);
  
      slider2.max = [...uniqueDates2].length - 1;
      slider2.oninput = function () {
        let selectedDate2 = [...uniqueDates2][this.value];
        markersWithDates2.forEach(marker2 => {
          if (marker2.time <= selectedDate2) {
            map2.addLayer(marker2);
          } else {
            map2.removeLayer(marker2);
          }
        });
      };
  
      let selectedDate2 = [...uniqueDates2][slider2.value];
      markersWithDates2.forEach(marker2 => {
        if (marker2.time <= selectedDate2) {
          map2.addLayer(marker2);
        }
      });
  
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
  
    if (uniqueDates2.size > 0) {
      slider2.max = [...uniqueDates2].length - 1;
      let initialDate2 = [...uniqueDates2][slider2.value];
      let initialDateObj2 = new Date(initialDate2);
      sliderValue2.textContent = `Date: ${formatDate(initialDateObj2)}`;
    }
  
   // Legende erstellen
  const legend2 = L.control({ position: "bottomleft" });
  
  legend2.onAdd = function () {
      const div = L.DomUtil.create("div", "legend-map2");
      div.innerHTML = `
          <div style="margin-bottom:5px;"><strong>Certainty Levels</strong></div>
          <div class="legend-item"><span class="legend-circle" style="background:#008078;"></span> Certain</div>
          <div class="legend-item"><span class="legend-circle" style="background:#FF9800;"></span> Less certain</div>
          <div class="legend-item" style="margin-top:10px;"><span class="legend-line" style="background:#50052b;"></span> Route</div>
      `;
  
      return div;
  };
  
  // Legende zur Karte hinzufügen
  legend2.addTo(map2);
});  
