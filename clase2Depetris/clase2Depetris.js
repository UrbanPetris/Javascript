let nombre = prompt("Hola. ¿Cómo te llamás?");
let edad;
let year = 1989;
if (nombre) {
  edad = prompt("Hola, " + nombre + ", ¿cuál es tu edad?");
  if (parseInt(edad) + year >= 2021) {
    alert("Naciste en los 80s. Bienvenido al club.");
  } else {
    alert(
      "Sos bastante joven. Capaz no sepas que Nacha Guevara sacó un disco de heavy metal con tango allá por el '91."
    );
  }
} else {
  alert("Sin tu nombre no podemos proceder. Por favor recargá la página.");
}
