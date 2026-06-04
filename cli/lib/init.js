'use strict';

const { buildManifest, filterByTarget, resolveTarget, lireProjectMd } = require('./manifest');
const { planActions } = require('./planner');
const { executeActions } = require('./executor');
const { lireContenus } = require('./reader');

/**
 * Commande `init` : installe le kit du template vers la cible. Orchestration
 * pure des briques existantes — manifest, lecture des contenus, planner,
 * executor — et retourne le plan d'actions execute (matiere du rapport).
 *
 * @param {string} racineTemplate Chemin absolu de la racine du template.
 * @param {string} racineCible Chemin absolu de la cible.
 * @param {{ dryRun?: boolean, target?: string }} [opts]
 * @returns {Array<{ path: string, strategy: string, status: string }>}
 */
function init(racineTemplate, racineCible, { dryRun = false, target } = {}) {
  const resolvedTarget = resolveTarget({ flag: target, projectMd: lireProjectMd(racineCible) });

  const manifest = filterByTarget(buildManifest(racineTemplate), resolvedTarget);
  const contenusKit = lireContenus(racineTemplate, manifest);
  const contenusCible = lireContenus(racineCible, manifest);

  const actions = planActions(manifest, contenusKit, contenusCible);
  if (!dryRun) {
    executeActions(actions, contenusKit, contenusCible, racineCible);
  }

  return actions;
}

module.exports = { init };
