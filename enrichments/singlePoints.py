import json
import os

input_file = "latrobe4.json"
output_dir = "Latrobe4_singlePoints"  # Verzeichnis, in dem die neuen GeoJSON-Dateien gespeichert werden sollen

def split_geojson(input_file, output_dir):
    # GeoJSON-Datei einlesen
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Erstelle das Ausgabe-Verzeichnis, falls es noch nicht existiert
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    # Durchlaufe alle Features (Wegpunkte) und erstelle für jedes Feature eine neue GeoJSON-Datei
    for i, feature in enumerate(data["features"]):
        # Extrahiere nur den "title" aus den Properties
        title = feature["properties"].get("title", "")  # Falls kein "title" vorhanden, leerer String
        
        # Neues Feature erstellen, das nur den "title" in den Properties hat
        simplified_feature = {
            "type": "Feature",
            "properties": {
                "title": title
            },
            "geometry": feature["geometry"]
        }
        
        # Neues GeoJSON für den aktuellen Punkt erstellen
        single_feature_geojson = {
            "type": "FeatureCollection",
            "crs": {
                "type": "name",
                "properties": {
                    "name": "EPSG:4326"
                }
            },
            "features": [simplified_feature]  # Nur das vereinfachte Feature
        }
        
        # Benenne die Datei nach dem Index oder einer Eigenschaft
        output_file = os.path.join(output_dir, f"latrobe4_{i+1}.geojson")
        
        # Speichere die GeoJSON-Datei
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(single_feature_geojson, f, ensure_ascii=False, indent=2)
        
        print(f"GeoJSON-Datei für Punkt {i+1} wurde als {output_file} gespeichert.")

if __name__ == "__main__":
    split_geojson(input_file, output_dir)
