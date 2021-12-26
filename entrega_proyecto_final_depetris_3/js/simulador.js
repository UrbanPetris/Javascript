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
let btnEvOpciones = false;
let habilitacion_consulta = false;
let distritoString;

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

  getAddress() {
    let lat = this.lat;
    let long = this.long;
    let promise = new Promise(function (resolve, reject) {
      $.ajax({
        url: `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${long}`,
        async: true,
      }).done(function (response) {
        // console.log(response);
        let addressElements = response.address;
        let roadString = addressElements.road ?? "Sin nombre";
        let altura = addressElements.house_number ?? "s/n";
        let addressString = `${roadString} ${altura}`;
        resolve(addressString);
      });
    });
    return promise;
  }

  getDistrito(lyrCABA) {
    const point = turf.point([this.long, this.lat]);
    for (let i = 0; i < lyrCABA.features.length; i++) {
      if (turf.booleanPointInPolygon(point, lyrCABA.features[i])) {
        let comuna = parseInt(lyrCABA.features[i].properties["COMUNA"]);
        const arr = lyrCABA.features[i].properties["BARRIO"]
          .toLowerCase()
          .split(" ");
        for (let i = 0; i < arr.length; i++) {
          arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1);
        }
        let barrio = arr.join(" ");
        let distrito_string = barrio + " / Comuna " + comuna;
        return distrito_string;
      }
    }
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
  constructor(
    cantidad_ev,
    area_total_ev,
    buffer_dist,
    address_string,
    distrito_string
  ) {
    this.cantidad_ev = cantidad_ev;
    this.area_total_ev = area_total_ev;
    this.buffer_dist = buffer_dist;
    this.address_string = address_string;
    this.distrito_string = distrito_string;
  }
  visualizarReporte() {
    //acá habría que borrar u ocultar el html de "No hay Reporte" y hacer un append de todo el html del reporte en $(#"reporteProcesamiento")
    $("#direccionConsulta").text(this.address_string);
    $("#distritoConsulta").text(this.distrito_string);
    $("#cantidadTotalEV").text(this.cantidad_ev);
    $("#areaTotalEV").text(this.area_total_ev.toFixed(2));
    $("#bufferDistElegida").text(this.buffer_dist);
  }
  guardarReporte() {
    localStorage.setItem("direccionConsulta", this.address_string);
    localStorage.setItem("distritoConsulta", this.distrito_string);
    localStorage.setItem("cantidadTotalEV", this.cantidad_ev);
    localStorage.setItem("cantidadTotalArea", this.area_total_ev.toFixed(2));
    localStorage.setItem("bufferDistElegida", this.buffer_dist);
  }
}

// *******  Funciones de estilo y visualización ***********

