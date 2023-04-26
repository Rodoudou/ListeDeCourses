const body = document.body;

const elForm = document.querySelector("form");
const inputNewItem = document.querySelector("#nouvel-item");
const btnAjouter = document.querySelector("#ajouter");
const liste = document.querySelector("#liste");
const elementListe = document.querySelector("li");
const btnExporter = document.querySelector("#exporter");
const elTemplateItem = document.querySelector("#template-item");
// const btnSupprimer = document.querySelector('button.bouton.supprimer');
// console.log("btnSupprimer",btnSupprimer);

inputNewItem.focus();

const elFormSubmit = (e) => {
  e.preventDefault();
  console.log("submit");

  //créer un élément <li></li> à partir du template
  const elListe = elTemplateItem.content.cloneNode(true);

  // Récuperer la valeur de l'input nouvel item
  let nomItem = inputNewItem.value;
  // Supprimer les espaces du début ou de la fin
  nomItem = nomItem.trim();

  // Supprimer les espaces des qu'il ya 2 espaces consécutifs avec une expression regulière
  nomItem = nomItem.replace(/\s{2,}/g, " ");
  // Rendre le item avec une maj a la 1ere lettre
  nomItem = `${nomItem[0].toUpperCase()}${nomItem.slice(1)}`;
  console.log("2- nomItem =>", nomItem);

  // injecter cette valeur dans l'element li
  let nomListe = elListe.querySelector(".nom");
  nomListe.textContent = nomItem;
  //Ajouter l'élément li dans la liste ul
  liste.append(elListe);
  // Effacer le input aprés avoir submit
  inputNewItem.value = "";

  inputNewItem.focus();
};
elForm.addEventListener("submit", elFormSubmit);

// btnAjouterOnClick = () => {
//     console.log("kikou");
//     console.log("btnSupprimer",btnSupprimer);
// };
// btnSupprimer.addEventListener("click", btnAjouterOnClick);
