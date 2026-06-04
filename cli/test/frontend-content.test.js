'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const racine = path.join(__dirname, '..', '..');

// ─── Étape 5 : SKILL.md frontend — existence, format, langue ─────────────────

test('ng-review/SKILL.md existe', () => {
  assert.ok(
    fs.existsSync(path.join(racine, 'skillkit/skills/frontend/ng-review/SKILL.md')),
    'skillkit/skills/frontend/ng-review/SKILL.md doit exister'
  );
});

test('ng-explain/SKILL.md existe', () => {
  assert.ok(
    fs.existsSync(path.join(racine, 'skillkit/skills/frontend/ng-explain/SKILL.md')),
    'skillkit/skills/frontend/ng-explain/SKILL.md doit exister'
  );
});

test('ng-review/SKILL.md : frontmatter name + description uniquement (pas de trigger/version/stack/args)', () => {
  const contenu = fs.readFileSync(
    path.join(racine, 'skillkit/skills/frontend/ng-review/SKILL.md'),
    'utf8'
  );
  const fm = contenu.match(/^---\n([\s\S]*?)\n---/);
  assert.ok(fm, 'frontmatter YAML absent');
  const lignes = fm[1].split('\n').filter(Boolean);
  assert.ok(lignes.some((l) => l.startsWith('name:')), 'champ name: manquant');
  assert.ok(lignes.some((l) => l.startsWith('description:')), 'champ description: manquant');
  assert.ok(!lignes.some((l) => l.startsWith('trigger:')), 'trigger: ne doit pas etre present');
  assert.ok(!lignes.some((l) => l.startsWith('version:')), 'version: ne doit pas etre present');
  assert.ok(!lignes.some((l) => l.startsWith('stack:')), 'stack: ne doit pas etre present');
  assert.ok(!lignes.some((l) => l.startsWith('args:')), 'args: ne doit pas etre present');
});

test('ng-explain/SKILL.md : frontmatter name + description uniquement', () => {
  const contenu = fs.readFileSync(
    path.join(racine, 'skillkit/skills/frontend/ng-explain/SKILL.md'),
    'utf8'
  );
  const fm = contenu.match(/^---\n([\s\S]*?)\n---/);
  assert.ok(fm, 'frontmatter YAML absent');
  const lignes = fm[1].split('\n').filter(Boolean);
  assert.ok(lignes.some((l) => l.startsWith('name:')), 'champ name: manquant');
  assert.ok(lignes.some((l) => l.startsWith('description:')), 'champ description: manquant');
  assert.ok(!lignes.some((l) => l.startsWith('trigger:')), 'trigger: ne doit pas etre present');
  assert.ok(!lignes.some((l) => l.startsWith('version:')), 'version: ne doit pas etre present');
  assert.ok(!lignes.some((l) => l.startsWith('stack:')), 'stack: ne doit pas etre present');
  assert.ok(!lignes.some((l) => l.startsWith('args:')), 'args: ne doit pas etre present');
});

test('ng-review/SKILL.md : contenu en francais (marqueurs FR)', () => {
  const contenu = fs.readFileSync(
    path.join(racine, 'skillkit/skills/frontend/ng-review/SKILL.md'),
    'utf8'
  );
  const marqueursFr =
    /\b(revue|analyse|axe|trouv|corrig|r[ée]sum[ée]|obligatoire|pourquoi|probl[eè]me|avant|apr[eè]s|d[ée]tect|explication|signe|chaque)\b/i;
  assert.ok(
    marqueursFr.test(contenu),
    'le contenu doit contenir des marqueurs FR (revue, analyse, axe…)'
  );
});

test('ng-explain/SKILL.md : contenu en francais (marqueurs FR)', () => {
  const contenu = fs.readFileSync(
    path.join(racine, 'skillkit/skills/frontend/ng-explain/SKILL.md'),
    'utf8'
  );
  const marqueursFr =
    /\b(expliquer|explication|probl[eè]me|exemple|utiliser|quand|patron|m[eé]canisme|r[ée]sum[ée]|sujets?|valides?)\b/i;
  assert.ok(
    marqueursFr.test(contenu),
    'le contenu doit contenir des marqueurs FR (explication, mécanisme…)'
  );
});

test('anciens ng-review.md et ng-explain.md (format v1) ne doivent plus exister', () => {
  assert.ok(
    !fs.existsSync(path.join(racine, 'skillkit/skills/frontend/ng-review.md')),
    'ng-review.md (format obsolete) ne doit plus exister'
  );
  assert.ok(
    !fs.existsSync(path.join(racine, 'skillkit/skills/frontend/ng-explain.md')),
    'ng-explain.md (format obsolete) ne doit plus exister'
  );
});

// ─── Étape 6 : angular.md + commands frontend ─────────────────────────────────

test('guidelines/angular.md existe', () => {
  assert.ok(
    fs.existsSync(path.join(racine, 'skillkit/guidelines/angular.md')),
    'skillkit/guidelines/angular.md doit exister'
  );
});

test('.claude/commands/ng-review.md existe et reference le skill canonique', () => {
  const p = path.join(racine, '.claude/commands/ng-review.md');
  assert.ok(fs.existsSync(p), '.claude/commands/ng-review.md doit exister');
  const contenu = fs.readFileSync(p, 'utf8');
  assert.ok(
    contenu.includes('ng-review') || contenu.includes('frontend'),
    'ng-review.md doit referencer le skill ng-review ou le dossier frontend'
  );
});

test('.claude/commands/ng-explain.md existe et reference le skill canonique', () => {
  const p = path.join(racine, '.claude/commands/ng-explain.md');
  assert.ok(fs.existsSync(p), '.claude/commands/ng-explain.md doit exister');
  const contenu = fs.readFileSync(p, 'utf8');
  assert.ok(
    contenu.includes('ng-explain') || contenu.includes('frontend'),
    'ng-explain.md doit referencer le skill ng-explain ou le dossier frontend'
  );
});
