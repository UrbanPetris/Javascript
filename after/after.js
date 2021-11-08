// let voto = prompt(
//   "Buenas tardes. ¿Desea votor por candidato:\n'A' (candidato rojo)\n'B' (candidato verde)\n'C' (candidato azul)?"
// );

// if (voto === "A" || voto === "a") {
//   alert("Usted ha votado por el candidato A");
// } else if (voto.toUpperCase() === "B") {
//   alert("Usted ha votado por el candidato B");
// } else if (voto === "C" || voto === "c") {
//   alert("Usted ha votado por el candidato C");
// } else {
//   alert("Opción errónea");
// }

const altura = parseFloat(prompt("Ingrese su altura en metros"));
const peso = parseFloat(prompt("Ingrese su peso"));
let imc = peso / altura ** 2;
if (imc >= 16 && imc < 17) {
  alert("Hola");
} else if (imc > 40) {
  alert("Obesidad mórbida (IV)");
} else alert("no pasa nada");
