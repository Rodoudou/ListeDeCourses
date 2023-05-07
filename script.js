const body = document.body;

const elForm = document.querySelector("form");
const inputNewItem = document.querySelector("#nouvel-item");
const btnAjouter = document.querySelector("#ajouter");
const elListe = document.querySelector("#liste");
const elementListe = document.querySelector("li");
const btnExporter = document.querySelector("#exporter");
const elTemplateItem = document.querySelector("#template-item");
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

// Création d'un unique indicateur
const indicateur = document.createElement("li");
indicateur.classList.add("indicateur");
indicateur.addEventListener("dragover", function (e) {
  e.preventDefault();
});
indicateur.addEventListener("drop", drop);
let itemEnDeplacement;

function sauvegarder() {
  localStorage.setItem(CLE_LOCAL_STORAGE, JSON.stringify(listeItems));
}

function indexDeLiDansListe(element) {
  const li = element.closest("li");
  const enfants = Array.from(elListe.children);
  return enfants.indexOf(li);
}

function remplacerParagrapheParInput(e) {
  const elP = e.target;
  console.log("elP", elP);
  // Transformer de l'element <p></p> en type <iput type="text"></iput>
  //creer un <input>
  const elInput = document.createElement("input");
  console.log("elInput", elInput);
  //Si on a cliqué sur le nomm ... on fait un type="text"
  if (elP.classList.contains("nom")) {
    elInput.type = "text";
  } else {
    // Sinon on fait type="number" et ajouter les attributs min max
    elInput.type = "number";
    elInput.min = "1";
    elInput.max = "999";
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
    // stocker les données dans localStorage

    // Détecter ce qu'on à modifier, le nom ou la quantité ?

    const element = e.target;

    // On cherche l'element li parent
    const index = inexDeLiDansListe(element);

    element.classList.contains("nom")
      ? (listeItems[index].nom = element.value)
      : (listeItems[index].quantite = Number(element.value));

    // Mettre à jour la proprièté adéquate dans listeItems
    // Sauvegarder la liste
    sauvegarder();

    elP.textContent = elInput.value;
    elInput.replaceWith(elP);
  };

  elInput.addEventListener("blur", gestionBlur);

  // Si on appuie sur ENTREE, il faut également remplacer par <p>
  elInput.addEventListener("keydown", function (e) {
    elP.textContent = elInput.value;

    if (e.key == "Enter") {
      elInput.removeEventListener("blur", gestionBlur);
      gestionBlur(e);
    }
  });
}

function creatElementLI(objecItem) {
  //créer un fragment de document à partir du template
  const fragmentDoc = elTemplateItem.content.cloneNode(true);
  // injecter cette valeur dans l'element li
  // selectionner element<p></p>
  const elLi = fragmentDoc.querySelector("li");
  const elNom = fragmentDoc.querySelector(".nom");
  const elQuantite = fragmentDoc.querySelector(".quantite");
  const elUnite = fragmentDoc.querySelector(".unite");
  const btnSupprimer = fragmentDoc.querySelector("button.bouton.supprimer");
  const elPognee = fragmentDoc.querySelector(".poignee");

  btnSupprimer.addEventListener("click", function (e) {
    const elementClick = e.currentTarget;
    console.log("supprimer !");
    //Detecter sur quel element on a cliqué ?
    const index = indexDeLiDansListe(elementClick);
    console.log(index);
    // Supprimer cet élément de la listeItems
    listeItems.splice(index, 1);
    // sauvegatrder dans localStorage
    sauvegarder();

    //Supprimer l'item li de la liste ul avec une animation
    const li = elListe.children[index];
    // On ajoute le gestionnaire d'evenement
    li.addEventListener("transitionend", function (e) {
      if (e.propertyName === "height") {
        li.remove();
      }
    });

    // On ajoute la classe qui va générer l'animation
    li.classList.add("suppression");
  });

  elNom.addEventListener("focus", remplacerParagrapheParInput);
  elQuantite.addEventListener("focus", remplacerParagrapheParInput);
  elUnite.addEventListener("change", function (e) {
    const index = inexDeLiDansListe(elUnite);
    listeItems[index].unite = elUnite.value;
    sauvegarder();
  });

  elNom.textContent = objecItem.nom;
  elQuantite.textContent = objecItem.quantite;
  elUnite.value = objecItem.unite;

  elPognee.addEventListener("mousedown", demarrerDeplacement);
  elPognee.addEventListener("mouseup", function (e) {
    elLi.removeAttribute("draggable");
  });
  elLi.addEventListener("dragstart", dragStart);
  elLi.addEventListener("dragend", dragEnd);

  // Affichage de l'indicateur
  elLi.addEventListener("dragover", dragOver);

  // Gestion du relachement du bouton de la souris
  elLi.addEventListener("drop", drop);

  return fragmentDoc;
}

