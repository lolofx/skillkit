'use strict';

const fs = require('node:fs');
const path = require('node:path');

const { mergeMarkdown } = require('./merge-markdown');
const { mergeJson } = require('./merge-json');

/**
 * Applique sur le disque les actions decidees par le planner. L'executor ne
 * decide rien : il execute les statuts tels quels.
 *
 * - `cree`     : ecrit le contenu kit dans la cible (dossiers crees au besoin) ;
 * - `fusionne` : fusionne le contenu kit dans le contenu cible selon la
 *   strategie (merge-markdown ou merge-json) et ecrit le resultat ;
 * - tout autre statut : aucune ecriture (a-jour, ignore, conflit ne touchent
 *   jamais la cible).
 *
 * @param {Array<{ path: string, strategy: string, status: string }>} actions
 * @param {Record<string, string>} contenusKit Map path -> contenu du kit.
 * @param {Record<string, string>} contenusCible Map path -> contenu de la cible.
 * @param {string} racineCible Chemin absolu de la cible.
 */
function executeActions(actions, contenusKit, contenusCible, racineCible) {
  for (const action of actions) {
    if (action.status === 'cree') {
      ecrire(racineCible, action.path, contenusKit[action.path]);
    } else if (action.status === 'fusionne') {
      const fusion = fusionner(action.strategy, contenusCible[action.path], contenusKit[action.path]);
      if (fusion !== null) {
        ecrire(racineCible, action.path, fusion);
      }
    }
  }
}

/**
 * Fusionne un contenu cible avec le contenu kit selon la strategie. Retourne
 * `null` si la fusion est impossible (JSON cible invalide) : la cible n'est
 * alors jamais ecrasee.
 *
 * @param {string} strategy `merge-markdown` ou `merge-json`.
 * @param {string} contenuCible
 * @param {string} contenuKit
 * @returns {string|null}
 */
function fusionner(strategy, contenuCible, contenuKit) {
  if (strategy === 'merge-markdown') {
    return mergeMarkdown(contenuCible, contenuKit);
  }
  const resultat = mergeJson(contenuCible, contenuKit);
  return resultat.status === 'merged' ? resultat.content : null;
}

/**
 * Ecrit un contenu dans la cible (dossiers crees au besoin) a partir d'un
 * chemin relatif POSIX.
 *
 * @param {string} racineCible Chemin absolu de la cible.
 * @param {string} relatif Chemin relatif POSIX.
 * @param {string} contenu
 */
function ecrire(racineCible, relatif, contenu) {
  const absolu = path.join(racineCible, ...relatif.split('/'));
  fs.mkdirSync(path.dirname(absolu), { recursive: true });
  fs.writeFileSync(absolu, contenu, 'utf8');
}

module.exports = { executeActions };
