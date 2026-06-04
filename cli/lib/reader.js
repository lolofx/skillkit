'use strict';

const fs = require('node:fs');
const path = require('node:path');

/**
 * Lit le contenu des fichiers du manifest sous une racine donnee. Une cle
 * absente du resultat signifie un fichier absent (contrat du planner). Les
 * fins de ligne sont normalisees en LF : une difference CRLF/LF entre kit et
 * cible ne doit jamais produire de conflit.
 *
 * @param {string} racine Chemin absolu sous lequel lire.
 * @param {Array<{ path: string }>} manifest
 * @returns {Record<string, string>}
 */
function lireContenus(racine, manifest) {
  const contenus = {};
  for (const { path: relatif } of manifest) {
    const absolu = path.join(racine, ...relatif.split('/'));
    if (fs.existsSync(absolu)) {
      contenus[relatif] = fs.readFileSync(absolu, 'utf8').replace(/\r\n/g, '\n');
    }
  }
  return contenus;
}

module.exports = { lireContenus };
