class TipoEspacioVerde {
  constructor(tipo_ev) {
    this.tipo_ev = tipo_ev.toUpperCase().trim();
    this.checked = false;
  }
  incluir() {
    this.checked = true;
  }
}

const tipoespacioverde1 = new TipoEspacioVerde(" Parque     ");
const tipoespacioverde2 = new TipoEspacioVerde(" Plaza ");
const tipoespacioverde3 = new TipoEspacioVerde("Plazoleta");
const tipoespacioverde4 = new TipoEspacioVerde("Parque Semipublico");

tipoespacioverde1.incluir();
tipoespacioverde2.incluir();

let array_opciones = [
  tipoespacioverde1,
  tipoespacioverde2,
  tipoespacioverde3,
  tipoespacioverde4,
];

let array_elecciones = [];

for (opcion of array_opciones) {
  if (opcion.checked === true) array_elecciones.push(opcion.tipo_ev);
}

alert(array_elecciones.join(" - "));
