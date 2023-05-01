const body = document.body;

const elForm = document.querySelector("form");
const inputNewItem = document.querySelector("#nouvel-item");
const btnAjouter = document.querySelector("#ajouter");
const elListe = document.querySelector("#liste");
const elementListe = document.querySelector("li");
const btnExporter = document.querySelector("#exporter");
const elTemplateItem = document.querySelector("#template-item");
// const btnSupprimer = document.querySelector('button.bouton.supprimer');
const q = elTemplateItem.content.querySelector(".quantite");
const u = elTemplateItem.content.querySelector(".unite");

const DEFAUT_QUANTITE = Number(q.textContent);
const DEFAUT_UNITE = u.selectedOptions[0].value;

const UNITES = [];
for (let i = 0; i < u.options.length; i++) {
  UNITES.push(u.options[i].value);
}

let listeItems = [];
// Chargement des donnees depuis  localStorage
const CLE_LOCAL_STORAGE = "liste";

const donnees = localStorage.getItem(CLE_LOCAL_STORAGE);
if (donnees !== null) {
  // on charge les données
  listeItems = JSON.parse(donnees);
  // Parcourir listeItems
  for (let i = 0; i < listeItems.length; i++) {
    //créer un élément <li></li> à partir du template
    const elLi = creatElementLI(listeItems[i]);
    // On ajoute l'element à la liste <ul></ul>
    elListe.append(elLi);
  }
}


function remplacerParagrapheParInput(e){
const elP = e.target;
console.log("elP",elP);
    // Transformer de l'element <p></p> en type <iput type="text"></iput>
    //creer un <input>
    const elInput = document.createElement("input");
    console.log("elInput",elInput);
    //Si on a cliqué sur le nomm ... on fait un type="text"
    if( elP.classList.contains("nom")){
      elInput.type = "text";
    }else{
      // Sinon on fait type="number" et ajouter les attributs min max
      elInput.type = "number";
      elInput.min = "1";
      elInput.max = "999";
      console.log("icii le elInput",elInput);

    }
    
    elInput.className = elP.className;

    // Injecter le nom provenant de <p ></p> dans <inpu></inpu>
    const nom = elP.textContent;
    elInput.value = nom; // on peut faire aussi input.setAttribute("value",nom):

    // Remplacer l'element <p></p> par <input>
    elP.replaceWith(elInput);

    elInput.focus();

    // Lorsqu'on quitte l'input, il faut remettre <p></p> mis à jour
    const gestionBlur = (e) => {
      elP.textContent = elInput.value;
      elInput.replaceWith(elP);
    };

    elInput.addEventListener("blur", gestionBlur);

    // Si on appuie sur ENTREE, il faut également remplacer par <p>
    elInput.addEventListener("keydown", function (e) {
      elP.textContent = elInput.value;

      if (e.key == "Enter") {
        elInput.removeEventListener("blur", gestionBlur);
        gestionBlur();
      }
    });
  
}

function creatElementLI(objecItem) {
  //créer un élément <li></li> à partir du template
  const elLi = elTemplateItem.content.cloneNode(true);
  // injecter cette valeur dans l'element li
  // selectionner element<p></p>
  const elNom = elLi.querySelector(".nom");
  const elQuantite = elLi.querySelector(".quantite");
  const elUnite = elLi.querySelector(".unite");

elNom.addEventListener("focus", remplacerParagrapheParInput);
elQuantite.addEventListener('focus', remplacerParagrapheParInput);


  elNom.textContent = objecItem.nom;
  elQuantite.textContent = objecItem.quantite;
  elUnite.value = objecItem.unite;

  return elLi;
}

const elFormSubmit = (e) => {
  // emepcher le chargement de la page
  e.preventDefault();

  // Récuperer la valeur de l'input nouvel item
  let nomItem = inputNewItem.value;

  // Supprimer les espaces du début ou de la fin
  nomItem = nomItem.trim();

  // Supprimer les espaces des qu'il ya 2 espaces consécutifs avec une expression regulière
  nomItem = nomItem.replace(/\s{2,}/g, " ");

  const objecItem = extraireDonnees(nomItem);

  //console.log(objecItem);

  //############################### stockage données################@
  //Sauvegarder les donnes dans le storage
  listeItems.push(objecItem);
  localStorage.setItem(CLE_LOCAL_STORAGE, JSON.stringify(listeItems));

  const elLi = creatElementLI(objecItem);

  //Ajouter l'élément li dans la liste ul
  liste.append(elLi);
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
