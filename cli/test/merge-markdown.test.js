'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const { mergeMarkdown } = require('../lib/merge-markdown');

const START = '<!-- skillkit:start -->';
const END = '<!-- skillkit:end -->';

test('contenu existant sans marqueurs : le contenu est preserve et le bloc kit est ajoute entre les marqueurs', () => {
  // Arrange
  const existant = '# Mon projet\n\nDescription locale du projet.';
  const kit = 'Contenu du kit skillkit.';

  // Act
  const resultat = mergeMarkdown(existant, kit);

  // Assert : contenu existant, marqueur start, contenu kit, marqueur end dans cet ordre
  const idxExistant = resultat.indexOf(existant);
  const idxStart = resultat.indexOf(START);
  const idxKit = resultat.indexOf(kit, idxStart);
  const idxEnd = resultat.indexOf(END);

  assert.notEqual(idxExistant, -1, 'le contenu existant doit etre present');
  assert.notEqual(idxStart, -1, 'le marqueur start doit etre present');
  assert.notEqual(idxKit, -1, 'le contenu kit doit etre present');
  assert.notEqual(idxEnd, -1, 'le marqueur end doit etre present');

  assert.ok(idxExistant < idxStart, 'le contenu existant doit preceder le marqueur start');
  assert.ok(idxStart < idxKit, 'le marqueur start doit preceder le contenu kit');
  assert.ok(idxKit < idxEnd, 'le contenu kit doit preceder le marqueur end');
});

test('marqueurs deja presents : seul l\'interieur du bloc est remplace, avant et apres preserves a l\'identique', () => {
  // Arrange
  const avant = '# Mon projet\n\nTexte projet avant le bloc.\n';
  const apres = '\n## Section locale\n\nTexte projet apres le bloc.';
  const existant = `${avant}${START}\nAncien contenu kit.\n${END}${apres}`;
  const nouveauKit = 'Nouveau contenu kit.';

  // Act
  const resultat = mergeMarkdown(existant, nouveauKit);

  // Assert
  assert.ok(resultat.startsWith(avant), 'le texte avant le bloc doit etre preserve a l\'identique');
  assert.ok(resultat.endsWith(apres), 'le texte apres le bloc doit etre preserve a l\'identique');
  assert.ok(resultat.includes(nouveauKit), 'le nouveau contenu kit doit etre present');
  assert.ok(!resultat.includes('Ancien contenu kit.'), 'l\'ancien contenu kit doit avoir disparu');

  // Toujours un seul bloc marque
  assert.equal(resultat.split(START).length - 1, 1, 'un seul marqueur start');
  assert.equal(resultat.split(END).length - 1, 1, 'un seul marqueur end');
});

test('idempotence : fusionner deux fois avec le meme kit donne le meme resultat', () => {
  // Arrange
  const existant = '# Mon projet\n\nDescription locale.';
  const kit = 'Contenu du kit skillkit.';

  // Act
  const uneFois = mergeMarkdown(existant, kit);
  const deuxFois = mergeMarkdown(uneFois, kit);

  // Assert
  assert.equal(deuxFois, uneFois, 'une seconde fusion ne doit rien changer');
});

test('idempotence du re-remplacement : un contenu deja marque fusionne deux fois donne le meme resultat (scenario double init)', () => {
  // Arrange : un contenu qui possede DEJA des marqueurs -> passe par la branche remplacement
  const avant = '# Mon projet\n\nTexte projet avant le bloc.\n';
  const apres = '\n## Section locale\n\nTexte projet apres le bloc.';
  const dejaMarque = `${avant}${START}\nAncien contenu kit.\n${END}${apres}`;
  const kit = 'Nouveau contenu kit.';

  // Act : premiere fusion (remplacement), puis seconde fusion du resultat avec le meme kit
  const uneFois = mergeMarkdown(dejaMarque, kit);
  const deuxFois = mergeMarkdown(uneFois, kit);

  // Assert : merge(merge(x, kit), kit) === merge(x, kit)
  assert.equal(deuxFois, uneFois, 'un second remplacement avec le meme kit ne doit rien changer');
});
