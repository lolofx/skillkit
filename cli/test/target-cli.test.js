'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const { init } = require('../lib/init');
const { update } = require('../lib/update');

const racineTemplate = path.join(__dirname, '..', '..');
const entreePointCli = path.join(__dirname, '..', 'bin', 'skillkit.js');

function dansCibleTemporaire(callback) {
  const cible = fs.mkdtempSync(path.join(os.tmpdir(), 'skillkit-target-'));
  try {
    callback(cible);
  } finally {
    fs.rmSync(cible, { recursive: true, force: true });
  }
}

function runCli(...args) {
  return spawnSync(process.execPath, [entreePointCli, ...args], { encoding: 'utf8' });
}

// ─── init --target ────────────────────────────────────────────────────────────

test('init { target: frontend } : shared present, backend (dotnet.md) absent', () => {
  dansCibleTemporaire((cible) => {
    init(racineTemplate, cible, { target: 'frontend' });

    assert.ok(
      fs.existsSync(path.join(cible, 'AGENTS.md')),
      'AGENTS.md (shared) doit etre cree'
    );
    assert.ok(
      !fs.existsSync(path.join(cible, 'skillkit', 'guidelines', 'dotnet.md')),
      'dotnet.md (backend) ne doit pas etre cree avec target:frontend'
    );
  });
});

test('init { target: backend } : shared + backend present', () => {
  dansCibleTemporaire((cible) => {
    init(racineTemplate, cible, { target: 'backend' });

    assert.ok(
      fs.existsSync(path.join(cible, 'AGENTS.md')),
      'AGENTS.md (shared) doit etre cree'
    );
    assert.ok(
      fs.existsSync(path.join(cible, 'skillkit', 'guidelines', 'dotnet.md')),
      'dotnet.md (backend) doit etre cree avec target:backend'
    );
  });
});

test('init sans target, cible sans PROJECT.md → all (retro-compat, dotnet.md present)', () => {
  dansCibleTemporaire((cible) => {
    init(racineTemplate, cible);

    assert.ok(
      fs.existsSync(path.join(cible, 'skillkit', 'guidelines', 'dotnet.md')),
      'dotnet.md doit etre present sans target (defaut all)'
    );
  });
});

test('init sans target, PROJECT.md cible avec Type : frontend → dotnet.md absent', () => {
  dansCibleTemporaire((cible) => {
    fs.writeFileSync(
      path.join(cible, 'PROJECT.md'),
      '## Type projet\n- Type : frontend\n'
    );

    init(racineTemplate, cible);

    assert.ok(
      !fs.existsSync(path.join(cible, 'skillkit', 'guidelines', 'dotnet.md')),
      'dotnet.md (backend) ne doit pas etre cree si PROJECT.md cible declare frontend'
    );
  });
});

// ─── update --target ──────────────────────────────────────────────────────────

test('update { target: frontend } : dotnet.md (backend) absent des actions skillkit/', () => {
  dansCibleTemporaire((cible) => {
    init(racineTemplate, cible);

    const actions = update(racineTemplate, cible, { target: 'frontend' });

    const cheminsSkillkit = actions
      .filter((a) => a.path.startsWith('skillkit/'))
      .map((a) => a.path);

    assert.ok(
      !cheminsSkillkit.includes('skillkit/guidelines/dotnet.md'),
      'dotnet.md (backend) ne doit pas apparaitre dans les actions update --target frontend'
    );
    assert.ok(
      !cheminsSkillkit.includes('skillkit/guidelines/architecture.md'),
      'architecture.md (backend) ne doit pas apparaitre dans les actions update --target frontend'
    );
    assert.ok(
      cheminsSkillkit.some((p) => p.includes('tdd') || p.includes('standards')),
      'au moins un fichier shared doit etre dans les actions'
    );
  });
});

// ─── CLI --target parsing ─────────────────────────────────────────────────────

test('runCli init --target zorglub → exit != 0, cible inchangee', () => {
  dansCibleTemporaire((cible) => {
    const snapshotAvant = {};

    const result = runCli('init', cible, '--target', 'zorglub');

    assert.notEqual(result.status, 0, 'exit code doit etre different de 0');
    assert.ok(
      result.stderr.includes('zorglub') || result.stderr.includes('invalide'),
      `stderr doit mentionner l'erreur : ${result.stderr}`
    );

    // La cible ne doit pas avoir ete modifiee
    const fichiersCrees = fs.readdirSync(cible);
    assert.deepEqual(fichiersCrees, [], 'la cible doit rester vide apres erreur --target');
  });
});

test('runCli init --target backend → exit 0, dotnet.md present', () => {
  dansCibleTemporaire((cible) => {
    const result = runCli('init', cible, '--target', 'backend');

    assert.equal(
      result.status,
      0,
      `exit code inattendu: ${result.status}\nstderr: ${result.stderr}`
    );
    assert.ok(
      fs.existsSync(path.join(cible, 'skillkit', 'guidelines', 'dotnet.md')),
      'dotnet.md doit exister apres init --target backend'
    );
  });
});

test('runCli init --target=frontend → exit 0, dotnet.md absent', () => {
  dansCibleTemporaire((cible) => {
    const result = runCli('init', `--target=frontend`, cible);

    assert.equal(
      result.status,
      0,
      `exit code inattendu: ${result.status}\nstderr: ${result.stderr}`
    );
    assert.ok(
      !fs.existsSync(path.join(cible, 'skillkit', 'guidelines', 'dotnet.md')),
      'dotnet.md ne doit pas exister apres init --target=frontend'
    );
  });
});
