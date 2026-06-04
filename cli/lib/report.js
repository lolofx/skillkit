'use strict';

/**
 * Formate le plan d'actions en rapport texte : une ligne par fichier, statut
 * puis path. Fonction pure, aucune ecriture.
 *
 * @param {Array<{ path: string, status: string }>} actions
 * @returns {string}
 */
function formatReport(actions) {
  return actions.map(({ path, status }) => `${status.padEnd(14)} ${path}`).join('\n');
}

module.exports = { formatReport };
