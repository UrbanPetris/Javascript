// *********** VARIABLES inicialización ***************

let ctlLayers;
let objBasemaps;
let objOverlays;
let punto_consulta;
let procesamiento;
let reporte_procesamiento;
let click_lat;
let click_long;
let lyr_ev;
let lyr_punto_consulta_buffer;
let lyr_resultadoProcesamientoConsulta;
let maxBoundsCABA = [
  [-34.7323613668324, -58.56414364535638],
  [-34.49954995937643, -58.302669294769714],
];
let fitBoundsCABA = [
  [-34.7053239914823, -58.53147608870353],
  [-34.526509192627195, -58.335194232412746],
];
let inputBufferDist;
let arrayEleccionEV = [];
let output_reporte_cantidad_ev;
let output_reporte_areatotal_ev = 0;
let ev_interactive = true;
let habilitacion_consulta = false;

// *******  Definición de clases ***********

class ConsultaPunto {
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

class ProcesamientoLayers {
  constructor(lyrPolygon1, lyrPolygon2) {
    this.lyrPolygon1 = lyrPolygon1;
    this.lyrPolygon2 = lyrPolygon2;
  }
  intersect() {
    let poly = this.lyrPolygon1.toGeoJSON().features[0];
    let fcPoly = this.lyrPolygon2.toGeoJSON();
    let fgp = [];
    let bbPoly = turf.bboxPolygon(turf.bbox(poly));
    for (let i = 0; i < fcPoly.features.length; i++) {
      let bb = turf.bboxPolygon(turf.bbox(fcPoly.features[i]));
      if (turf.intersect(bbPoly, bb)) {
        let int = turf.intersect(poly, fcPoly.features[i]);
        if (int) {
          int.properties = fcPoly.features[i].properties;
          fgp.push(int);
        }
      }
    }
    return turf.featureCollection(fgp);
  }
}

class ReporteProcesamiento {
  constructor(cantidad_ev, area_total_ev, buffer_dist) {
    this.cantidad_ev = cantidad_ev;
    this.area_total_ev = area_total_ev;
    this.buffer_dist = buffer_dist;
  }
  visualizarReporte() {
    document.getElementById("cantidadTotalEV").innerHTML = this.cantidad_ev;
    document.getElementById("areaTotalEV").innerHTML =
      this.area_total_ev.toFixed(2);
    document.getElementById("bufferDistElegida").innerHTML = this.buffer_dist;
  }
  guardarReporte() {
    localStorage.setItem("cantidadTotalEV", this.cantidad_ev);
    localStorage.setItem("cantidadTotalArea", this.area_total_ev.toFixed(2));
    localStorage.setItem("bufferDistElegida", this.buffer_dist);
  }
}

// *******  Funciones de estilo y visualización ***********

function style_ev(json) {
  let att = json.properties;
  switch (String(att.clasificac)) {
    case "BARRIO/COMPLEJO":
      return {
        opacity: 1,
        color: "rgba(35,35,35,1.0)",
        dashArray: "",
        lineCap: "butt",
        lineJoin: "miter",
        weight: 1.0,
        fill: true,
        fillColor: "rgba(214, 208, 53, 1)",
        interactive: true,
      };
      break;

    case "CANTERO CENTRAL":
      return {
        opacity: 1,
        color: "rgba(35,35,35,1.0)",
        dashArray: "",
        lineCap: "butt",
        lineJoin: "miter",
        weight: 1.5,
        fill: true,
        fillColor: "rgba(55, 54, 47, 1)",
        interactive: true,
      };
      break;

    case "JARDÍN":
      return {
        opacity: 1,
        color: "rgba(35,35,35,1.0)",
        dashArray: "",
        lineCap: "butt",
        lineJoin: "miter",
        weight: 1.5,
        fill: true,
        fillColor: "rgba(241, 8, 156, 1)",
        interactive: true,
      };
      break;

    case "JARDÍN BOTÁNICO":
      return {
        opacity: 1,
        color: "rgba(35,35,35,1.0)",
        dashArray: "",
        lineCap: "butt",
        lineJoin: "miter",
        weight: 1.5,
        fill: true,
        fillColor: "rgba(130, 0, 255, 1)",
        interactive: true,
      };
      break;

    case "PARQUE":
      return {
        opacity: 1,
        color: "rgba(35,35,35,1.0)",
        dashArray: "",
        lineCap: "butt",
        lineJoin: "miter",
        weight: 1.0,
        fill: true,
        fillColor: "rgba(196, 94, 24, 1)",
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
        fillColor: "rgba(182, 93, 124, 1)",
        interactive: true,
      };
      break;

    case "PATIO":
      return {
        opacity: 1,
        color: "rgba(35,35,35,1.0)",
        dashArray: "",
        lineCap: "butt",
        lineJoin: "miter",
        weight: 1.0,
        fill: true,
        fillOpacity: 0.5,
        fillColor: "rgba(0, 247, 255, 1)",
        interactive: true,
      };
      break;

    case "PATIO DE JUEGOS INCLUSIVO":
      return {
        opacity: 1,
        color: "rgba(35,35,35,1.0)",
        dashArray: "",
        lineCap: "butt",
        lineJoin: "miter",
        weight: 1.0,
        fill: true,
        fillOpacity: 0.5,
        fillColor: "rgba(244, 129, 140, 1)",
        interactive: true,
      };
      break;

    case "PATIO RECREATIVO":
      return {
        opacity: 1,
        color: "rgba(35,35,35,1.0)",
        dashArray: "",
        lineCap: "butt",
        lineJoin: "miter",
        weight: 1.0,
        fill: true,
        fillOpacity: 0.5,
        fillColor: "rgba(244, 181, 129, 1)",
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
        fillColor: "rgba(129, 244, 166, 1)",
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
        fillColor: "rgba(9, 76, 54, 1)",
        interactive: true,
      };
      break;
    //agregar estilos para los nuevos espacios verdes
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
    att.clasificac +
    "<h4>Area Total (m2): " +
    att.area;
  lyr.bindPopup(popupContent, {
    maxWidth: 250,
  });
}

// *******  Funciones de procesamiento y análisis espacial ***********

function eleccionEV() {
  let inputElements = document.getElementsByClassName("ev_opciones"); //esto con jquery puede ser más fácil
  for (let i = 0; i < inputElements.length; i++) {
    if (inputElements[i].checked) {
      arrayEleccionEV.push(inputElements[i].value);
    }
  }
}

function removerCapa(lyr) {
  ctlLayers.removeLayer(lyr);
  mymap.removeLayer(lyr);
}

function cargarCapa(lyr, lyr_name, lyrfunction) {
  lyr = lyrfunction;
  mymap.addLayer(lyr);
  ctlLayers.addOverlay(lyr, lyr_name);
  return lyr;
}

function crear_capa_buffer() {
  return L.geoJson(punto_consulta.buffer(), { interactive: false });
}

function crear_capa_interseccion() {
  return L.geoJson(procesamiento.intersect(), { interactive: false });
}

function crear_capa_ev() {
  return L.geoJson.ajax("data/prueba_multi2.geojson", {
    style: style_ev,
    onEachFeature: processEV,
    filter: function (json) {
      return arrayEleccionEV.indexOf(json.properties.clasificac) !== -1;
    },
  });
}

function crear_reporte(lyr, bufferDist) {
  let json_lyr_interseccion = lyr.toGeoJSON();
  output_reporte_cantidad_ev = json_lyr_interseccion.features.length;
  output_reporte_areatotal_ev = 0;
  for (let i = 0; i < json_lyr_interseccion.features.length; i++) {
    output_reporte_areatotal_ev += turf.area(json_lyr_interseccion.features[i]);
  }
  return new ReporteProcesamiento(
    output_reporte_cantidad_ev,
    output_reporte_areatotal_ev,
    bufferDist
  );
}

function cargarEV() {
  eleccionEV();

  if (lyr_ev != undefined) {
    //si ya está definida/tiene contenido
    removerCapa(lyr_ev);
    lyr_ev = cargarCapa(lyr_ev, "Espacios Verdes", crear_capa_ev());
  } else {
    lyr_ev = cargarCapa(lyr_ev, "Espacios Verdes", crear_capa_ev());
  }

  lyr_ev.on("data:loaded", function () {
    arrayEleccionEV = [];
    lyr_ev.setInteractive(ev_interactive);
  });
}

function consultaEV(e) {
  click_lat = e.latlng.lat;
  click_long = e.latlng.lng;
  inputBufferDist = document.getElementById("bufferDist").value;
  if (inputBufferDist == "") {
    inputBufferDist = 300;
    document.getElementById("bufferDist").setAttribute("placeholder", 300);
  }
  punto_consulta = new ConsultaPunto(click_long, click_lat, inputBufferDist);

  if (lyr_punto_consulta_buffer != undefined) {
    //si ya está definida/tiene contenido
    removerCapa(lyr_punto_consulta_buffer);
    lyr_punto_consulta_buffer = cargarCapa(
      lyr_punto_consulta_buffer,
      "Buffer",
      crear_capa_buffer()
    );
  } else {
    lyr_punto_consulta_buffer = cargarCapa(
      lyr_punto_consulta_buffer,
      "Buffer",
      crear_capa_buffer()
    );
  }

  procesamiento = new ProcesamientoLayers(lyr_punto_consulta_buffer, lyr_ev);
  if (lyr_resultadoProcesamientoConsulta != undefined) {
    removerCapa(lyr_resultadoProcesamientoConsulta);

    lyr_resultadoProcesamientoConsulta = cargarCapa(
      lyr_resultadoProcesamientoConsulta,
      "Resulado Consulta",
      crear_capa_interseccion()
    );
  } else {
    lyr_resultadoProcesamientoConsulta = cargarCapa(
      lyr_resultadoProcesamientoConsulta,
      "Resulado Consulta",
      crear_capa_interseccion()
    );
  }

  reporte_procesamiento = crear_reporte(
    lyr_resultadoProcesamientoConsulta,
    inputBufferDist
  );
  reporte_procesamiento.guardarReporte();
  reporte_procesamiento.visualizarReporte();
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

// *********** Inicialización de los LAYER ***************

lyrOSM = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
});

lyrImagery = L.tileLayer.provider("Esri.WorldImagery");

// ******* Setup Layer Control ***********

objBasemaps = {
  "Open Street Maps": lyrOSM,
  "Esri World Imagery": lyrImagery,
};

ctlLayers = L.control
  .layers(objBasemaps, objOverlays, {
    collapsed: false,
  })
  .addTo(mymap);

mymap.addLayer(lyrOSM);
//carga default de EV
cargarEV();

// ******* Carga último reporte ***********

document.getElementById("cantidadTotalEV").innerHTML =
  localStorage.getItem("cantidadTotalEV");
document.getElementById("areaTotalEV").innerHTML =
  localStorage.getItem("cantidadTotalArea");
document.getElementById("bufferDistElegida").innerHTML =
  localStorage.getItem("bufferDistElegida");

// ******* Event Listeners ***********

document.getElementById("evCargar").addEventListener("click", cargarEV);

document.getElementById("toggle").addEventListener("click", () => {
  lyr_ev.setInteractive(!ev_interactive);

  ev_interactive = !ev_interactive;

  habilitacion_consulta = !habilitacion_consulta;

  if (habilitacion_consulta) {
    mymap.on("click", consultaEV);
    L.DomUtil.addClass(mymap._container, "crosshair-cursor-enabled");
  } else {
    mymap.off("click", consultaEV);
    L.DomUtil.removeClass(mymap._container, "crosshair-cursor-enabled");
  }

  document.getElementById("toggle").innerHTML = ev_interactive
    ? "Habilitar Consulta"
    : "Deshabilitar Consulta";
});
