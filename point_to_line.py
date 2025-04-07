import json

# Lade die Originaldatei
with open("latrobe1.json", "r", encoding="utf-8") as f:
    data = json.load(f)

# Punkte sortieren nach ID
sorted_features = sorted(
    data["features"],
    key=lambda f: f["id"]
)

# Koordinaten auslesen (nur wenn Typ = "Point")
coordinates = [
    feature["geometry"]["coordinates"]
    for feature in sorted_features
    if feature["geometry"]["type"] == "Point"
]

# Neue GeoJSON mit LineString erstellen
route_geojson = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "geometry": {
                "type": "LineString",
                "coordinates": coordinates
            },
            "properties": {
                "title": "Route aus Punkten",
                "source": "latrobe1.json"
            }
        }
    ]
}

# Neue Datei speichern
with open("latrobe_route1.geojson", "w", encoding="utf-8") as f:
    json.dump(route_geojson, f, indent=2, ensure_ascii=False)
