'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const { classifyBucket, filterByTarget, resolveTarget } = require('../lib/manifest');

// ─── Étape 1 : classifyBucket ────────────────────────────────────────────────

test('classifyBucket : shared — guidelines communs, workflow, delivery, hooks, agents communs', () => {
  assert.equal(classifyBucket('skillkit/guidelines/tdd.md'), 'shared');
  assert.equal(classifyBucket('skillkit/guidelines/standards.md'), 'shared');
  assert.equal(classifyBucket('skillkit/skills/workflow/tdd/SKILL.md'), 'shared');
  assert.equal(classifyBucket('skillkit/skills/workflow/brainstorm/SKILL.md'), 'shared');
  assert.equal(classifyBucket('skillkit/skills/delivery/commit/SKILL.md'), 'shared');
  assert.equal(classifyBucket('skillkit/skills/delivery/review/SKILL.md'), 'shared');
  assert.equal(classifyBucket('.claude/commands/commit.md'), 'shared');
  assert.equal(classifyBucket('.claude/commands/tdd.md'), 'shared');
  assert.equal(classifyBucket('.claude/agents/test-writer.md'), 'shared');
  assert.equal(classifyBucket('.claude/hooks/guard-bash.sh'), 'shared');
  assert.equal(classifyBucket('.claude/hooks/track-tests.ps1'), 'shared');
  assert.equal(classifyBucket('AGENTS.md'), 'shared');
  assert.equal(classifyBucket('CLAUDE.md'), 'shared');
  assert.equal(classifyBucket('PROJECT.md'), 'shared');
  assert.equal(classifyBucket('.claude/settings.json'), 'shared');
});

test('classifyBucket : backend — guidelines, skills, commands et agents backend', () => {
  assert.equal(classifyBucket('skillkit/guidelines/architecture.md'), 'backend');
  assert.equal(classifyBucket('skillkit/guidelines/ddd.md'), 'backend');
  assert.equal(classifyBucket('skillkit/guidelines/dotnet.md'), 'backend');
  assert.equal(classifyBucket('skillkit/skills/backend/ddd-review/SKILL.md'), 'backend');
  assert.equal(classifyBucket('skillkit/skills/backend/file-review/SKILL.md'), 'backend');
  assert.equal(classifyBucket('.claude/commands/ddd-review.md'), 'backend');
  assert.equal(classifyBucket('.claude/commands/file-review.md'), 'backend');
  assert.equal(classifyBucket('.claude/commands/csharp-quality.md'), 'backend');
  assert.equal(classifyBucket('.claude/agents/backend-implementer.md'), 'backend');
  assert.equal(classifyBucket('.claude/agents/backend-reviewer.md'), 'backend');
});

test('classifyBucket : frontend — guidelines, skills et commands frontend', () => {
  assert.equal(classifyBucket('skillkit/guidelines/angular.md'), 'frontend');
  assert.equal(classifyBucket('skillkit/skills/frontend/ng-review/SKILL.md'), 'frontend');
  assert.equal(classifyBucket('skillkit/skills/frontend/ng-explain/SKILL.md'), 'frontend');
  assert.equal(classifyBucket('.claude/commands/ng-review.md'), 'frontend');
  assert.equal(classifyBucket('.claude/commands/ng-explain.md'), 'frontend');
});

test('buildManifest retourne des entrees { path, strategy, bucket }', () => {
  const path = require('node:path');
  const { buildManifest } = require('../lib/manifest');
  const racine = path.join(__dirname, '..', '..');
  const manifest = buildManifest(racine);
  for (const entree of manifest) {
    assert.ok(
      ['shared', 'backend', 'frontend'].includes(entree.bucket),
      `bucket inattendu pour ${entree.path} : ${entree.bucket}`
    );
  }
});

// ─── Étape 2 : filterByTarget ────────────────────────────────────────────────

