'use strict';

const START = '<!-- skillkit:start -->';
const END = '<!-- skillkit:end -->';

/**
 * Fusionne le contenu du kit dans un contenu Markdown existant, entre des
 * marqueurs dedies. Fonction pure : pas d'effet de bord, pas d'acces disque.
 *
 * - Sans marqueurs : le contenu existant est preserve, le bloc kit est ajoute
 *   a la suite entre les marqueurs.
 * - Avec marqueurs : seul l'interieur du bloc est remplace ; ce qui precede et
 *   ce qui suit le bloc reste identique.
 *
 * L'operation est idempotente : refusionner le meme kit ne change rien.
 *
 * @param {string} existingContent
 * @param {string} kitContent
 * @returns {string}
 */
function mergeMarkdown(existingContent, kitContent) {
  const block = `${START}\n${kitContent}\n${END}`;

  const startIndex = existingContent.indexOf(START);
  const endIndex = existingContent.indexOf(END);

  if (startIndex === -1 || endIndex === -1) {
    return `${existingContent}\n\n${block}`;
  }

  const before = existingContent.slice(0, startIndex);
  const after = existingContent.slice(endIndex + END.length);

  return `${before}${block}${after}`;
}

module.exports = { mergeMarkdown };
