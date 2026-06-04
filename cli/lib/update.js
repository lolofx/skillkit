'use strict';

const fs = require('node:fs');
const path = require('node:path');

const { buildManifest, filterByTarget, resolveTarget, lireProjectMd } = require('./manifest');
const { planActions } = require('./planner');
const { executeActions } = require('./executor');
const { lireContenus } = require('./reader');

/**
 * Commande `update` : met a jour uniquement les fichiers du dossier `skillkit/`
 * dans la cible (mode ecrasement). Les fichiers hors `skillkit/` ne sont jamais
 * modifies ; leurs divergences eventuelles sont signalees dans le rapport.
 *
 * @param {string} racineTemplate Chemin absolu de la racine du template.
 * @param {string} racineCible Chemin absolu de la cible.
 * @param {{ dryRun?: boolean, target?: string }} [opts]
 * @returns {Array<{ path: string, strategy: string, status: string }>}
 * @throws {Error} Si `skillkit/` est absent de la cible (init requis d'abord).
 */
function update(racineTemplate, racineCible, { dryRun = false, target } = {}) {
  const skillkitDir = path.join(racineCible, 'skillkit');
  if (!fs.existsSync(skillkitDir) || !fs.statSync(skillkitDir).isDirectory()) {
    throw new Error(
      "skillkit : aucun dossier skillkit/ dans la cible — executer 'skillkit init' d'abord"
    );
  }

  const resolvedTarget = resolveTarget({ flag: target, projectMd: lireProjectMd(racineCible) });

  const manifest = filterByTarget(buildManifest(racineTemplate), resolvedTarget);
  const manifestSkillkit = manifest.filter((e) => e.path.startsWith('skillkit/'));
  const manifestHors = manifest.filter((e) => !e.path.startsWith('skillkit/'));

  const contenusKit = lireContenus(racineTemplate, manifest);

  // skillkit/ : ecrasement des divergences (conflit → mis-a-jour)
  const contenusCibleSkillkit = lireContenus(racineCible, manifestSkillkit);
  const actionsSkillkit = planActions(manifestSkillkit, contenusKit, contenusCibleSkillkit).map(
    (a) => (a.status === 'conflit' ? { ...a, status: 'mis-a-jour' } : a)
  );

  if (!dryRun) {
    const actionsExecute = actionsSkillkit.map((a) =>
      a.status === 'mis-a-jour' ? { ...a, status: 'cree' } : a
    );
    executeActions(actionsExecute, contenusKit, {}, racineCible);
  }

  // Hors skillkit/ : divergences informatives, aucune ecriture
  const contenusCibleHors = lireContenus(racineCible, manifestHors);
  const actionsHors = manifestHors.map(({ path: p, strategy }) => {
    const cible = contenusCibleHors[p];
    const kit = contenusKit[p];
    let status;
    if (cible === undefined) {
      status = 'absent';
    } else if (cible === kit) {
      status = 'a-jour';
    } else {
      status = 'diverge-local';
    }
    return { path: p, strategy, status };
  });

  return [...actionsSkillkit, ...actionsHors];
}

module.exports = { update };