//guardar los objetos dentro de un objeto que contenga otros objetos y llamarlo asincrónicamente
function style_ev(json) {
  let att = json.properties;
  switch (String(att.clasificac)) {
    case "BARRIO/COMPLEJO":
      return {
        opacity: 1,
        color: "rgba(214, 208, 53, 1)",
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
        color: "rgba(55, 54, 47, 1)",
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
        color: "rgba(241, 8, 156, 1)",
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
        color: "rgba(130, 0, 255, 1)",
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
        color: "rgba(196, 94, 24, 1)",
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
        color: "rgba(182, 93, 124, 1)",
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
        color: "rgba(0, 247, 255, 1)",
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
        color: "rgba(244, 129, 140, 1)",
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
        color: "rgba(244, 181, 129, 1)",
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
        color: "rgb(18, 211, 79, 1)",
        dashArray: "",
        lineCap: "butt",
        lineJoin: "miter",
        weight: 1.0,
        fill: true,
        fillOpacity: 0.5,
        fillColor: "rgb(18, 211, 79, 1)",
        interactive: true,
        className: "ev",
      };
      break;

    case "PLAZOLETA":
      return {
        opacity: 1,
        color: "rgba(9, 76, 54, 1)",
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
        color: "rgba(88,159,207,1.0)",
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

function habilitarConsulta() {
  lyr_ev.setInteractive(false);
  mymap.on("click", consultaEV);
  L.DomUtil.addClass(mymap._container, "crosshair-cursor-enabled");
  $("#mapConsole").text("Haga click en el mapa para obtener reporte");
  $("#mapConsole").stop(true, true).slideDown(300).delay(5000).fadeOut(1000);
}

function deshabilitarConsulta() {
  lyr_ev.setInteractive(true);
  mymap.off("click", consultaEV);
  $("#reporteProcesamiento").trigger("sidebar:close");
  L.DomUtil.removeClass(mymap._container, "crosshair-cursor-enabled");
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

function crear_capa_ev() {
  return L.geoJson.ajax("data/prueba_multi.geojson", {
    style: style_ev,
    onEachFeature: processEV,
    filter: function (json) {
      return arrayEleccionEV.indexOf(json.properties.clasificac) !== -1;
    },
  });
}

function crear_reporte(lyr, bufferDist, addressString, prueba) {
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
    addressString,
    prueba
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

  if (!punto_consulta.checkCABA(distritos)) {
    $("#mapConsole").text("La ubicación no se encuentra dentro de CABA");
    $("#mapConsole").stop(true, true).slideDown(300).delay(5000).fadeOut(1000); //verificar animación
    if (lyr_punto_consulta_buffer != undefined) {
      removerCapa(lyr_punto_consulta_buffer);
    }
  } else {
    $("#mapConsole").text("Reporte procesado");
    $("#mapConsole").stop(true, true).slideDown(300).delay(5000).fadeOut(1000); //verificar animación
    // distritoString = punto_consulta.getDistrito(distritos);

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

    let reverseAddressPromise = punto_consulta.getAddress();

    reverseAddressPromise.then((result) => {
      reporte_procesamiento = crear_reporte(
        lyr_resultadoProcesamientoConsulta,
        inputBufferDist,
        result,
        punto_consulta.getDistrito(distritos)
      );
      reporte_procesamiento.guardarReporte();
      reporte_procesamiento.visualizarReporte();
      $("#reporteTitulo").text("Reporte");
      $("#reporteProcesamiento").trigger("sidebar:open");
      ctlBtnReporte.state("ocultar-reporte");
    });
  }
}

// ******* Event Listeners del DOM ***********

$("#btnEvOpciones").on("click", () => {
  btnEvOpciones = !btnEvOpciones;
  $("#btnEvOpciones").text(btnEvOpciones ? "Ocultar opciones" : "Ver opciones");
  if (btnEvOpciones) {
    $("#evCheckboxes").slideDown();
  } else {
    $("#evCheckboxes").slideUp();
  }
});

$("#evCargar").on("click", () => {
  cargarEV();
  $("#mapConsole").text("Espacios verdes cargados");
  $("#mapConsole").stop(true, true).slideDown(300).delay(5000).fadeOut(1000); //verificar animación

  $("#sidebarController").hide();
  $("#reporteProcesamiento").hide();
  if ($(".leaflet-control-layers").is(":visible")) {
    $(".leaflet-control-layers").hide();
    setTimeout(() => {
      $(".leaflet-control-layers").fadeIn();
    }, 2000);
  }

  setTimeout(() => {
    $("#sidebarController").fadeIn();
    $("#reporteProcesamiento").fadeIn();
  }, 2000);
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
  lyrDark = L.tileLayer.provider("CartoDB.DarkMatter");

  objBasemaps = {
    "Open Street Maps": lyrOSM,
    "CartoDB Dark": lyrDark,
    "Esri World Imagery": lyrImagery,
    "Mapa Buenos Aires (GCBA)": lyrBSAS,
  };

  // *********** Inicialización de Sidebar y controles ***************

  $("#sidebarController").sidebar();
  $("#reporteProcesamiento").sidebar({ side: "bottom" });

  ctlBtnReporte = L.easyButton({
    id: "btnReporte",
    position: "topright",
    states: [
      {
        stateName: "ver-reporte",
        icon: "bi bi-chat-square-text",
        title: "Ver reporte",
        onClick: function (control) {
          $("#reporteProcesamiento").trigger("sidebar:open");
          control.state("ocultar-reporte");
        },
      },
      {
        stateName: "ocultar-reporte",
        icon: "bi bi-chat-square-text",
        title: "Ocultar reporte",
        onClick: function (control) {
          $("#reporteProcesamiento").trigger("sidebar:close");
          control.state("ver-reporte");
        },
      },
    ],
  }).addTo(mymap);

  ctlBtnConsulta = L.easyButton({
    id: "btnConsulta",
    position: "topright",
    states: [
      {
        stateName: "habilitar-consulta",
        icon: "bi bi-bullseye",
        title: "Habilitar Consulta",
        onClick: function (control) {
          habilitarConsulta();
          control.state("deshabilitar-consulta");
        },
      },
      {
        stateName: "deshabilitar-consulta",
        icon: "bi bi-bullseye",
        title: "Deshabilitar Consulta",
        onClick: function (control) {
          deshabilitarConsulta();
          control.state("habilitar-consulta");
        },
      },
    ],
  }).addTo(mymap);

  ctlBtnSidebarController = L.easyButton({
    position: "topright",
    states: [
      {
        stateName: "mostrar-sidebar",
        icon: "bi bi-tree-fill",
        title: "Mostrar Sidebar",
        onClick: function (control) {
          $("#sidebarController").trigger("sidebar:open");
          control.state("ocultar-sidebar");
        },
      },
      {
        stateName: "ocultar-sidebar",
        icon: "bi bi-tree",
        title: "Ocultar Sidebar",
        onClick: function (control) {
          $("#sidebarController").trigger("sidebar:close");
          control.state("mostrar-sidebar");
        },
      },
    ],
  }).addTo(mymap);

  ctlLayers = L.control
    .layers(objBasemaps, objOverlays, {
      collapsed: false,
    })
    .addTo(mymap);

  let btnLeafletControlLayers = L.DomUtil.create(
    "button",
    "btnLeafletControlLayers",
    $("#mapdiv")[0]
  );

  btnLeafletControlLayers.innerHTML =
    '<i class="bi bi-arrows-angle-expand"></i>';

  $(".btnLeafletControlLayers").on("click", () => {
    $(".leaflet-control-layers").toggle("slow");
  });

  mymap.addLayer(lyrOSM);

  cargarEV(); //carga default de EV

  $(
    ".btnLeafletControlLayers,.easy-button-button,#reporteProcesamiento,#sidebarController"
  ).each(function () {
    $(this).click((e) => {
      e.stopPropagation();
    });
  });

  $("#sidebarController").mousedown(function () {
    mymap.dragging.disable();
  });

  $("#sidebarController").mouseout(function () {
    mymap.dragging.enable();
  });

  L.DomEvent.on(
    L.DomUtil.get("sidebarController"),
    "mousewheel",
    L.DomEvent.stopPropagation
  );

  // ******* Carga último reporte ***********

  //Podría inicializar aquí el reporte obteniendo datos del localStorage.. si no existe localStorage no se hace nada. Si existe, entonces se emplea un método para cambiar el html
  $("#direccionConsulta").text(localStorage.getItem("direccionConsulta"));
  $("#distritoConsulta").text(localStorage.getItem("distritoConsulta"));
  $("#cantidadTotalEV").text(localStorage.getItem("cantidadTotalEV"));
  $("#areaTotalEV").text(localStorage.getItem("cantidadTotalArea"));
  $("#bufferDistElegida").text(localStorage.getItem("bufferDistElegida"));

  //esto debería cargarse una vez que carga el mapa
  //debería ser un método de la clase Reporte
  if (localStorage.length != 0) {
    //si hay un último reporte, mostrarlo por unos segundos pero deshabilitar momentáneamente botón de reporte
    ctlBtnReporte.disable();
    $("#reporteTitulo").text("Último Reporte");
    $("#reporteProcesamiento").trigger("sidebar:open", [{ speed: 2000 }]);
    setTimeout(() => {
      $("#reporteProcesamiento").trigger("sidebar:close");
    }, 5000);
    ctlBtnReporte.enable();
  }
});
