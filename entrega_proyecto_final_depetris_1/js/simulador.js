// *********** VARIABLES inicialización ***************

let ctlLayers;
let objBasemaps;
let objOverlays;
let punto_consulta;
let click_lat;
let click_long;
let lyr_punto_consulta_buffer;
let maxBoundsCABA = [
  [-34.7323613668324, -58.56414364535638],
  [-34.49954995937643, -58.302669294769714],
];
let fitBoundsCABA = [
  [-34.7053239914823, -58.53147608870353],
  [-34.526509192627195, -58.335194232412746],
];
let salirMenu = false;
let EleccionEV;
let EleccionBufferDist;
let arrayEleccionEV = [];
let mensajeElecionEV;
let mensajearrayEleccionEV = "";

// *******  Definición de clases ***********

class Consulta {
  constructor(long, lat, buffer_dist) {
    this.long = long;
    this.lat = lat;
    this.buffer_dist = buffer_dist;
  }
  buffer() {
    const point = turf.point([this.long, this.lat]);
    return turf.buffer(point, this.buffer_dist, {
      units: "meters",
    });
  }
}

// *******  Input de datos ***********

EleccionEV = prompt(
  "Bienvenido, elija un tipo de espacio verde a visualizar entre las siguientes opciones (escriba el texto después del número):\n\n 1. PARQUE\n 2. PLAZA\n 3. PLAZOLETA\n 4. PARQUE SEMIPÚBLICO"
)
  .toUpperCase()
  .trim();
arrayEleccionEV.push(EleccionEV);

while (salirMenu == false) {
  let continuarInput = prompt(
    "¿Quiere seguir agregando espacios verdes?\n\n 1. SI\n\n2. NO"
  );
  if (continuarInput === "SI") {
    EleccionEV = prompt(
      "Por favor, elija un tipo de espacio verde a visualizar entre las siguientes opciones (escriba el texto después del número):\n\n 1. PARQUE\n 2. PLAZA\n 3. PLAZOLETA\n 4. PARQUE SEMIPÚBLICO"
    )
      .toUpperCase()
      .trim();
    arrayEleccionEV.push(EleccionEV);
  } else {
    salirMenu = true;
  }
}

EleccionBufferDist = parseInt(prompt("Elija una distancia buffer")); //eventualmente hay que controlar que sea número entero para no romper el programa

if (isNaN(EleccionBufferDist)) {
  EleccionBufferDist = 500;
  alert(
    "Introdujo un valor no apto de distancia de buffer. Se tomará un valor por defecto (500 metros)"
  );
} else {
  alert(`Has elegido una distancia de buffer de ${EleccionBufferDist} metros`);
}

for (let i = 0; i < arrayEleccionEV.length; i++) {
  mensajearrayEleccionEV += "\n";
  mensajearrayEleccionEV += arrayEleccionEV[i];
}

mensajeElecionEV = `Se visualizarán en el mapa los espacios verdes elegidos:\n${mensajearrayEleccionEV}\n\nPuede consultar ahora en el mapa información de estos espacios verdes y por ahora realizar un buffer en un punto seleccionado para ver cuáles están dentro de la distancia escogida`;

alert(mensajeElecionEV);

// *******  Visualización y análisis espacial ***********

// *******  Funciones de procesamiento ***********

function style_ev(json) {
  let att = json.properties;
  switch (String(att.clasificac)) {
    case "PARQUE":
      return {
        opacity: 1,
        color: "rgba(35,35,35,1.0)",
        dashArray: "",
        lineCap: "butt",
        lineJoin: "miter",
        weight: 1.0,
        fill: true,
        fillColor: "rgba(255,230,1,1.0)",
        interactive: true,
      };
      break;

    case "PLAZOLETA":
      return {
        opacity: 1,
        color: "rgba(35,35,35,1.0)",
        dashArray: "",
        lineCap: "butt",
        lineJoin: "miter",
        weight: 1.0,
        fill: true,
        fillColor: "rgba(255,166,1,1.0)",
        interactive: true,
      };
      break;

    case "PARQUE SEMIPÚBLICO":
      return {
        opacity: 1,
        color: "rgba(35,35,35,1.0)",
        dashArray: "",
        lineCap: "butt",
        lineJoin: "miter",
        weight: 1.0,
        fill: true,
        fillOpacity: 0.5,
        fillColor: "rgba(255,1,35,1.0)",
        interactive: true,
      };
      break;

    case "PLAZA":
      return {
        opacity: 1,
        color: "rgba(35,35,35,1.0)",
        dashArray: "",
        lineCap: "butt",
        lineJoin: "miter",
        weight: 1.0,
        fill: true,
        fillOpacity: 0.5,
        fillColor: "rgba(205,88,160,1.0)",
        interactive: true,
      };
      break;

    default:
      return {
        opacity: 1,
        color: "rgba(35,35,35,1.0)",
        dashArray: "",
        lineCap: "butt",
        lineJoin: "miter",
        weight: 1.0,
        fill: true,
        fillOpacity: 0.5,
        fillColor: "rgba(88,159,207,1.0)",
        interactive: true,
      };
      break;
  }
}

function processEV(json, lyr) {
  let att = json.properties;
  let popupContent =
    "<h4>Id: " +
    att.id +
    "<h4>Nombre Espacio Verde: " +
    att.nombre +
    "<h4>Tipo de espacio verde: " +
    att.clasificac;
  lyr.bindPopup(popupContent, {
    maxWidth: 250,
  });
}

// *********** Inicialización del MAPA ***************

mymap = L.map("mapdiv", {
  zoom: 3,
  zoomSnap: 0,
  zoomDelta: 0.25,
  attributionControl: false,
  minZoom: 10,
  maxBounds: maxBoundsCABA,
}).fitBounds(fitBoundsCABA);

mymap.on("click", function onMapClick(e) {
  click_lat = e.latlng.lat;
  click_long = e.latlng.lng;
  punto_consulta = new Consulta(click_long, click_lat, EleccionBufferDist);
  if (lyr_punto_consulta_buffer != undefined) {
    //si ya está definida/tiene contenido
    ctlLayers.removeLayer(lyr_punto_consulta_buffer);
    mymap.removeLayer(lyr_punto_consulta_buffer);
    lyr_punto_consulta_buffer = L.geoJson(punto_consulta.buffer()).addTo(mymap);
    ctlLayers.addOverlay(lyr_punto_consulta_buffer, "Buffer");
  } else {
    lyr_punto_consulta_buffer = L.geoJson(punto_consulta.buffer()).addTo(mymap);
    ctlLayers.addOverlay(lyr_punto_consulta_buffer, "Buffer");
  }
});

// *********** Inicialización de los LAYER ***************

lyrOSM = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
});

lyrImagery = L.tileLayer.provider("Esri.WorldImagery");

lyr_ev = L.geoJson.ajax("data/prueba_multi.geojson", {
  //ojo, es una prueba este geojson, hay que depurarlo
  style: style_ev,
  onEachFeature: processEV,
  filter: function (json) {
    return arrayEleccionEV.indexOf(json.properties.clasificac) !== -1; //acá puedo agregar la elección
  },
});

// ******* Setup Layer Control ***********

objBasemaps = {
  "Open Street Maps": lyrOSM,
  "Esri World Imagery": lyrImagery,
};

objOverlays = {
  "Espacio Verde": lyr_ev,
};

ctlLayers = L.control
  .layers(objBasemaps, objOverlays, {
    collapsed: false,
  })
  .addTo(mymap);

mymap.addLayer(lyrOSM);
mymap.addLayer(lyr_ev);
