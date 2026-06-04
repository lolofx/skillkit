'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const { init } = require('../lib/init');

const racineTemplate = path.join(__dirname, '..', '..');
const entreePointCli = path.join(__dirname, '..', 'bin', 'skillkit.js');

function dansCibleTemporaire(callback) {
  const cible = fs.mkdtempSync(path.join(os.tmpdir(), 'skillkit-cli-'));
  try {
    callback(cible);
  } finally {
    fs.rmSync(cible, { recursive: true, force: true });
  }
}

function runCli(...args) {
  return spawnSync(process.execPath, [entreePointCli, ...args], { encoding: 'utf8' });
}

function snapshotDir(dir) {
  const snapshot = {};
  function parcourir(d) {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const abs = path.join(d, entry.name);
      const rel = path.relative(dir, abs);
      if (entry.isDirectory()) {
        parcourir(abs);
      } else {
        snapshot[rel] = fs.readFileSync(abs);
      }
    }
  }
  parcourir(dir);
  return snapshot;
}

test('init --dry-run : rapport affiche, cible binairement inchangee', () => {
  dansCibleTemporaire((cible) => {
    const snapshotAvant = snapshotDir(cible);

    const result = runCli('init', cible, '--dry-run');

    assert.equal(
      result.status,
      0,
      `exit code inattendu: ${result.status}\nstderr: ${result.stderr}`
    );
    assert.ok(result.stdout.trim().length > 0, 'le rapport doit etre affiche en stdout');

    const snapshotApres = snapshotDir(cible);
    assert.deepEqual(snapshotApres, snapshotAvant, 'la cible ne doit pas avoir ete modifiee');
  });
});

test('update --dry-run : rapport affiche, cible binairement inchangee', () => {
  dansCibleTemporaire((cible) => {
    init(racineTemplate, cible);
    const snapshotAvant = snapshotDir(cible);

    const result = runCli('update', cible, '--dry-run');

    assert.equal(
      result.status,
      0,
      `exit code inattendu: ${result.status}\nstderr: ${result.stderr}`
    );
    assert.ok(result.stdout.trim().length > 0, 'le rapport doit etre affiche en stdout');

    const snapshotApres = snapshotDir(cible);
    assert.deepEqual(snapshotApres, snapshotAvant, 'la cible ne doit pas avoir ete modifiee');
  });
});

test('cible non inscriptible : exit different de 0 et message affiche', () => {
  // process.execPath est un fichier (pas un dossier) : toute tentative
  // de creer des sous-dossiers dedans echoue avec ENOTDIR/EEXIST
  const result = runCli('init', process.execPath);

  assert.notEqual(result.status, 0, 'le code de sortie doit etre different de 0');
  const sortie = result.stdout + result.stderr;
  assert.ok(sortie.trim().length > 0, 'un message doit etre affiche');
});

test('commande inconnue : usage affiche, exit different de 0', () => {
  const result = runCli('inconnue');

  assert.notEqual(result.status, 0);
  const sortie = result.stdout + result.stderr;
  assert.ok(
    sortie.toLowerCase().includes('usage') || sortie.includes('skillkit'),
    `sortie doit mentionner usage ou skillkit : ${sortie}`
  );
});

test('aucun argument : usage affiche, exit different de 0', () => {
  const result = runCli();

  assert.notEqual(result.status, 0);
  const sortie = result.stdout + result.stderr;
  assert.ok(
    sortie.toLowerCase().includes('usage') || sortie.includes('skillkit'),
    `sortie doit mentionner usage ou skillkit : ${sortie}`
  );
});
