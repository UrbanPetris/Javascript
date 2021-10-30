let nombre = prompt(
  "Buen día. Vamos a crear tu nombre autómata. Empezemos por saber tu nombre de pila:"
);
let year = prompt("Ahora contanos en qué año naciste:");
let nombre_robot = nombre + "-" + year;
const year_current = new Date();
let years_operative = year_current.getFullYear() - parseInt(year);
alert(
  "Tu nombre robot es " +
    nombre_robot +
    ". Has estado operativo/a por " +
    years_operative +
    " año/s"
);
