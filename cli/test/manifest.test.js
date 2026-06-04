'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const { buildManifest } = require('../lib/manifest');

// Le manifest est construit en scannant le repo reel (lecture seule).
const racine = path.join(__dirname, '..', '..');

// Construit une fois : index path -> strategy, et la liste brute des paths.
function indexerManifest() {
  const manifest = buildManifest(racine);

  assert.ok(Array.isArray(manifest), 'buildManifest doit retourner un tableau');
  assert.ok(manifest.length > 0, 'le manifest ne doit pas etre vide');

  const parPath = new Map();
  for (const entree of manifest) {
    assert.ok(
      typeof entree.path === 'string' && entree.path.length > 0,
      'chaque entree doit avoir un path non vide'
    );
    assert.ok(
      ['copy', 'merge-markdown', 'merge-json', 'copy-if-absent'].includes(entree.strategy),
      `strategy inattendue pour ${entree.path} : ${entree.strategy}`
    );
    // Tous les separateurs doivent etre POSIX, jamais de backslash Windows.
    assert.ok(
      !entree.path.includes('\\'),
      `le path ${entree.path} doit utiliser des separateurs POSIX (/)`
    );
    parPath.set(entree.path, entree.strategy);
  }

  return { manifest, parPath };
}

test('le manifest inclut les fichiers du kit avec la bonne strategie et sans doublon', () => {
  // Arrange / Act
  const { manifest, parPath } = indexerManifest();

  // Assert : strategie copy pour les guidelines, skills, commands, agents, hooks
  const copies = [
    'skillkit/guidelines/tdd.md',
    'skillkit/guidelines/architecture.md',
    'skillkit/skills/workflow/tdd/SKILL.md',
    'skillkit/skills/delivery/commit/SKILL.md',
    '.claude/commands/tdd.md',
    '.claude/agents/test-writer.md',
    '.claude/hooks/guard-bash.ps1',
  ];
  for (const p of copies) {
    assert.equal(parPath.get(p), 'copy', `${p} doit etre present avec la strategie copy`);
  }

  // Assert : strategie merge-markdown pour les fichiers de contexte racine
  for (const p of ['CLAUDE.md', 'AGENTS.md']) {
    assert.equal(parPath.get(p), 'merge-markdown', `${p} doit etre present avec la strategie merge-markdown`);
  }

  // Assert : strategie merge-json pour les fichiers de configuration
  for (const p of ['.claude/settings.json', '.mcp.json']) {
    assert.equal(parPath.get(p), 'merge-json', `${p} doit etre present avec la strategie merge-json`);
  }

  // Assert : strategie copy-if-absent pour les fichiers a personnaliser par le projet
  for (const p of ['PROJECT.md', 'specs/README.md']) {
    assert.equal(parPath.get(p), 'copy-if-absent', `${p} doit etre present avec la strategie copy-if-absent`);
  }

  // Assert : aucun path en double dans le manifest
  const paths = manifest.map((e) => e.path);
  const uniques = new Set(paths);
  assert.equal(uniques.size, paths.length, 'aucun path ne doit etre present en double dans le manifest');
});

test('le manifest exclut le README racine, .git, .github, cli, skillkit/docs, specs de feature, package.json, settings.local et les reliquats v1', () => {
  // Arrange / Act
  const { manifest } = indexerManifest();
  const paths = manifest.map((e) => e.path);

  // Le README racine est exclu, mais le README des hooks est inclus.
  assert.ok(!paths.includes('README.md'), 'le README racine ne doit pas etre dans le manifest');
  assert.ok(
    paths.includes('.claude/hooks/README.md'),
    'le README des hooks doit rester inclus (ce n\'est pas le README racine)'
  );

  // Prefixes de dossiers et fichiers exclus : aucun path ne doit commencer par ces prefixes.
  const prefixesExclus = [
    '.git/',
    '.github/',
    'cli/',
    'skillkit/docs/',
    'skillkit/skills/shared/',
    'skillkit/skills/core/',
  ];
  for (const prefixe of prefixesExclus) {
    const fautifs = paths.filter((p) => p === prefixe.slice(0, -1) || p.startsWith(prefixe));
    assert.deepEqual(fautifs, [], `aucun path ne doit commencer par ${prefixe} : trouve ${JSON.stringify(fautifs)}`);
  }

  // Fichiers exclus exacts.
  for (const p of ['package.json', '.gitignore', '.claude/settings.local.json']) {
    assert.ok(!paths.includes(p), `${p} ne doit pas etre dans le manifest`);
  }

  // specs/ est exclu sauf specs/README.md : aucun dossier de feature ne doit apparaitre.
  const specsFautifs = paths.filter((p) => p.startsWith('specs/') && p !== 'specs/README.md');
  assert.deepEqual(specsFautifs, [], `seul specs/README.md doit etre inclus depuis specs/ : trouve ${JSON.stringify(specsFautifs)}`);
});
