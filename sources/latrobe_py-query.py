import xml.etree.ElementTree as ET
import pandas as pd

# XML-Datei einlesen
tree = ET.parse('./Latrobe_Journal_en_20250211_SH.xml')  # Beispiel für relativen Pfad
root = tree.getroot()

# Liste für alle extrahierten Elemente
data = []

# Durchlaufe alle relevanten Elemente im XML-Dokument
for element in root.iter():
    # Extrahiere <head> Elemente
    if element.tag == '{http://www.tei-c.org/ns/1.0}head':
        content = ' '.join(element.itertext()).strip() if element is not None else ''
        data.append({'Element': str(element.tag), 'Content': content})
    
    # Extrahiere <date> Elemente
    elif element.tag == '{http://www.tei-c.org/ns/1.0}date':
        content = ' '.join(element.itertext()).strip() if element is not None else ''
        data.append({'Element': str(element.tag), 'Content': content})
    
    # Extrahiere <placeName> Elemente
    elif element.tag == '{http://www.tei-c.org/ns/1.0}placeName':
        content = ' '.join(element.itertext()).strip() if element is not None else ''
        data.append({'Element': str(element.tag), 'Content': content})
    
    # Extrahiere <fw type="pageNum"> Elemente
    elif element.tag == '{http://www.tei-c.org/ns/1.0}fw' and element.attrib.get('type') == 'pageNum':
        content = ' '.join(element.itertext()).strip() if element is not None else ''
        data.append({'Element': str(element.tag), 'Content': content})
    
    # Extrahiere <rs type="place"> Elemente
    elif element.tag == '{http://www.tei-c.org/ns/1.0}rs' and element.attrib.get('type') == 'place':
        content = ' '.join(element.itertext()).strip() if element is not None else ''
        data.append({'Element': str(element.tag), 'Content': content})

# Erstelle ein DataFrame mit den extrahierten Daten
df = pd.DataFrame(data)

# DataFrame in eine Excel-Datei schreiben
df.to_excel('latrobequery-py_neu.xlsx', index=False)

# Optional: Ausgabe des DataFrames zur Kontrolle
print(df)
