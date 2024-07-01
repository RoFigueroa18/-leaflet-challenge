// We specify the url - I used the past 7 days
const url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Creating the map object
const myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 4
});

// Adding the tile layer
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(myMap);

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
}

// Radius based on magnitude
function getRadius(magnitude) {
  return magnitude * 3;
}

// Retrieve the data
d3.json(url).then(function(data) {
  const earthquakes = data.features;

  earthquakes.forEach(earthquake => {
    const coordinates = earthquake.geometry.coordinates;
    const properties = earthquake.properties;

    // Adding the markers
    L.circleMarker([coordinates[1], coordinates[0]], {
      radius: getRadius(properties.mag),
      fillColor: getColor(coordinates[2]),
      color: "#000",
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8
    }).bindPopup(`<h3>${properties.place}</h3><hr><p>Magnitude: ${properties.mag}</p><p>Depth: ${coordinates[2]} km</p>`).addTo(myMap);
  });

  // Adding legend
  const legend = L.control({ position: "bottomright" });
  legend.onAdd = function() {
    const div = L.DomUtil.create("div", "info legend");
    const grades = [0, 10, 20, 30, 40, 50];
    const colors = depthColors;

    for (let i = 0; i < grades.length; i++) {
      div.innerHTML +=
        '<i style="background:' + colors[i] + '"></i> ' + grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
  };
  legend.addTo(myMap);
});
