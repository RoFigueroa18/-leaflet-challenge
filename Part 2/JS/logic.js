// URLs
const earthquakeUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
const tectonicPlatesUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

//Creating the map object
const myMap = L.map("map", {
  center: [37.09, -95.71],
  zoom: 3
});

// Adding tile layers
const satellite = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

const grayscale = L.tileLayer("https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png", {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap France</a> contributors'
});

const outdoors = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
  attribution: '&copy; <a href="https://opentopomap.org">OpenStreetMap</a> contributors'
});

satellite.addTo(myMap);

let depthColors = ["#a1dab4", "#41b6c4", "#2c7fb8", "#253494", "#f03b20", "#bd0026"];

// Obtaining the color
function getColor(depth) {
  if (depth > 50) {
    return depthColors[5];
  } else if (depth > 30) {
    return depthColors[4];
  } else if (depth > 20) {
    return depthColors[3];
  } else if (depth > 10) {
    return depthColors[2];
  } else {
    return depthColors[0];
  }
};

// Radius based on magnitude
function getRadius(magnitude) {
  return magnitude * 3;
};

//Layers for tectonicPlates and earthquakes
const earthquakes = new L.LayerGroup();
const tectonicPlates = new L.LayerGroup();

// Retrieving the data for earthquakes
d3.json(earthquakeUrl).then(function(data) {
  const earthquakeFeatures = data.features;

  earthquakeFeatures.forEach(earthquake => {
    const coordinates = earthquake.geometry.coordinates;
    const properties = earthquake.properties;

// Markers
    L.circleMarker([coordinates[1], coordinates[0]], {
      radius: getRadius(properties.mag),
      fillColor: getColor(coordinates[2]),
      color: "#000",
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8
    }).bindPopup(`<h3>${properties.place}</h3><hr><p>Magnitude: ${properties.mag}</p><p>Depth: ${coordinates[2]} km</p>`).addTo(earthquakes);
  });

  earthquakes.addTo(myMap);
});

// Retrieving the data for tectonic plates
d3.json(tectonicPlatesUrl).then(function(data) {
  L.geoJSON(data, {
    style: {
      color: "orange",
      weight: 2
    }
  }).addTo(tectonicPlates);

  tectonicPlates.addTo(myMap);
});

// Creating the basemaps and overlays
const baseMaps = {
  "Satellite": satellite,
  "Grayscale": grayscale,
  "Outdoors": outdoors
};

const overlayMaps = {
  "Earthquakes": earthquakes,
  "Tectonic Plates": tectonicPlates
};

L.control.layers(baseMaps, overlayMaps, {
  collapsed: false
}).addTo(myMap);

// Adding the legend
const legend = L.control({ position: "bottomright" });
legend.onAdd = function() {
  const div = L.DomUtil.create("div", "info legend");
  const grades = [0, 10, 20, 30, 40, 50];
  const colors = depthColors;

  for (let i = 0; i < grades.length; i++) {
    div.innerHTML +=
      '<i style="background:' + colors[i] + '"></i> ' +
      grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
  }

  return div;
};
legend.addTo(myMap);