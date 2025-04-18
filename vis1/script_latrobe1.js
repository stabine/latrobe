//function-frame for whole script 
document.addEventListener('DOMContentLoaded', function() {
  
  // ===== 1. KONFIGURATION UND HILFSFUNKTIONEN =====
  
  // Hilfsfunktion für Datums-Formatierung
  function formatDate(date) {
    let day = date.getDate().toString().padStart(2, '0');
    let month = (date.getMonth() + 1).toString().padStart(2, '0');
    let year = date.getFullYear();
    return `${day}.${month}.${year}`;
  }
  
  // ===== 2. KARTE INITIALISIEREN =====
  
  const map1 = L.map('map1', {
    center: [16.737222, -22.936111],
    zoom: 3,
    zoomSnap: 0.5,
    minZoom: 3,
    maxZoom: 8
  });
  
  // OSM Basislayer hinzufügen
  var osm1 = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });
  osm1.addTo(map1);
  
  // ===== 3. LAYER-GROUPS UND BASEMAPS DEFINIEREN =====
  
  // Create LayerGroups for each Route 
  const routeLayers1 = {
    'Historical Trade Route': L.layerGroup(),
    'Albions likely Route': L.layerGroup(),
  };
  
  const baseMaps = {
    "OpenStreetMap": osm1
  };
  
  // Layer control hinzufügen
  L.control.layers(baseMaps, routeLayers1, {
    position: 'topright'
  }).addTo(map1);
  
  // ===== 4. TIME SLIDER SETUP =====
  
  // Variablen für Time Slider und Marker
  let markersWithDates1 = [];
  let uniqueDates1 = new Set();
  
  // Time Slider und Display-Element erstellen
  const slider1 = document.createElement("input");
  slider1.type = "range";
  slider1.min = 0;
  slider1.value = 0;
  slider1.className = "time-slider1";
  document.getElementById("slider-container1").appendChild(slider1);
  
  const sliderValue1 = document.createElement("span");
  sliderValue1.id = "slider-value1";
  document.getElementById("slider-container1").appendChild(sliderValue1);
  
  // Time Slider Event-Handler - kombiniert die beiden vorhandenen Listener
  slider1.addEventListener("input", function() {
    if (uniqueDates1.size === 0) return;
    
    // Datum holen und anzeigen
    let selectedDate1 = [...uniqueDates1][this.value];
    let dateObj = new Date(selectedDate1);
    let formattedDate = formatDate(dateObj);
    sliderValue1.textContent = `Date: ${formattedDate}`;
    
    // Marker entsprechend anzeigen/verbergen
    markersWithDates1.forEach(marker1 => {
      if (marker1.time <= selectedDate1) {
        map1.addLayer(marker1);
      } else {
        map1.removeLayer(marker1);
      }
    });
  });
  
  // ===== 5. HAUPTDATEN LADEN UND VERARBEITEN =====
  
  fetch('vis1/latrobe1.json')
    .then(response => response.json())
    .then(data => {

      // Marker erstellen
      data.features.forEach(feature => {
        const [lng1, lat1] = feature.geometry.coordinates;
        
        // Eigenschaften setzen
        const title1 = feature.properties.title;
        const note1 = feature.properties.note;
        const role1 = feature.properties.role;
        const wasDerivedFrom1 = feature.properties.wasDerivedFrom;
        const closeMatch1 = feature.properties.closeMatch;
        const certainty1 = feature.properties.certainty;
        const time1 = feature.time;
        
        // Datum erzeugen und zum Set hinzufügen
        const date1 = new Date(time1);
        uniqueDates1.add(date1);
        
        // Marker-Stil basierend auf Eigenschaften konfigurieren
        let radius1 = 8000;
        let color1 = "#09556B";
        let opacity1 = 1;
        
        // Farbe basierend auf Gewissheit
        switch (certainty1) {
          case 'certain':
            color1 = "#09556B";
            break;
          case 'less-certain':
            color1 = "#BF4D00";
            break;
          case 'uncertain':
            color1 = "#97379E";
            break;
        }
        
        // Radius und Deckkraft basierend auf Rolle
        switch(role1) {
          case 'visited':
            radius1 = 10000;
            opacity1 = 1;
            break;
          case 'visited_nearby':
            radius1 = 20000;
            opacity1 = 0.4;
            break;
          default:
            opacity1 = 1;
        }
        
        // Popup-Inhalt erstellen
        const popupContent1 = `
          <div class="info-group">
            <h3>${title1}</h3>
            <p><strong>Certainty:</strong> ${certainty1}<br>
            ${role1 == "visited" ? `<strong>Role:</strong> visited`: ''}
            ${role1 == "visited_nearby" ? `<strong>Role:</strong> visited nearby`: ''}<br>
            <p><strong>Date:</strong> ${time1}</p>
            </p>
          </div>
          
          <div class="info-group">
            <p><strong>Notes:</strong></p>
            <p>${note1}</p>
          </div>
          
          <div class="info-group">
            <p><strong>Coordinates:</strong> ${lat1}, ${lng1}</p>
            ${closeMatch1[0] !== null || closeMatch1[1] !== null ? `
                <p><strong>References:</strong><br>
                  ${closeMatch1[0] !== null ? `<a href="${closeMatch1[0]}" target="_blank">GeoNames</a>` : ''}
                  <br>
                  ${closeMatch1[1] !== null ? `<a href="${closeMatch1[1]}" target="_blank">WikiData</a>` : ''}
                </p>
              ` : ''} 
          </div>
          
          <div class="info-group">          
            ${wasDerivedFrom1 ? `<p><strong>Source:</strong><br><a href="${wasDerivedFrom1[1]}" target="blank">${wasDerivedFrom1[0]}</a></p>`: ''}
          </div>
        `;
        
        // Marker erstellen und konfigurieren
        const marker1 = L.circle([lat1, lng1], { 
          radius: radius1,
          color: color1,
          opacity: opacity1,
          fillOpacity: opacity1
        })
          .bindPopup(popupContent1)
          .bindTooltip(title1, { 
            permanent: false, 
            direction: "top", 
            offset: [0, -10], 
            className: 'custom-tooltip' 
          });
        
        // Marker mit Datum versehen und zur Liste hinzufügen
        marker1.time = date1;
        markersWithDates1.push(marker1);
      });
      
      // Time Slider konfigurieren
      if (uniqueDates1.size > 0) {
        slider1.max = [...uniqueDates1].length - 1;
        
        // Anfänglich ausgewähltes Datum anzeigen
        let initialDate = [...uniqueDates1][slider1.value];
        let initialDateObj = new Date(initialDate);
        sliderValue1.textContent = `Date: ${formatDate(initialDateObj)}`;
        
        // Anfänglich passende Marker anzeigen
        markersWithDates1.forEach(marker1 => {
          if (marker1.time <= initialDate) {
            map1.addLayer(marker1);
          }
        });
      }
      
      // ===== 6. LEGENDE ERSTELLEN =====
      
      const legend1 = L.control({ position: "bottomleft" });
      
      legend1.onAdd = function () {
        const div = L.DomUtil.create("div", "legend-map1");
        div.innerHTML = `
          <div style="margin-bottom:5px;"><strong>Legend</strong></div>
          <div class="legend-item"><span class="legend-circle" style="background:#09556B;"></span> certain waypoint</div>
          <div class="legend-item"><span class="legend-circle" style="background:#BF4D00;"></span> less certain waypoint</div>
          <div class="legend-item"><span class="legend-circle" style="background:#97379E;"></span> uncertain waypoint</div>
          <div class="legend-item" style="margin-top:10px;"><span class="legend-line" style="background:#50052b;"></span> historical trade route</div>
          <div class="legend-item" style="margin-top:10px;"><span class="legend-line" style="background:#004641;"></span> likely route of Albion</div>
        `;
        
        return div;
      };
      
      legend1.addTo(map1);
      
      
    })
    .catch(error => console.error('Fehler beim Laden der GeoJSON-Daten:', error));
  
  // ===== 7. ROUTES LADEN =====
  
  // Handelsroute laden
  fetch('vis1/traderoute.json')
    .then(response => response.json())
    .then(data2 => {
      console.log(data2);
      
      const tradeLine = L.geoJSON(data2, {
        style: function () {
          return {
            color: "#50052b",
            weight: 10,
            opacity: 0.2,
            dashArray: "6, 12"
          };
        }
      })
        .bindTooltip("average Trade Ships", { 
          permanent: false, 
          direction: "top", 
          offset: [0, -10] 
        })
        .bindPopup("<h3>Historical Trade Route</h3><p>This line shows an educated guess of the most common routes sailing ships used during the 19th century due to the influence of currents and trade winds.</p>")
        .addTo(map1);
      
      routeLayers1['Historical Trade Route'].addLayer(tradeLine);
    })
    .catch(error => {
      console.error('Fehler beim Laden des GeoJSON:', error);
    });
  
  // Albion-Route laden
  fetch('vis1/latrobe_route1.geojson')
    .then(response => response.json())
    .then(data6 => {
      console.log(data6);
      
      const albionLine = L.geoJSON(data6, {
        style: function () {
          return {
            color: "#004641",
            weight: 4,
            opacity: 0.4
          };
        }
      })
        .bindTooltip("Albion", { 
          permanent: false, 
          direction: "top", 
          offset: [0, -10] 
        })
        .bindPopup("<h3>Likely route of the brig Albion</h3><p>This line is an assumption of the most likely route of the Albion, derived from a combination of close reading and automated evaluation of the travel journal of Christian Ignatius Latrobe.</p>")
        .addTo(map1);
      
      routeLayers1['Albions likely Route'].addLayer(albionLine);
    })
    .catch(error => {
      console.error('Fehler beim Laden des GeoJSON:', error);
    });
  
  // Layer standardmäßig anzeigen
  map1.addLayer(routeLayers1['Historical Trade Route']);
  map1.addLayer(routeLayers1['Albions likely Route']);
});