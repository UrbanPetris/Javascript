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
let ctlBtnToggle = false;
// let addressString;

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
      steps: 20,
    });
  }
  checkCABA(lyrCABA) {
    const point = turf.point([this.long, this.lat]);
    return turf.booleanIntersects(point, lyrCABA);
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
  constructor(cantidad_ev, area_total_ev, buffer_dist, address_string) {
    this.cantidad_ev = cantidad_ev;
    this.area_total_ev = area_total_ev;
    this.buffer_dist = buffer_dist;
    this.address_string = address_string;
  }
  visualizarReporte() {
    $("#direccionConsulta").text(this.address_string);
    $("#cantidadTotalEV").text(this.cantidad_ev);
    $("#areaTotalEV").text(this.area_total_ev.toFixed(2));
    $("#bufferDistElegida").text(this.buffer_dist);
  }
  guardarReporte() {
    localStorage.setItem("direccionConsulta", this.address_string);
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
        className: "ev",
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
        className: "ev",
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
        className: "ev",
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
        className: "ev",
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
        className: "ev",
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
        className: "ev",
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
        className: "ev",
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
        className: "ev",
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
        className: "ev",
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
        className: "ev",
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
        className: "ev",
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
        className: "ev",
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
  $(".ev_opciones:checked").each(function () {
    arrayEleccionEV.push($(this).val());
  });
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
  return L.geoJson(punto_consulta.buffer(), {
    style: () => {
      return {
        fillColor: "rgba(255, 0, 0, 1)",
        color: "rgba(255, 0, 0, 1)",
        className: "resultadoProcesamiento",
      };
    },
    interactive: false,
  });
}

function crear_capa_interseccion() {
  return L.geoJson(procesamiento.intersect(), {
    style: () => {
      return {
        fillColor: "rgba(255, 0, 0, 1)",
        color: "rgba(255, 0, 0, 1)",
        className: "resultadoProcesamiento",
      };
    },
    interactive: false,
  });
}

function getAddress(lat, long) {
  let promise = new Promise(function (resolve, reject) {
    $.ajax({
      url: `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${long}`,
      async: true,
    }).done(function (response) {
      // console.log(response);
      let addressElements = response.address;
      let altura = addressElements.house_number ?? "s/n";
      let barrio = addressElements.suburb ?? "Barrio (sin dato)";
      let comuna = addressElements.city_district ?? "Comuna (sin dato)";
      let addressString = `${addressElements.road} ${altura}, ${barrio}, ${comuna}`;
      resolve(addressString);
    });
  });
  return promise;
}

function crear_capa_ev() {
  return L.geoJson.ajax("data/prueba_multi.geojson", {
    style: style_ev,
    onEachFeature: processEV,
    filter: function (json) {
      return arrayEleccionEV.indexOf(json.properties.clasificac) !== -1;
    },
  });
}

function crear_reporte(lyr, bufferDist, addressString) {
  let json_lyr_interseccion = lyr.toGeoJSON();
  output_reporte_cantidad_ev = json_lyr_interseccion.features.length;
  output_reporte_areatotal_ev = 0;
  for (let i = 0; i < json_lyr_interseccion.features.length; i++) {
    output_reporte_areatotal_ev += turf.area(json_lyr_interseccion.features[i]);
  }
  return new ReporteProcesamiento(
    output_reporte_cantidad_ev,
    output_reporte_areatotal_ev,
    bufferDist,
    addressString
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

  inputBufferDist = $("#bufferDist").val();
  if (inputBufferDist == "") {
    inputBufferDist = 300;
    $("#bufferDist").attr("placeholder", 300);
  }
  punto_consulta = new ConsultaPunto(click_long, click_lat, inputBufferDist);

  if (!punto_consulta.checkCABA(comunas)) {
    $("#mapConsole").text("La ubicación no se encuentra dentro de CABA");
    $("#mapConsole").stop(true, true).slideDown(300).delay(5000).fadeOut(1000); //verificar animación
    if (lyr_punto_consulta_buffer != undefined) {
      removerCapa(lyr_punto_consulta_buffer);
    }
  } else {
    $("#mapConsole").text("Reporte procesado");
    $("#mapConsole").stop(true, true).slideDown(300).delay(5000).fadeOut(1000); //verificar animación

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

    let reverseAddressPromise = getAddress(click_lat, click_long);

    reverseAddressPromise.then((result) => {
      reporte_procesamiento = crear_reporte(
        lyr_resultadoProcesamientoConsulta,
        inputBufferDist,
        result
      );
      reporte_procesamiento.guardarReporte();
      reporte_procesamiento.visualizarReporte();
    });
  }
}

// ******* Event Listeners del DOM ***********

$("#evCargar").on("click", cargarEV);

$("#toggle").on("click", () => {
  lyr_ev.setInteractive(!ev_interactive);
  ev_interactive = !ev_interactive;
  habilitacion_consulta = !habilitacion_consulta;

  if (ctlBtnToggle) $("#reporteProcesamiento").toggle("slow"); //la primera vez no va a hacer el toggle porque se tiene que visualizar el reporte guardado

  if (habilitacion_consulta) {
    mymap.on("click", consultaEV);
    L.DomUtil.addClass(mymap._container, "crosshair-cursor-enabled");
  } else {
    mymap.off("click", consultaEV);
    L.DomUtil.removeClass(mymap._container, "crosshair-cursor-enabled");
  }

  $("#toggle").text(
    ev_interactive ? "Habilitar Consulta" : "Deshabilitar Consulta"
  );

  $("#toggle").toggleClass("toggleHabilitado toggleDeshabilitado");

  ctlBtnToggle = true; //después del primer click siempre va a funcionar el toggle
});

//DOM CARGADO
// *********** Inicialización del MAPA ***************
$(function () {
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

  lyrBSAS = L.tileLayer(
    "https://servicios.usig.buenosaires.gob.ar/mapcache/tms/1.0.0/amba_con_transporte_3857@GoogleMapsCompatible/{z}/{x}/{-y}.png "
  );

  lyrImagery = L.tileLayer.provider("Esri.WorldImagery");

  // ******* Setup Layer Control ***********

  objBasemaps = {
    "Open Street Maps": lyrOSM,
    "Esri World Imagery": lyrImagery,
    "Mapa Buenos Aires (GCBA)": lyrBSAS,
  };

  ctlLayers = L.control
    .layers(objBasemaps, objOverlays, {
      collapsed: false,
    })
    .addTo(mymap);

  mymap.addLayer(lyrOSM);
  cargarEV(); //carga default de EV

  mymap.on("layeradd", (e) => {
    if (e.name == "prueba") {
      console.log("Hola");
    }
  });

  // ******* Carga último reporte ***********

  $("#cantidadTotalEV").text(localStorage.getItem("cantidadTotalEV"));
  $("#areaTotalEV").text(localStorage.getItem("cantidadTotalArea"));
  $("#bufferDistElegida").text(localStorage.getItem("bufferDistElegida"));

  if (localStorage.length === 0) {
    $("#reporteProcesamiento").hide();
    ctlBtnToggle = true;
  } else {
    $("#reporteProcesamiento").show();
  }
});
