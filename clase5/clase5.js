function Vehiculo(data) {
  this.ruedas = data.ruedas;
  this.peso = data.peso;
}

const vehiculo1 = new Vehiculo({ peso: 85 });

console.log(vehiculo1.peso);

function Vehiculox(peso, ruedas) {
  this.peso = peso;
  this.ruedas = ruedas;
}

const vehiculo2 = new Vehiculox(85, "carlos");
