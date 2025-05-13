# latrobe

##Visualization of excursions made during Christian Ignatius Latrob's visit to South Africa in 1815 and 1816.

This repository contains the *Latrobe* project, a visualization of stages of Christian Ignatius Latrobe's trip to South Africa in 1815 and 1816 using leaflet maps.
[Christian Ignatius Latrobe](https://www.wikidata.org/wiki/Q2965351) was a clergyman and Sectretary of the [Moravian Church in England](https://en.wikipedia.org/wiki/Moravian_Church_of_the_British_Province), thus an important representative of the religious and missionary community. This religious community is also called Unitas Fratum and was engaged in missionary work worldwide from the beginning of the 18th century. More information on the Moravians worldwide and research on this community can be found in the [Moravian Knowledge Network](https://www.moravianknowledgenetwork.org/)

In 1815 and 1816, Latrobe traveled to the South African missionary territory of the Moravian Church at the Cape of Good Hope and documented this journey in a travelogue entitled [*Journal of a visit to South Africa, in 1815 and 1816.*](https://archive.org/details/journalofvisitto00latr/mode/2up)
The *Latrobe* project presents parts of this journey on several maps that not only link the waypoints of the journey with information but also provide more context for understanding the information.

It is part of Sabine Hollmann's master's thesis *Missionary Movements in the Moravian Church - Visualizing Christian Ignatius Latrobe's South Africa Journey* submitted to the [Digital Humanities program at the Technical University of Dresden](https://tu-dresden.de/gsw/studium/studienbuero/dhgsw?set_language=en) in May 2025.

It depicts three stages of the journey with different geographical granularities: a low-granularity journey, i.e., with widely separated locations (Map 1), a high-granularity journey, i.e., with closely spaced locations (Map 2), and a mixed-granularity journey, i.e., with both closely spaced and widely separated locations (Map 3). Each map is intended to help depict these different dimensions. The results can be found at this website:


https://stabine.github.io/latrobe/

### Structure

For this project, the repository contains the main HTML, a style CSS file, and a main JavaScript file, as well as separate scripts for each map. These are stored in separate folders (vis1, vis2, and vis3), which also contain the respective GeoJSON files with location information and additional elements for the maps.

All maps and their source documents were created based on the annotated travelogue, which can be found in the "sources" folder. "sources" also contains additional resource material and a supplementary document (in German) that explains the research for the individual waypoints on the maps more detailed.

Furthermore, the "schema" and "img" folders were created, which, as their names indicate, contain schemas and images relevant to the project. There is also an "enrichments" folder containing helpful Python scripts that can be used to further process the GeoJSON files of the individual maps.

The project demonstrates a way to digitally prepare historical text sources and, at the same time, is only a beginning with great potential.


