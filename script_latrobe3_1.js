document.addEventListener('DOMContentLoaded', function() {

  // -------------------Map3 initialization, pre-set location Cape Colony; topografical map------------------------------
  const map3 = L.map('map3', {
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

  let markersWithDates3 = [];
  let uniqueDates3 = new Set();

  // -----Time Slider Setup 3-----
  const slider3 = document.createElement("input");
  slider3.type = "range";
  slider3.min = 0;
  slider3.value = 0;
  slider3.className = "time-slider3";
  document.getElementById("slider-container3").appendChild(slider3);

  // Der Slider-Value wird ohne Datum verwendet
  const sliderValue3 = document.createElement("span");
  sliderValue3.id = "slider-value3";
  document.getElementById("slider-container3").appendChild(sliderValue3);

  // Funktion zum Verarbeiten der GeoJSON-Dateien
  function processGeoJSONData(data, markersWithDates) {
    data.features.forEach(feature => {
      const [lng3, lat3] = feature.geometry.coordinates;
      const title3 = feature.properties.title;
      const note3 = feature.properties.note;
      const role3 = feature.properties.role;
      const wasDerivedFrom3 = feature.properties.wasDerivedFrom;
      const closeMatch3 = feature.properties.closeMatch;
      const certainty3 = feature.properties.certainty;
      const time3 = feature.time;

      const date3 = new Date(time3);
      uniqueDates3.add(date3);

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
          <p><strong>Notes:</strong><br>${note3}</p>
        </div>
        <div class="info-group">
          <p><strong>Coordinates:</strong><br> [${lat3}, ${lng3}]</p>
          <p><strong>Date:</strong> ${time3}</p>
          ${wasDerivedFrom3 ? `<p><strong>Source:</strong><br><a href="${wasDerivedFrom3[1]}" target="blank">${wasDerivedFrom3[0]}</a>` : ''}
        </div>
      `;

      let color3 = "#008078";
      switch (certainty3) {
        case 'certain': color3 = "#008078"; break;
        case 'less-certain': color3 = "#FF9800"; break;
        case 'uncertain': color3 = "#50052b"; break;
      }

      const marker3 = L.circle([lat3, lng3], {
        radius: 500,
        color: color3,
        opacity: 0.5,
        fillOpacity: 0.5
      }).bindPopup(popupContent3).bindTooltip(title3, { permanent: false, direction: "top", offset: [0, -10], className: 'custom-tooltip' });

      marker3.time = date3;
      markersWithDates.push(marker3);
    });
  }

  // Lade und verarbeite beide GeoJSON-Dateien
  Promise.all([
    fetch('latrobe3.json').then(response => response.json()),  // Deine erste Datei
    fetch('latrobe4.json').then(response => response.json())   // Deine zweite Datei
  ])
  .then(([data4, data5]) => {
    processGeoJSONData(data4, markersWithDates3);  // Marker aus der ersten Datei verarbeiten
    processGeoJSONData(data5, markersWithDates3);  // Marker aus der zweiten Datei verarbeiten

    // Berechnung der Zeitdifferenzen in Stunden
    const timeDiffsInHours = []; // Array für die Zeitdifferenzen in Stunden
    uniqueDates3 = [...uniqueDates3]; // Umwandlung des Sets in ein Array, um auf die Werte zugreifen zu können

    // Berechne die Zeitdifferenzen zwischen den einzelnen Markern in Stunden
    for (let i = 1; i < uniqueDates3.length; i++) {
      const timeDiffInHours = Math.floor((uniqueDates3[i] - uniqueDates3[i - 1]) / (1000 * 60 * 60));  // Zeitdifferenz in Stunden
      timeDiffsInHours.push(timeDiffInHours);
    }

    // Die Gesamtzahl der Stunden (Summe aller Zeitdifferenzen)
    const totalTimeDiffInHours = timeDiffsInHours.reduce((acc, val) => acc + val, 0);

    // Anpassung des Sliders, um über alle Stunden des gesamten Zeitraums zu gehen
    slider3.max = totalTimeDiffInHours;

    // Der Timeslider wird nun über den gesamten Zeitraum von Stunden gesteuert
    slider3.oninput = function () {
      const selectedTimeInHours = parseInt(this.value);  // Anzahl der Stunden des ausgewählten Zeitpunkts

      let selectedDate3 = uniqueDates3[0];  // Startdatum setzen
      let accumulatedTimeInHours = 0;  // Akkumulierte Zeit in Stunden

      // Iteriere durch die Markerdaten und finde das passende Datum für den Sliderwert
      for (let i = 1; i < uniqueDates3.length; i++) {
        const diffInHours = Math.floor((uniqueDates3[i] - uniqueDates3[i - 1]) / (1000 * 60 * 60));  // Zeitdifferenz in Stunden
        accumulatedTimeInHours += diffInHours;

        // Wenn die akkumulierte Zeit in Stunden den ausgewählten Sliderwert überschreitet, stoppe
        if (accumulatedTimeInHours >= selectedTimeInHours) {
          selectedDate3 = uniqueDates3[i];
          break;
        }
      }

      // Markergrößenanpassung
      markersWithDates3.forEach(marker3 => {
        const nextMarker = markersWithDates3[markersWithDates3.indexOf(marker3) + 1];
        
        if (marker3.time <= selectedDate3) {
          if (!map3.hasLayer(marker3)) {
            map3.addLayer(marker3);
          }

          let size = 500;
          if (nextMarker && selectedDate3 < nextMarker.time) {
            const timeDiffInHours = Math.floor((nextMarker.time - marker3.time) / (1000 * 60 * 60));  // Zeitdifferenz in Stunden
            const timeFraction = (selectedTimeInHours - accumulatedTimeInHours) / timeDiffInHours;

            size = 500 + (timeFraction * 300); // Marker wächst zwischen 500px und 800px
          } else if (nextMarker && selectedDate3 >= nextMarker.time) {
            size = 800;
          }

          marker3.setRadius(size);
        } else {
          if (map3.hasLayer(marker3)) {
            map3.removeLayer(marker3);
          }

          marker3.setRadius(500); // Initialgröße
        }
      });
    };
  })
  .catch(err => console.error('Fehler beim Laden der GeoJSON-Dateien:', err));

});