function drop(e) {
  console.log("drop");

  // Si il y a un indicateur, alors on déplace l'item
  const positionIndicateur = indexDeLiDansListe(indicateur);
  if (positionIndicateur >= 0) {
    indicateur.replaceWith(itemEnDeplacement);
  }
}

function dragOver(e) {
  // Permettre à l'élément d'être une cible de dépot
  e.preventDefault();

  const li = e.currentTarget;

  const milieu = li.offsetHeight / 2; // 56px => 28px
  const positionCurseur = e.offsetY;

  // Si l'item qui est survolé est l'item en déplacement
  // Ou si on survole la partie inférieure de l'item précédent
  // Ou si on survole la partie superieur de l'item suivant
  // Alors il faut supprimé l'indicateur

  if (
    li === itemEnDeplacement ||
    (li === itemEnDeplacement.previousElementSibling &&
      positionCurseur > milieu) ||
    (li === itemEnDeplacement.nextElementSibling && positionCurseur <= milieu)
  ) {
    indicateur.remove();
  } else {
    // Sinon il faut afficher l'indicateur
    if (positionCurseur <= milieu) {
      // Au-dessus
      if (li.previousElementSibling !== indicateur) {
        // On ajoute l'indicateur au dessus de l'item
        li.before(indicateur);
      }
    } else {
      // En dessous
      if (li.nextElementSibling !== indicateur) {
        // On ajoute l'indicateur en dessous de l'item
        li.after(indicateur);
      }
    }
  }
}

function demarrerDeplacement(e) {
  const poignee = e.currentTarget;
  const elParentLi = poignee.closest("li");
  elParentLi.setAttribute("draggable", "true");
}

function dragStart(e) {
  const li = e.currentTarget;
  li.classList.add("drag-start");
  itemEnDeplacement = li;
  elListe.classList.add("drag-en-cours");
}

function dragEnd(e) {
  const li = e.currentTarget;
  li.removeAttribute("draggable");
  li.classList.remove("drag-start");
  elListe.classList.remove("drag-en-cours");

  const positionIndicateur = indexDeLiDansListe(indicateur);
  if (positionIndicateur >= 0) {
    indicateur.remove();
  }
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
  sauvegarder();

  const fragmentDoc = creatElementLI(objecItem);

  //Ajouter l'élément li dans la liste ul
  liste.append(fragmentDoc);
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
});

btnExporter.addEventListener("click", function (e) {
  console.log("exporter");
  console.log("listeItems", listeItems);
  // Recuperer les données de notre liste "ListeItems".
  // -<nom> (<quantite><unite>)%0D%0A
  let corps = "";
  for (let i = 0; i < listeItems.length; i++) {
    const item = listeItems[i];
    const chaine = `- ${item.nom} (${item.quantite} ${item.unite})%0D%0A`;
    corps += chaine;
  }
  console.log(corps);

  // Construire l'URL
  let url = "mailto:amrani.redouane@gmail.com";
  url += "?subject=Liste de courses";
  url += "&body=" + corps;
  console.log("URL =>", url);
  window.location = url;
});
