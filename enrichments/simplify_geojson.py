import json

input_file = "latrobe2.json"
output_file = "latrobe_points2.geojson"

def simplify_geojson(input_file, output_file):
    # GeoJSON-Datei einlesen
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Neues GeoJSON erstellen (nur mit den wichtigsten Eigenschaften)
    simplified = {
        "type": "FeatureCollection",
        "crs": {
            "type": "name",
            "properties": {
                "name": "EPSG:4326"
            }
        },
        "features": []
    }
    
    # Durchlaufe alle Features und vereinfache sie
    for feature in data["features"]:
        # Erstelle ein vereinfachtes Feature
        simple_feature = {
            "type": "Feature",
            "id": feature.get("id", ""),
            "properties": {
                "title": feature["properties"].get("title", ""),
                "time": feature.get("time", ""),
                "certainty": feature["properties"].get("certainty", "")
            },
            "geometry": feature["geometry"]
        }
        
        # Füge das vereinfachte Feature zur neuen Sammlung hinzu
        simplified["features"].append(simple_feature)
    
    # Speichere die vereinfachte GeoJSON-Datei
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(simplified, f, ensure_ascii=False, indent=2)
    
    print(f"Vereinfachte GeoJSON-Datei wurde als {output_file} gespeichert.")

if __name__ == "__main__":
    simplify_geojson(input_file, output_file)