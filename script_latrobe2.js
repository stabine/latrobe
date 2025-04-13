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
  
  const map2 = L.map('map2', {
    center: [-34.03143020008334, 19.55655308951873], // Set to Gnadenthal
    zoom: 16.5,
    zoomSnap: 0.5,
    minZoom: 15,
    maxZoom: 19
  });
  
  // OSM Basislayer hinzufügen
  var osm2 = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });
  osm2.addTo(map2);
  
  // ===== 3. LAYER-GRUPPEN UND BASE MAPS DEFINIEREN =====
  
  // Layer für alle Marker erstellen
  const allMarkersLayer2 = L.layerGroup();
  
  // Layer für verschiedene Gewissheitsgrade erstellen
  const certaintyLayers2 = {
    'Select All': allMarkersLayer2,
    'Certain Waypoint': L.layerGroup(),
    'Less certain Waypoint': L.layerGroup(),
    'Uncertain Waypoint': L.layerGroup(),
  };
  
  // Base Map definieren
  const baseMap2 = {
    "OpenStreetMap": osm2
  };
  
  // ===== 4. TIME SLIDER SETUP =====
  
  // Variablen für Time Slider und Marker
  let markersWithDates2 = [];
  let uniqueDates2 = new Set();
  
  // Time Slider und Display-Element erstellen
  const slider2 = document.createElement("input");
  slider2.type = "range";
  slider2.min = 0;
  slider2.value = 0;
  slider2.className = "time-slider2";
  document.getElementById("slider-container2").appendChild(slider2);
  
  const sliderValue2 = document.createElement("span");
  sliderValue2.id = "slider-value2";
  document.getElementById("slider-container2").appendChild(sliderValue2);
  
  // Time Slider Event-Handler - kombiniert beide Listener
  slider2.addEventListener("input", function() {
    if (uniqueDates2.size === 0) return;
    
    // Datum holen und anzeigen
    let selectedDate2 = [...uniqueDates2][this.value];
    let dateObj2 = new Date(selectedDate2);
    let formattedDate2 = formatDate(dateObj2);
    sliderValue2.textContent = `Date: ${formattedDate2}`;
    
    // Marker entsprechend anzeigen/verbergen
    markersWithDates2.forEach(marker2 => {
      if (marker2.time <= selectedDate2) {
        map2.addLayer(marker2);
      } else {
        map2.removeLayer(marker2);
      }
    });
  });
  
  // ===== 5. LEGENDE ERSTELLEN =====
  
  const legend2 = L.control({ position: "bottomleft" });
  
  legend2.onAdd = function() {
    const div = L.DomUtil.create("div", "legend-map2");
    div.innerHTML = `
      <div style="margin-bottom:5px;"><strong>Certainty Levels</strong></div>
      <div class="legend-item"><span class="legend-circle" style="background:#008078;"></span> Certain</div>
      <div class="legend-item"><span class="legend-circle" style="background:#FF9800;"></span> Less certain</div>
      <div class="legend-item" style="margin-top:10px;"><span class="legend-line" style="background:#50052b;"></span> Route</div>
    `;
    return div;
  };
  
  legend2.addTo(map2);
  
  // ===== 6. HAUPTDATEN LADEN UND MARKER ERSTELLEN =====
  
  fetch('latrobe2.json')
    .then(response => response.json())
    .then(data3 => {
      const latlngs = []; // Für potenzielle Polyline-Erstellung
      
      // Durch GeoJSON iterieren und Marker erstellen
      data3.features.forEach(feature => {
        const [lng2, lat2] = feature.geometry.coordinates;
        
        // Eigenschaften setzen
        const title2 = feature.properties.title;
        const note2 = feature.properties.note;
        const role2 = feature.properties.role;
        const wasDerivedFrom2 = feature.properties.wasDerivedFrom;
        const closeMatch2 = feature.properties.closeMatch;
        const certainty2 = feature.properties.certainty;
        const time2 = feature.time;
        
        // Datum erzeugen und zum Set hinzufügen
        const date2 = new Date(time2);
        uniqueDates2.add(date2);
        
        // Popup-Inhalt erstellen
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
        
        // Marker-Stil basierend auf Gewissheit festlegen
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
        
        // Marker erstellen und konfigurieren
        const marker2 = L.circleMarker([lat2, lng2], {
          radius: radius2,
          color: color2,
          opacity: opacity2,
          fillOpacity: opacity2
        })
          .bindPopup(popupContent2)
          .bindTooltip(title2, { 
            permanent: false, 
            direction: "top", 
            offset: [0, -10], 
            className: 'custom-tooltip' 
          });
        
        // Marker mit Datum versehen und zur Liste hinzufügen
        marker2.time = date2;
        markersWithDates2.push(marker2);
        
        // Marker zur allMarkersLayer hinzufügen
        allMarkersLayer2.addLayer(marker2);
        
        // Marker zu entsprechender Gewissheits-Layer hinzufügen
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
      });
      
      // Time Slider konfigurieren
      if (uniqueDates2.size > 0) {
        slider2.max = [...uniqueDates2].length - 1;
        
        // Anfänglich ausgewähltes Datum anzeigen
        let initialDate2 = [...uniqueDates2][slider2.value];
        let initialDateObj2 = new Date(initialDate2);
        sliderValue2.textContent = `Date: ${formatDate(initialDateObj2)}`;
        
        // Anfänglich passende Marker anzeigen
        let selectedDate2 = [...uniqueDates2][slider2.value];
        markersWithDates2.forEach(marker2 => {
          if (marker2.time <= selectedDate2) {
            map2.addLayer(marker2);
          }
        });
      }
      
      // Layer-Control hinzufügen
      L.control.layers(baseMap2, certaintyLayers2, {
        position: 'topright'
      }).addTo(map2);
      
      // Default-Layer anzeigen
      map2.addLayer(allMarkersLayer2);
      map2.addLayer(certaintyLayers2['Certain Waypoint']);
      map2.addLayer(certaintyLayers2['Less certain Waypoint']);
      map2.addLayer(certaintyLayers2['Uncertain Waypoint']);
    })
    .catch(err => console.error('Fehler beim Laden der GeoJSON-Datei:', err));
  
  // ===== 7. ROUTE-DATEN LADEN =====
  
  // Route laden
  fetch('l2_lcp-master.geojson')
    .then(response => response.json())
    .then(data2_1 => {
      console.log(data2_1);
      
      // GeoJSON-Route als Linie darstellen
      L.geoJSON(data2_1, {
        style: function() {
          return {
            color: "#8B0000",
            weight: 2,
            opacity: 0.7      
          };
        }
      })
        .bindTooltip("Latrobes path (LCP)", { 
          permanent: false, 
          direction: "top", 
          offset: [0, -10] 
        })
        .bindPopup("<h3>Latrobe's path</h3><p>This line shows a likely path Latrobe could have used, assumed by using a least-cost-path analysis in QGIS.</p>")
        .addTo(map2);
    })
    .catch(error => {
      console.error('Fehler beim Laden des GeoJSON:', error);
    });
});