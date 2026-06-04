'use strict';

/**
 * Strategies de fusion : une cible presente et divergente est fusionnee plutot
 * que mise en conflit.
 */
const STRATEGIES_FUSION = new Set(['merge-markdown', 'merge-json']);

/**
 * Decide, pour chaque entree du manifest, l'action a mener compte tenu de l'etat
 * de la cible. Fonction pure : aucun acces disque, aucune fusion reelle. Le
 * planner ne fait que decider un statut ; l'ecriture et la fusion sont du ressort
 * de l'executor.
 *
 * Les contenus de la cible sont fournis sous forme de map `path -> contenu` ;
 * une cle absente signifie un fichier absent. En revanche, tout path du manifest
 * doit posseder un contenu kit correspondant : un manifest referencant un path
 * absent de `contenusKit` viole l'invariant manifest <-> contenus et provoque un
 * fail-fast (throw), avant tout calcul de statut.
 *
 * Statuts retournes :
 * - `cree`     : la cible n'a pas le fichier ;
 * - `ignore`   : strategie `copy-if-absent` et cible presente (prime sur tout) ;
 * - `a-jour`   : cible presente et identique au kit ;
 * - `conflit`  : cible presente, divergente, strategie `copy` ;
 * - `fusionne` : cible presente, divergente, strategie de fusion.
 *
 * @param {Array<{ path: string, strategy: string }>} manifest
 * @param {Record<string, string>} contenusKit Map path -> contenu du kit.
 * @param {Record<string, string>} contenusCible Map path -> contenu de la cible.
 * @returns {Array<{ path: string, strategy: string, status: string }>}
 *   Une entree par entree du manifest, dans le meme ordre.
 * @throws {Error} Si une entree du manifest n'a aucun contenu kit correspondant
 *   (invariant manifest <-> contenus viole) ; le message mentionne le path fautif.
 */
function planActions(manifest, contenusKit, contenusCible) {
  for (const { path } of manifest) {
    if (!(path in contenusKit)) {
      throw new Error(
        `skillkit : entree de manifest sans contenu kit correspondant — ${path}`
      );
    }
  }

  return manifest.map(({ path, strategy }) => ({
    path,
    strategy,
    status: deciderStatut(strategy, contenusKit[path], contenusCible[path]),
  }));
}

/**
 * Determine le statut d'un fichier a partir de sa strategie et des deux contenus.
 *
 * @param {string} strategy
 * @param {string|undefined} contenuKit
 * @param {string|undefined} contenuCible `undefined` = fichier absent de la cible.
 * @returns {string}
 */
function deciderStatut(strategy, contenuKit, contenuCible) {
  const absente = contenuCible === undefined;
  if (absente) {
    return 'cree';
  }

  // `copy-if-absent` : une cible presente prime, quel que soit son contenu.
  if (strategy === 'copy-if-absent') {
    return 'ignore';
  }

  if (contenuCible === contenuKit) {
    return 'a-jour';
  }

  // Cible presente et divergente : fusion si la strategie le permet, sinon conflit.
  return STRATEGIES_FUSION.has(strategy) ? 'fusionne' : 'conflit';
}

module.exports = { planActions };
