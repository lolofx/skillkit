'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const { planActions } = require('../lib/planner');

test('cible absente : le fichier est marque « cree » quelle que soit la strategie', () => {
  // Arrange : un manifest avec des strategies variees, aucune presente dans la cible
  const manifest = [
    { path: 'skillkit/guidelines/tdd.md', strategy: 'copy' },
    { path: 'CLAUDE.md', strategy: 'merge-markdown' },
    { path: 'PROJECT.md', strategy: 'copy-if-absent' },
  ];
  const contenusKit = {
    'skillkit/guidelines/tdd.md': 'regles tdd',
    'CLAUDE.md': 'doc claude',
    'PROJECT.md': 'modele projet',
  };
  const contenusCible = {}; // cible vierge : aucune cle = aucun fichier present

  // Act
  const plan = planActions(manifest, contenusKit, contenusCible);

  // Assert : chaque entree absente de la cible doit etre « cree »
  assert.equal(plan.length, 3, 'le plan doit avoir une entree par entree du manifest');
  for (const action of plan) {
    assert.equal(
      action.status,
      'cree',
      `un fichier absent de la cible (${action.path}) doit etre « cree »`
    );
  }
});

test('cible identique au kit : le fichier est marque « a-jour »', () => {
  // Arrange : la cible contient exactement le meme contenu que le kit
  const manifest = [{ path: 'skillkit/guidelines/tdd.md', strategy: 'copy' }];
  const contenusKit = { 'skillkit/guidelines/tdd.md': 'contenu identique' };
  const contenusCible = { 'skillkit/guidelines/tdd.md': 'contenu identique' };

  // Act
  const plan = planActions(manifest, contenusKit, contenusCible);

  // Assert
  assert.equal(plan.length, 1, 'le plan doit avoir une entree');
  assert.equal(
    plan[0].status,
    'a-jour',
    'un fichier present et identique au kit doit etre « a-jour »'
  );
});

test('cible differente + strategie copy : le fichier est marque « conflit » (jamais d\'ecrasement)', () => {
  // Arrange : un fichier copy present dans la cible mais divergent du kit
  const manifest = [{ path: 'skillkit/guidelines/tdd.md', strategy: 'copy' }];
  const contenusKit = { 'skillkit/guidelines/tdd.md': 'version kit' };
  const contenusCible = { 'skillkit/guidelines/tdd.md': 'version modifiee localement' };

  // Act
  const plan = planActions(manifest, contenusKit, contenusCible);

  // Assert : le planner ne decide jamais d'ecraser un fichier copy divergent
  assert.equal(plan.length, 1, 'le plan doit avoir une entree');
  assert.equal(
    plan[0].status,
    'conflit',
    'un fichier copy present et different doit etre « conflit », pas ecrase'
  );
});

test('cible differente + strategie fusion : le fichier est marque « fusionne »', () => {
  // Arrange : deux fichiers presents et divergents, l'un merge-markdown l'autre merge-json
  const manifest = [
    { path: 'CLAUDE.md', strategy: 'merge-markdown' },
    { path: '.claude/settings.json', strategy: 'merge-json' },
  ];
  const contenusKit = {
    'CLAUDE.md': 'bloc kit',
    '.claude/settings.json': '{"hooks":"kit"}',
  };
  const contenusCible = {
    'CLAUDE.md': 'texte projet existant',
    '.claude/settings.json': '{"hooks":"projet"}',
  };

  // Act
  const plan = planActions(manifest, contenusKit, contenusCible);

  // Assert : une strategie de fusion sur un fichier present divergent doit « fusionne »
  assert.equal(plan.length, 2, 'le plan doit avoir deux entrees');
  assert.equal(
    plan[0].status,
    'fusionne',
    'un fichier merge-markdown present et different doit etre « fusionne »'
  );
  assert.equal(
    plan[1].status,
    'fusionne',
    'un fichier merge-json present et different doit etre « fusionne »'
  );
});

test('cible presente + strategie copy-if-absent : « ignore » prime, jamais « conflit » meme si le contenu differe', () => {
  // Arrange : un PROJECT.md deja rempli par le projet, divergent du modele du kit
  const manifest = [{ path: 'PROJECT.md', strategy: 'copy-if-absent' }];
  const contenusKit = { 'PROJECT.md': 'modele vierge du kit' };
  const contenusCible = { 'PROJECT.md': 'projet deja rempli par l\'equipe' };

  // Act
  const plan = planActions(manifest, contenusKit, contenusCible);

  // Assert : copy-if-absent sur un fichier present = « ignore », et surtout jamais « conflit »
  assert.equal(plan.length, 1, 'le plan doit avoir une entree');
  assert.equal(
    plan[0].status,
    'ignore',
    'un fichier copy-if-absent present doit etre « ignore » meme si son contenu differe'
  );
  assert.notEqual(
    plan[0].status,
    'conflit',
    '« ignore » prime : un copy-if-absent present ne doit jamais etre « conflit »'
  );

  // Assert : path et strategy sont recopies fidelement du manifest
  assert.equal(plan[0].path, 'PROJECT.md', 'le path du manifest doit etre recopie');
  assert.equal(
    plan[0].strategy,
    'copy-if-absent',
    'la strategy du manifest doit etre recopiee'
  );
});

test('entree du manifest absente des contenus kit : throw avec le path fautif (invariant manifest <-> contenus, fail-fast)', () => {
  // Arrange : un manifest qui reference un path absent de contenusKit
  const manifest = [{ path: 'absent.md', strategy: 'copy' }];
  const contenusKit = {}; // le path du manifest n'a aucun contenu kit
  const contenusCible = {};

  // Act + Assert : l'invariant manifest <-> contenus est viole, fail-fast avec le path fautif
  assert.throws(
    () => planActions(manifest, contenusKit, contenusCible),
    /absent\.md/,
    'un path du manifest absent des contenus kit doit faire throw en mentionnant le path'
  );
});
