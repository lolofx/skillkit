'use strict';

/**
 * Fusionne deux contenus JSON de maniere additive. Fonction pure : pas d'effet
 * de bord, pas d'acces disque, aucune dependance npm.
 *
 * - Les entrees du projet sont preservees, les entrees du kit sont ajoutees.
 * - Tableaux : union sans doublon (egalite structurelle, objets compris).
 * - Objets : fusion recursive par cle, la valeur projet est preservee.
 *
 * L'operation est idempotente : refusionner le meme kit produit une chaine
 * strictement identique (serialisation deterministe).
 *
 * Distinction des deux cas d'echec de parsing :
 * - cible (projet) invalide : retour `{ status: 'conflict' }`, le contenu projet
 *   n'est jamais ecrase ;
 * - kit invalide : donnee de packaging corrompue, donc invariant viole — throw
 *   explicite plutot que conflit silencieux.
 *
 * @param {string} existant Contenu JSON brut du projet.
 * @param {string} kit Contenu JSON brut du kit.
 * @returns {{ status: string, content?: string }}
 * @throws {Error} Si le contenu JSON du kit n'est pas parsable (bug de packaging).
 */
function mergeJson(existant, kit) {
  let cible;
  try {
    cible = JSON.parse(existant);
  } catch (erreur) {
    return { status: 'conflict' };
  }

  let source;
  try {
    source = JSON.parse(kit);
  } catch (erreur) {
    throw new Error(
      `skillkit : contenu JSON du kit invalide — ${erreur.message}`
    );
  }

  const fusion = fusionner(cible, source);

  return { status: 'merged', content: serialiser(fusion) };
}

/**
 * Fusionne recursivement la source du kit dans la cible du projet.
 *
 * @param {*} cible
 * @param {*} source
 * @returns {*}
 */
function fusionner(cible, source) {
  if (Array.isArray(cible) && Array.isArray(source)) {
    return unionSansDoublon(cible, source);
  }

  if (estObjet(cible) && estObjet(source)) {
    const resultat = {};
    for (const cle of Object.keys(cible)) {
      resultat[cle] = cible[cle];
    }
    for (const cle of Object.keys(source)) {
      resultat[cle] =
        cle in cible ? fusionner(cible[cle], source[cle]) : source[cle];
    }
    return resultat;
  }

  // Valeur scalaire ou types divergents : la valeur projet est preservee.
  return cible;
}

/**
 * Concatene deux tableaux en ecartant les elements deja presents (egalite
 * structurelle, donc valable aussi pour les objets).
 *
 * @param {Array} cible
 * @param {Array} source
 * @returns {Array}
 */
function unionSansDoublon(cible, source) {
  const resultat = [...cible];
  const empreintes = new Set(cible.map((element) => serialiser(element)));

  for (const element of source) {
    const cle = serialiser(element);
    if (!empreintes.has(cle)) {
      resultat.push(element);
      empreintes.add(cle);
    }
  }

  return resultat;
}

/**
 * Indique si la valeur est un objet simple (non nul, non tableau).
 *
 * @param {*} valeur
 * @returns {boolean}
 */
function estObjet(valeur) {
  return typeof valeur === 'object' && valeur !== null && !Array.isArray(valeur);
}

/**
 * Serialise une valeur en JSON de maniere deterministe : les cles des objets
 * sont triees, ce qui garantit l'idempotence de la fusion et sert d'empreinte
 * structurelle pour le dedoublonnage des tableaux.
 *
 * @param {*} valeur
 * @returns {string}
 */
function serialiser(valeur) {
  return JSON.stringify(normaliser(valeur));
}

/**
 * Reconstruit recursivement une valeur en ordonnant les cles des objets.
 *
 * @param {*} valeur
 * @returns {*}
 */
function normaliser(valeur) {
  if (Array.isArray(valeur)) {
    return valeur.map((element) => normaliser(element));
  }

  if (estObjet(valeur)) {
    const ordonne = {};
    for (const cle of Object.keys(valeur).sort()) {
      ordonne[cle] = normaliser(valeur[cle]);
    }
    return ordonne;
  }

  return valeur;
}

module.exports = { mergeJson };