function manifTest() {
  return [
    { path: 'AGENTS.md', strategy: 'merge-markdown', bucket: 'shared' },
    { path: 'skillkit/guidelines/tdd.md', strategy: 'copy', bucket: 'shared' },
    { path: 'skillkit/guidelines/dotnet.md', strategy: 'copy', bucket: 'backend' },
    { path: 'skillkit/guidelines/angular.md', strategy: 'copy', bucket: 'frontend' },
    { path: 'skillkit/skills/backend/ddd-review/SKILL.md', strategy: 'copy', bucket: 'backend' },
    { path: 'skillkit/skills/frontend/ng-review/SKILL.md', strategy: 'copy', bucket: 'frontend' },
  ];
}

test('filterByTarget(backend) : retourne shared + backend, aucun frontend', () => {
  const result = filterByTarget(manifTest(), 'backend');
  const paths = result.map((e) => e.path);
  assert.ok(paths.includes('AGENTS.md'), 'shared inclus');
  assert.ok(paths.includes('skillkit/guidelines/tdd.md'), 'shared inclus');
  assert.ok(paths.includes('skillkit/guidelines/dotnet.md'), 'backend inclus');
  assert.ok(paths.includes('skillkit/skills/backend/ddd-review/SKILL.md'), 'backend inclus');
  assert.ok(!paths.includes('skillkit/guidelines/angular.md'), 'frontend exclu');
  assert.ok(!paths.includes('skillkit/skills/frontend/ng-review/SKILL.md'), 'frontend exclu');
});

test('filterByTarget(frontend) : retourne shared + frontend, aucun backend', () => {
  const result = filterByTarget(manifTest(), 'frontend');
  const paths = result.map((e) => e.path);
  assert.ok(paths.includes('AGENTS.md'), 'shared inclus');
  assert.ok(paths.includes('skillkit/guidelines/tdd.md'), 'shared inclus');
  assert.ok(paths.includes('skillkit/guidelines/angular.md'), 'frontend inclus');
  assert.ok(paths.includes('skillkit/skills/frontend/ng-review/SKILL.md'), 'frontend inclus');
  assert.ok(!paths.includes('skillkit/guidelines/dotnet.md'), 'backend exclu');
  assert.ok(!paths.includes('skillkit/skills/backend/ddd-review/SKILL.md'), 'backend exclu');
});

test('filterByTarget(all) : retourne tout le manifest, inchange', () => {
  const mani = manifTest();
  const result = filterByTarget(mani, 'all');
  assert.deepEqual(result, mani);
});

// ─── Étape 3 : resolveTarget ─────────────────────────────────────────────────

test('resolveTarget : le flag prime toujours sur PROJECT.md', () => {
  assert.equal(resolveTarget({ flag: 'backend', projectMd: 'Type : frontend' }), 'backend');
  assert.equal(resolveTarget({ flag: 'frontend', projectMd: 'Type : backend' }), 'frontend');
  assert.equal(resolveTarget({ flag: 'all', projectMd: 'Type : backend' }), 'all');
});

test('resolveTarget : sans flag, lu depuis PROJECT.md', () => {
  assert.equal(resolveTarget({ projectMd: '## Type projet\n- Type : backend' }), 'backend');
  assert.equal(resolveTarget({ projectMd: '## Type projet\n- Type : frontend' }), 'frontend');
  assert.equal(resolveTarget({ projectMd: '## Type projet\n- Type : fullstack' }), 'all');
});

test('resolveTarget : sans flag ni champ → all (defaut)', () => {
  assert.equal(resolveTarget({}), 'all');
  assert.equal(resolveTarget({ projectMd: undefined }), 'all');
  assert.equal(resolveTarget({ projectMd: '# Pas de champ type' }), 'all');
});

test('resolveTarget : flag invalide → throw avec message', () => {
  assert.throws(
    () => resolveTarget({ flag: 'zorglub' }),
    /zorglub/
  );
});

test('PROJECT.md du template declare le champ Type', () => {
  const fs = require('node:fs');
  const path = require('node:path');
  const projectMd = fs.readFileSync(
    path.join(__dirname, '..', '..', 'PROJECT.md'),
    'utf8'
  );
  assert.ok(projectMd.includes('Type :'), 'PROJECT.md doit contenir le champ "Type :"');
});
