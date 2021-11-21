let salirMenu = false;
let inputEVNombre;
let inputEVarea;
let inputEVeleccion;
let EV;
let evCreados = [];
let evIncluidos = [];
const parent_opciones = document.getElementById("ev_opciones");
const parent_elecciones = document.getElementById("ev_elecciones");
let parent_opciones_div;
let parent_elecciones_div;

class EspacioVerde {
  constructor(nombre, area) {
    this.nombre = nombre.toUpperCase().trim();
    this.area = parseInt(area);
    this.checked = false;
  }
  incluir() {
    this.checked = true;
  }
}

function chequeo(nombreEV, areaEV, eleccionEV) {
  if (eleccionEV === "SI") {
    if (isNaN(areaEV)) {
      const ev = new EspacioVerde(nombreEV, 300);
      ev.incluir();
      return ev;
    } else {
      const ev = new EspacioVerde(nombreEV, areaEV);
      ev.incluir();
      return ev;
    }
  } else {
    if (isNaN(areaEV)) {
      return new EspacioVerde(nombreEV, 300);
    } else {
      nombreEV;
      return new EspacioVerde(nombreEV, areaEV);
    }
  }
}

inputEVNombre = prompt(
  "Bienvenido, introduzca un nombre para su espacio verde"
);

inputEVarea = prompt(
  "Ahora introduzca un área en m2 (si no introduce un número válido se tomará 300 m2)"
);
inputEVeleccion = prompt(
  "En caso de querer incluir este espacio en un listado aparte escriba 'SI'"
);

EV = chequeo(inputEVNombre, inputEVarea, inputEVeleccion);
evCreados.push(EV);
if (EV.checked == true) {
  evIncluidos.push(EV);
}

while (salirMenu == false) {
  const continuarInput = prompt(
    "¿Quiere seguir agregando espacios verdes?\n\n1. SI\n\n2. NO"
  );
  if (continuarInput === "SI") {
    inputEVNombre = prompt("Introduzca un nombre para su espacio verde");

    inputEVarea = prompt(
      "Ahora introduzca un área en m2 (si no introduce un número válido se tomará 300 m2)"
    );
    inputEVeleccion = prompt(
      "En caso de querer incluir este espacio en un listado aparte escriba 'SI'"
    );
    EV = chequeo(inputEVNombre, inputEVarea, inputEVeleccion);
    evCreados.push(EV);
    if (EV.checked == true) {
      evIncluidos.push(EV);
    }
  } else {
    salirMenu = true;
  }
}

//Crear elementos html y meterlos en los distintos div
for (creados of evCreados) {
  let div = document.createElement("div");
  div.setAttribute("id", creados.nombre.toLowerCase());
  div.innerHTML = `<h3> Nombre: ${creados.nombre}</h3> <p>Área (m2): ${creados.area}</p>`;
  parent_opciones.appendChild(div);
}

for (creados of evIncluidos) {
  let div = document.createElement("div");
  div.setAttribute("id", creados.nombre.toLowerCase());
  div.innerHTML = `<h3> Nombre: ${creados.nombre}</h3> <p>Área (m2): ${creados.area}</p>`;
  parent_elecciones.appendChild(div);
}

parent_opciones_div = parent_opciones.getElementsByTagName("div");
//Borrar divs con nombre nulo; comienzo por el final porque si comienzo desde el principio cambio el indexado y puedo borrar elementos errados
for (let i = parent_opciones_div.length - 1; i >= 0; i--) {
  const html_div = parent_opciones_div[i];
  if (html_div.id === "") {
    console.log(html_div);
    html_div.parentNode.removeChild(html_div);
  }
}
