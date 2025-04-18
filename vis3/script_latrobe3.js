// ==== INTERAKTIVE ROUTE-VISUALISIERUNG MIT ZEITSTEUERUNG ====
document.addEventListener('DOMContentLoaded', function() {

  // ===== 1. KARTE INITIALISIEREN =====
  
  const map3 = L.map('map3', {
    center: [-33.775120570267205, 22.333937355866688],
    zoom: 8,
    minZoom: 8,  // Voreingestellter Zoom-Bereich 
    maxZoom: 15
  });

  // OpenTopoMap als Basislayer hinzufügen
  var OpenTopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });
  OpenTopoMap.addTo(map3);

  // ===== 2. VARIABLEN UND TIME-SLIDER SETUP =====
  
  // Arrays und Sets für Zeitsynchronisation
  let markersWithDates3 = [];
  let uniqueDates3 = new Set();

  // Time Slider erstellen und konfigurieren
  const slider3 = document.createElement("input");
  slider3.type = "range";
  slider3.min = 0;
  slider3.value = 0;
  slider3.className = "time-slider3";
  document.getElementById("slider-container3").appendChild(slider3);

  // Anzeigeelement für den Slider-Wert
  const sliderValue3 = document.createElement("span");
  sliderValue3.id = "slider-value3";
  document.getElementById("slider-container3").appendChild(sliderValue3);

  // ===== 3. HILFSFUNKTIONEN =====
  
  // Funktion zum Verarbeiten der GeoJSON-Dateien
  function processGeoJSONData(data, markersWithDates) {
    data.features.forEach(feature => {
      // Eigenschaften extrahieren
      const [lng3, lat3] = feature.geometry.coordinates;
      const title3 = feature.properties.title;
      const note3 = feature.properties.note;
      const role3 = feature.properties.role;
      const wasDerivedFrom3 = feature.properties.wasDerivedFrom;
      const closeMatch3 = feature.properties.closeMatch;
      const certainty3 = feature.properties.certainty;
      const time3 = feature.time;

      // Datum erzeugen und für den Slider speichern
      const date3 = new Date(time3);
      uniqueDates3.add(date3);

      // Popup-Inhalt erstellen
      const popupContent3 = `
        <div class="info-group">
          <h3>${title3}</h3>
          <p><strong>Certainty:</strong> ${certainty3}<br>
          ${role3 == "visited" ? `<strong>Role:</strong> visited`: ''}
          ${role3 == "visited_nearby" ? `<strong>Role:</strong> visited nearby`: ''}<br>
          <p><strong>Date:</strong> ${time3}</p>
          </p>
        </div>

        <div class="info-group">
          <p><strong>Notes:</strong></p>
          <p>${note3}</p>
        </div>

        <div class="info-group">
          <p><strong>Coordinates:</strong> ${lat3}, ${lng3}</p>
          ${closeMatch3[0] !== null || closeMatch3[1] !== null ? `
              <p><strong>References:</strong><br>
                ${closeMatch3[0] !== null ? `<a href="${closeMatch3[0]}" target="_blank">GeoNames</a>` : ''}
                <br>
                ${closeMatch3[1] !== null ? `<a href="${closeMatch3[1]}" target="_blank">WikiData</a>` : ''}
              </p>
            ` : ''} 
        </div>
        
        <div class="info-group">          
          ${wasDerivedFrom3 ? `<p><strong>Source:</strong><br><a href="${wasDerivedFrom3[1]}" target="blank">${wasDerivedFrom3[0]}</a></p>`: ''}
        </div>
      `;

      // Marker-Stil basierend auf Eigenschaften konfigurieren
      let color3 = "#008078";
      switch (certainty3) {
        case 'certain': color3 = "#008078"; break;
        case 'less-certain': color3 = "#FF9800"; break;
        case 'uncertain': color3 = "#50052b"; break;
      }

      let radius3 = 500;
      switch (role3) {
        case 'visited': radius3 = 500; break;
        case 'visited_nearby': radius3 = 1200; break;
      }

      // Marker erstellen und konfigurieren
      const marker3 = L.circle([lat3, lng3], {
        radius: radius3,
        color: color3,
        opacity: 0.5,
        fillOpacity: 0.5
      }).bindPopup(popupContent3).bindTooltip(title3, { 
        permanent: false, 
        direction: "top", 
        offset: [0, -10], 
        className: 'custom-tooltip' 
      });

      // Marker mit Datum versehen und zur Liste hinzufügen
      marker3.time = date3;
      markersWithDates.push(marker3);
    });
  }

  // ===== 4. DATEN LADEN UND VERARBEITEN =====
  
  // Beide GeoJSON-Dateien parallel laden
  Promise.all([
    fetch('vis3/latrobe3.json').then(response => response.json()),
    fetch('vis3/latrobe4.json').then(response => response.json())
  ])
  .then(([data4, data5]) => {
    // Marker aus beiden Dateien verarbeiten
    processGeoJSONData(data4, markersWithDates3);
    processGeoJSONData(data5, markersWithDates3);

    // ===== 5. ZEITSTEUERUNG KONFIGURIEREN =====
    
    // Berechnung der Zeitdifferenzen in Stunden
    const timeDiffsInHours = [];
    uniqueDates3 = [...uniqueDates3]; // Set in Array umwandeln

    // Zeitdifferenzen zwischen Markern berechnen
    for (let i = 1; i < uniqueDates3.length; i++) {
      const timeDiffInHours = Math.floor((uniqueDates3[i] - uniqueDates3[i - 1]) / (1000 * 60 * 60));
      timeDiffsInHours.push(timeDiffInHours);
    }

    // Gesamtzahl der Stunden berechnen
    const totalTimeDiffInHours = timeDiffsInHours.reduce((acc, val) => acc + val, 0);

    // Slider auf Gesamtstunden einstellen
    slider3.max = totalTimeDiffInHours;

    // Event-Handler für den Slider
    slider3.oninput = function () {
      const selectedTimeInHours = parseInt(this.value);
      
      let selectedDate3 = uniqueDates3[0];  // Startdatum
      let accumulatedTimeInHours = 0;

      // Passendes Datum für den Slider-Wert finden
      for (let i = 1; i < uniqueDates3.length; i++) {
        const diffInHours = Math.floor((uniqueDates3[i] - uniqueDates3[i - 1]) / (1000 * 60 * 60));
        accumulatedTimeInHours += diffInHours;

        if (accumulatedTimeInHours >= selectedTimeInHours) {
          selectedDate3 = uniqueDates3[i];
          break;
        }
      }

      // Marker dynamisch anpassen
      markersWithDates3.forEach((marker3, index) => {
        const nextMarker = markersWithDates3[index + 1];
    
        if (marker3.time <= selectedDate3) {
          if (!map3.hasLayer(marker3)) {
            map3.addLayer(marker3);
          }
    
          let distance = 1000; // Standard-Fallback
          if (nextMarker) {
            distance = map3.distance(marker3.getLatLng(), nextMarker.getLatLng());
          }
    
          // Größe an Distanz anpassen
          const maxSize = Math.min(2000, distance * 0.5);
          const minSize = 300;
          let size = maxSize;
    
          if (nextMarker && selectedDate3 < nextMarker.time) {
            const timeDiffInHours = Math.floor((nextMarker.time - marker3.time) / (1000 * 60 * 60));
            const timeFraction = (selectedTimeInHours - accumulatedTimeInHours) / timeDiffInHours;
    
            // Größe basierend auf Zeitfraktion anpassen (schrumpfend)
            size = maxSize - (timeFraction * (maxSize - minSize));
          } else if (nextMarker && selectedDate3 >= nextMarker.time) {
            size = minSize;
          }
    
          marker3.setRadius(size);
        } else {
          if (map3.hasLayer(marker3)) {
            map3.addLayer(marker3);
          }
          marker3.setRadius(1200);
        }
      });
      
      // Slider-Wert anzeigen
      sliderValue3.textContent = `${selectedDate3.toISOString().split("T")[0]} (${selectedTimeInHours}h)`;
    };

    // ===== 6. ANIMATION KONFIGURIEREN =====
    
    // Variablen für Animation
    let currentValue = 0;
    let isRunning = false;
    let intervalId = null;

    // Funktion für automatischen Slider-Durchlauf
    function autoRunSlider() {
      const maxValue = slider3.max;
      intervalId = setInterval(() => {
        if (currentValue >= maxValue) {
          currentValue = 0; // Zurücksetzen am Ende
        }
        slider3.value = currentValue;
        slider3.dispatchEvent(new Event('input')); // Event auslösen
        currentValue += 1;
      }, 25); // Animationsgeschwindigkeit
    }

    // Play/Pause-Button erstellen
    const playPauseButton = document.createElement("button");
    playPauseButton.innerText = "Play";
    playPauseButton.className = "play-pause-button";
    document.getElementById("slider-container3").appendChild(playPauseButton);

    // Event-Handler für Play/Pause-Button
    playPauseButton.addEventListener("click", function() {
      if (isRunning) {
        // Animation stoppen
        clearInterval(intervalId);
        playPauseButton.innerText = "Play";
        isRunning = false;
      } else {
        // Animation starten
        currentValue = parseInt(slider3.value);
        autoRunSlider();
        playPauseButton.innerText = "Pause";
        isRunning = true;
      }
    });
  })
  .catch(err => console.error('Fehler beim Laden der GeoJSON-Dateien:', err));

  // ===== 7. LEGENDE ERSTELLEN =====
  
  const legend3 = L.control({ position: "bottomleft" });

  legend3.onAdd = function () {
    const div = L.DomUtil.create("div", "legend-map3");
    div.innerHTML = `
      <div style="margin-bottom:5px;"><strong>Legend</strong></div>
      <div class="legend-item"><span class="legend-circle" style="background:#008078;"></span> certain waypoint</div>
      <div class="legend-item"><span class="legend-circle" style="background:#FF9800;"></span> less certain waypoint</div>
      <div class="legend-item"><span class="legend-circle" style="background:#50052b;"></span> uncertain waypoint</div>
    `;
    return div;
  };

  legend3.addTo(map3);

  // ===== 8. ROUTEN-LAYER LADEN =====
  
  // Hinweg-Route laden
  fetch('vis3/l3_lcp-master.geojson')
    .then(response => response.json())
    .then(data7 => {
      console.log(data7);
      
      // GeoJSON-Layer für Hinweg erstellen
      L.geoJSON(data7, {
        style: function () {
          return {
            color: "#004641",
            weight: 2,
            opacity: 0.7      
         };
       }
      })
      .bindTooltip("Outbound-route (LCP)", { 
        permanent: false, 
        direction: "top", 
        offset: [0, -10] 
      })
      .bindPopup("<h3>Outbound-route assumed using Least-Cost-Path-Analysis in QGIS</h3><p>This line shows a likely outbound route, assumed by using a least-cost-path analysis in QGIS.</p>")
      .addTo(map3);
    })
    .catch(error => {
      console.error('Fehler beim Laden des GeoJSON:', error);
    });

  // Rückweg-Route laden
  fetch('vis3/l4_lcp-master.geojson')
    .then(response => response.json())
    .then(data8 => {
      console.log(data8);
      
      // GeoJSON-Layer für Rückweg erstellen
      L.geoJSON(data8, {
        style: function () {
          return {
            color: "#8B0000",
            weight: 2,
            opacity: 0.7      
         };
       }
      })
      .bindTooltip("Return-route (LCP)", { 
        permanent: false, 
        direction: "top", 
        offset: [0, -10] 
      })
      .bindPopup("<h3>Return-route assumed using Least-Cost-Path-Analysis in QGIS</h3><p>This line shows a likely return route, assumed by using a least-cost-path analysis in QGIS.</p>")
      .addTo(map3);
    })
    .catch(error => {
      console.error('Fehler beim Laden des GeoJSON:', error);
    });
});