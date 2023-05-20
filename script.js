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

let positionIndicateur;
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

  // Transformer de l'element <p></p> en type <iput type="text"></iput>
  //creer un <input>
  const elInput = document.createElement("input");

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
    const index = indexDeLiDansListe(element);

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

    //Detecter sur quel element on a cliqué ?
    const index = indexDeLiDansListe(elementClick);

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
  console.table(listeItems);
  const positionIndicateur = indexDeLiDansListe(indicateur);

  // Si il y a un indicateur, alors on déplace l'item
  if (positionIndicateur >= 0) {
    // Mettre à jour les données de la liste
    // 1- supprimer l'item en déplacement
    const item = listeItems.splice(positionIntiale, 1)[0];
    // 2- Ajouter l'item en déplacement à la position de l'indicateur
    if (positionIndicateur > positionIntiale) {
      // Si l'indicateur  est après l'item à déplacer, on compense
      // le decalage creer par l'indicateur
      listeItems.splice(positionIndicateur - 1, 0, item);
    } else {
      listeItems.splice(positionIndicateur, 0, item);
    }

    // Sauvegarde des données
    sauvegarder();

    //Animation de déplacement

    // Constante pour les animations
    const CSS_SCALE = "scale(1.05)";
    const CSS_BOX_SHADOW = "0 0 24px rgba(32,32,32,.8)";
    const PHASE_DECOLLAGE = "decollage";
    const PHASE_DEPLACEMENT = "deplacement";
    const PHASE_ATTERRISSAGE = "atterrissage";

    function gestionAnimation(e) {
      if (e.propertyName === "transform") {
        const phase = itemEnDeplacement.dataset.phase;
        // Si je suis dans la phase de décollage alors faire...
        switch (phase) {
          case PHASE_DECOLLAGE:
            itemEnDeplacement.dataset.phase = PHASE_DEPLACEMENT;

            // Récuperer la hauteur de l'item : "hauteurItem"
            const hauteurItem = itemEnDeplacement.offsetHeight;

            // Récuperer sa marge top : "margeTopItem"
            const margeTopItem = Number.parseInt(
              window.getComputedStyle(itemEnDeplacement).marginTop
            );

            // Additionner les 2 => hauteur total : "hauteurTotal"
            let hauteurTotale = hauteurItem + margeTopItem;

            // Combien de items doit-on se déplacer ?
            let nombreItems =
              Math.abs(positionIndicateur - positionIntiale) - 1;

            //On vient compenser le décalage dù à l'indicateur
            const deplacementVersLeHaut = positionIndicateur < positionIntiale;
            if (deplacementVersLeHaut) {
              nombreItems += 1;
              hauteurTotale = -hauteurTotale;
            }

            itemEnDeplacement.style.transform += `translateY(${
              nombreItems * hauteurTotale
            }px)`;

            // Sélectionner les differents items de la liste à
            // déplacer et les faire dans la direction opposée

            let debut = positionIntiale + 1;
            let fin = positionIndicateur;

            if (deplacementVersLeHaut) {
              debut = positionIndicateur;
              fin = positionIntiale;
            }

            for (let i = debut; i < fin; i++) {
              elListe.children[
                i
              ].style.transform = `translateY(${-hauteurTotale}px)`;
            }
            break;
          case PHASE_DEPLACEMENT:
            itemEnDeplacement.dataset.phase = PHASE_ATTERRISSAGE;
            // Si je suis à la fin de la phase de déplacement alors faire...
            //atterissage  etc.

            itemEnDeplacement.style.boxShadow = "";
            let tr = itemEnDeplacement.style.transform;
            // tr  => "scale(1.05) translateY(144px)"
            // => "translateY(144px)"
            tr = tr.replace(CSS_SCALE, "");
            tr = tr.trim();
            itemEnDeplacement.style.transform = tr;
            break;
          case PHASE_ATTERRISSAGE:
            itemEnDeplacement.removeAttribute("data-phase");

            // Supprimer le gestionnaire d'evenements
            itemEnDeplacement.removeEventListener(
              "transitionend",
              gestionAnimation
            );
            // Mettre à jour le DOM
            // Cas particulier : Déplacement à la fin de la liste
            if (positionIndicateur === elListe.children.length) {
              elListe.children[positionIndicateur - 1].after(itemEnDeplacement);
            } else {
              elListe.children[positionIndicateur].before(itemEnDeplacement);
            }

            for (let i = 0; i < elListe.children.length; i++) {
              const enfant = elListe.children[i];
              enfant.removeAttribute("class");

              enfant.style.transition = "none";
              enfant.style.transform = "";

              setTimeout(function () {
                enfant.removeAttribute("style");
              }, 0);
            }
            // Retirer les sytles CSS DDES ITEMS DE LA LISTE

            break;
          default:
            break;
        }
      }
    }

    itemEnDeplacement.addEventListener("transitionend", gestionAnimation);

    itemEnDeplacement.dataset.phase = PHASE_DECOLLAGE;
    itemEnDeplacement.style.position = "relative";
    itemEnDeplacement.style.zIndex = "1";
    itemEnDeplacement.style.transform = CSS_SCALE;
    itemEnDeplacement.style.boxShadow = CSS_BOX_SHADOW;
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
  positionIntiale = indexDeLiDansListe(itemEnDeplacement);
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
  // Recuperer les données de notre liste "ListeItems".
  // -<nom> (<quantite><unite>)%0D%0A
  let corps = "";
  for (let i = 0; i < listeItems.length; i++) {
    const item = listeItems[i];
    const chaine = `- ${item.nom} (${item.quantite} ${item.unite})%0D%0A`;
    corps += chaine;
  }

  // Construire l'URL
  let url = "mailto:amrani.redouane@gmail.com";
  url += "?subject=Liste de courses";
  url += "&body=" + corps;
  window.location = url;
});
