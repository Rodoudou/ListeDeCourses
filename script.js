const body = document.body;

const elForm = document.querySelector("form");
const inputNewItem = document.querySelector("#nouvel-item");
const btnAjouter = document.querySelector("#ajouter");
const liste = document.querySelector("#liste");
const elementListe = document.querySelector("li");
const btnExporter = document.querySelector("#exporter");
const elTemplateItem = document.querySelector("#template-item");
// const btnSupprimer = document.querySelector('button.bouton.supprimer');
const q = elTemplateItem.content.querySelector(".quantite");
const u = elTemplateItem.content.querySelector(".unite");

const DEFAUT_QUANTITE = Number(q.textContent);
const DEFAUT_UNITE = u.selectedOptions[0].value;
console.log("DEFAUT_QUANTITE", DEFAUT_QUANTITE);
console.log("DEFAUT_UNITE", DEFAUT_UNITE);

inputNewItem.focus();

const elFormSubmit = (e) => {
  e.preventDefault();

  //créer un élément <li></li> à partir du template
  const elListe = elTemplateItem.content.cloneNode(true);

  // Récuperer la valeur de l'input nouvel item
  let nomItem = inputNewItem.value;
  // Supprimer les espaces du début ou de la fin
  nomItem = nomItem.trim();

  // Supprimer les espaces des qu'il ya 2 espaces consécutifs avec une expression regulière
  nomItem = nomItem.replace(/\s{2,}/g, " ");

  const objecItem = extraireDonnees(nomItem);

//console.log(objecItem);

  // injecter cette valeur dans l'element li
  const nomListe = elListe.querySelector(".nom");
  const elQuantite = elListe.querySelector(".quantite");
  const elUnite = elListe.querySelector(".unite");

  nomListe.textContent = objecItem.nom;
  elQuantite.textContent = objecItem.quantite;
  elUnite.value = objecItem.unite;

  //Ajouter l'élément li dans la liste ul
  liste.append(elListe);
  // Effacer le input aprés avoir submit
  inputNewItem.value = "";

  inputNewItem.focus();
};

// insertion intelligente refactoring
function extraireDonnees(nomItem) {
  // es ce que le 1er mot est un num ?
  let mots = nomItem.split(" ");
  let premierMot = mots[0];
  let deuxiemeMot = mots[1];

  const objecItem = {
    nom: nomItem,
    quantite: DEFAUT_QUANTITE,
    unite: DEFAUT_UNITE,
  };

  if (Number.isInteger(Number(premierMot))) {
    // si c'est une quantité il faut l'extraire
    objecItem.quantite = Number(premierMot);

    // Si le 2eme mot est une unité, l'extraire
    const UNITES = ["u.", "kg", "g", "L"];
    if (UNITES.includes(deuxiemeMot)) {
      objecItem.unite = deuxiemeMot;
      objecItem.nom = mots.slice(2).join(" "); // mot[2].concat(" ",mot[3])
    } else {
      // Sinon c'est que nom commence à partir du 2eme mot
      objecItem.nom = mots.slice(1).join(" ");
    }
  }

    // Rendre le item avec une maj a la 1ere lettre
    objecItem.nom = `${objecItem.nom[0].toUpperCase()}${objecItem.nom.slice(1)}`;
  return objecItem;
}
elForm.addEventListener("submit", elFormSubmit);

inputNewItem.addEventListener("input", () => {
  inputNewItem.setCustomValidity("");
  inputNewItem.checkVisibility();
});

inputNewItem.addEventListener("invalid", () => {
  const nom = inputNewItem.value;
  if (nom.length == 0) {
    inputNewItem.setCustomValidity(
      "Vous devez indiquer les informations de l'item, exemple : 250 g chocolat."
    );
    //Ici on vient tester avec cette regex /[A-Za-z]{2}/ si "nom" ne contient pas 2 lettres consécutives
  } else if (!/[A-Za-z]{2}/.test(nom)) {
    inputNewItem.setCustomValidity(
      "Le nom de l'item doit faire au minimum 2 lettres."
    );
  } else {
    inputNewItem.setCustomValidity(
      "Les caractères spéciaux, les accents et autres lettres ne sont pas autorisés."
    );
  }
  //
});

