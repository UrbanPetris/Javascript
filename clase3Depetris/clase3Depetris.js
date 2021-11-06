var opcion = prompt(
  "Bienvenido. Por favor, introduzca un texto o escriba 'ESC' para salir del programa"
); //utilizo var en vez de let porque quiero que "opcion" sea global y accesible en los loops del for. Abajo comentado pongo otra alternativa.

while (opcion !== "ESC") {
  if (opcion) {
    alert(
      `Tu texto tiene ${opcion.length} caracter/es así que te saludaré esa cantidad de veces`
    );
    for (let i = 1; i <= opcion.length; i++) {
      alert("Hola");
    }
    opcion = prompt(
      "¿Bastante molesto, no? Escriba otro texto o escriba 'ESC' para parar de sufrir"
    );
  } else {
    opcion = prompt(
      "No ha introducido nada. Por favor, elija un texto o escriba 'ESC' para salir"
    );
  }
}

// let opcion = prompt(
//   "Bienvenido. Por favor, introduzca un texto o escriba 'ESC' para salir"
// );

// while (opcion !== "ESC") {
//   if (opcion) {
//     let veces = opcion.length;
//     alert(
//       `Tu texto tiene ${veces} caracter/es así que te saludaré esa cantidad de veces`
//     );
//     for (let i = 1; i <= veces; i++) {
//       alert("Hola");
//     }
//     opcion = prompt(
//       "¿Bastante molesto, no? Escriba otro texto o escriba 'ESC' para parar de sufrir"
//     );
//   } else {
//     opcion = prompt(
//       "No ha introducido nada. Por favor, elija un texto o escriba 'ESC' para salir"
//     );
//   }
// }
