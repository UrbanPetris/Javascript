// const edad_promedio = 30;
// let edad_usuario = prompt("Ingrese su edad");
// if (parseInt(edad_usuario) < 30) {
//   console.log("Usted es menor que la edad promedio");
// } else {
//   console.log("todo bien");
// }

// const coderhouse = "CODERHOUSE";
// let input_usuario = prompt("Escribe una palabra");
// if (input_usuario != coderhouse) {
//   console.log("Rechazado");
// } else {
//   console.log("Bienvenido");
// }

let nombre = prompt("Diga su nombre");
let edad;
if (nombre !== "") {
  edad = prompt("Hola, " + nombre + ", ¿cuál es tu edad");
  if (parseInt(edad) > 30) {
    console.log("Sos mayor");
  } else {
    console.log("Sos menor");
  }
} else {
  console.log("No introdujiste nada, recarga la página");
}
