'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const racine = path.join(__dirname, '..', '..');
const hookTrackTests = path.join(racine, '.claude/hooks/track-tests.sh');
const hookGuardCommit = path.join(racine, '.claude/hooks/guard-commit.sh');

function avecDossierTemp(callback) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'skillkit-hooks-'));
  try {
    callback(tmpDir);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

function payloadTrackTests(cmd, stdout, stderr) {
  return JSON.stringify({
    tool_name: 'Bash',
    tool_input: { command: cmd },
    tool_response: { stdout: stdout || '', stderr: stderr || '', output: '' },
  });
}

function lireMarqueur(tmpDir) {
  const p = path.join(tmpDir, '.claude', '.last-test-run');
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null;
}

function initGitRepo(dir) {
  spawnSync('git', ['init'], { cwd: dir });
  spawnSync('git', ['config', 'user.email', 'test@test.com'], { cwd: dir });
  spawnSync('git', ['config', 'user.name', 'Test'], { cwd: dir });
}

function payloadCommit() {
  return JSON.stringify({
    tool_name: 'Bash',
    tool_input: { command: 'git commit -m "test"' },
  });
}

function estRefuse(stdout) {
  return stdout.includes('"deny"');
}

// ─── Étape 7 : track-tests reconnaît les runners frontend ─────────────────────

test('track-tests : ng test reussi → marqueur PASS', () => {
  avecDossierTemp((tmpDir) => {
    fs.mkdirSync(path.join(tmpDir, '.claude'));
    spawnSync('bash', [hookTrackTests], {
      input: payloadTrackTests(
        'ng test --watch=false',
        'TOTAL: 5 SUCCESS\nExecuted 5 of 5 SUCCESS (0.1 secs)'
      ),
      cwd: tmpDir,
      encoding: 'utf8',
    });
    const marqueur = lireMarqueur(tmpDir);
    assert.ok(marqueur, 'le marqueur doit etre ecrit pour ng test');
    assert.ok(
      marqueur.endsWith('|PASS'),
      `marqueur doit se terminer par PASS : "${marqueur}"`
    );
  });
});

test('track-tests : npm test reussi → marqueur PASS', () => {
  avecDossierTemp((tmpDir) => {
    fs.mkdirSync(path.join(tmpDir, '.claude'));
    spawnSync('bash', [hookTrackTests], {
      input: payloadTrackTests('npm test', 'Tests: 3 passed, 3 total\nTest Suites: 1 passed'),
      cwd: tmpDir,
      encoding: 'utf8',
    });
    const marqueur = lireMarqueur(tmpDir);
    assert.ok(marqueur, 'le marqueur doit etre ecrit pour npm test');
    assert.ok(
      marqueur.endsWith('|PASS'),
      `marqueur doit se terminer par PASS : "${marqueur}"`
    );
  });
});

test('track-tests : vitest reussi → marqueur PASS', () => {
  avecDossierTemp((tmpDir) => {
    fs.mkdirSync(path.join(tmpDir, '.claude'));
    spawnSync('bash', [hookTrackTests], {
      input: payloadTrackTests(
        'npx vitest run',
        ' Test Files  3 passed (3)\n Tests  15 passed (15)\n Duration  1.20s'
      ),
      cwd: tmpDir,
      encoding: 'utf8',
    });
    const marqueur = lireMarqueur(tmpDir);
    assert.ok(marqueur, 'le marqueur doit etre ecrit pour vitest');
    assert.ok(
      marqueur.endsWith('|PASS'),
      `marqueur doit se terminer par PASS : "${marqueur}"`
    );
  });
});

test('track-tests : ng test en echec → marqueur FAIL', () => {
  avecDossierTemp((tmpDir) => {
    fs.mkdirSync(path.join(tmpDir, '.claude'));
    spawnSync('bash', [hookTrackTests], {
      input: payloadTrackTests(
        'ng test --watch=false',
        'Chrome: Executed 5 of 5 (1 FAILED)\nFailed!'
      ),
      cwd: tmpDir,
      encoding: 'utf8',
    });
    const marqueur = lireMarqueur(tmpDir);
    assert.ok(marqueur, 'le marqueur doit etre ecrit pour ng test en echec');
    assert.ok(
      marqueur.endsWith('|FAIL'),
      `marqueur doit se terminer par FAIL : "${marqueur}"`
    );
  });
});

// ─── Étape 8 : guard-commit reconnaît une suite frontend ──────────────────────

test('guard-commit : projet angular.json sans marqueur → deny', () => {
  avecDossierTemp((tmpDir) => {
    initGitRepo(tmpDir);
    fs.writeFileSync(path.join(tmpDir, 'angular.json'), '{}');
    spawnSync('git', ['add', 'angular.json'], { cwd: tmpDir });

    const result = spawnSync('bash', [hookGuardCommit], {
      input: payloadCommit(),
      cwd: tmpDir,
      encoding: 'utf8',
    });
    assert.ok(
      estRefuse(result.stdout),
      `guard-commit doit refuser un commit sans tests verts (stdout="${result.stdout}")`
    );
  });
});

test('guard-commit : projet package.json sans marqueur → deny', () => {
  avecDossierTemp((tmpDir) => {
    initGitRepo(tmpDir);
    fs.writeFileSync(path.join(tmpDir, 'package.json'), '{"name":"app"}');
    spawnSync('git', ['add', 'package.json'], { cwd: tmpDir });

    const result = spawnSync('bash', [hookGuardCommit], {
      input: payloadCommit(),
      cwd: tmpDir,
      encoding: 'utf8',
    });
    assert.ok(
      estRefuse(result.stdout),
      `guard-commit doit refuser un commit sans tests verts (stdout="${result.stdout}")`
    );
  });
});

test('guard-commit : projet angular.json avec marqueur vert recent → allow', () => {
  avecDossierTemp((tmpDir) => {
    initGitRepo(tmpDir);
    fs.writeFileSync(path.join(tmpDir, 'angular.json'), '{}');
    spawnSync('git', ['add', 'angular.json'], { cwd: tmpDir });

    fs.mkdirSync(path.join(tmpDir, '.claude'));
    const now = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
    fs.writeFileSync(path.join(tmpDir, '.claude', '.last-test-run'), `${now}|PASS`);

    const result = spawnSync('bash', [hookGuardCommit], {
      input: payloadCommit(),
      cwd: tmpDir,
      encoding: 'utf8',
    });
    assert.ok(
      !estRefuse(result.stdout),
      `guard-commit doit autoriser avec marqueur vert (stdout="${result.stdout}")`
    );
    assert.equal(result.status, 0, 'exit code doit etre 0');
  });
});

test('guard-commit : projet sans fichiers reconnus → non applicable (allow)', () => {
  avecDossierTemp((tmpDir) => {
    initGitRepo(tmpDir);
    // Repo sans *.sln, *.csproj, *.test.js, angular.json, package.json
    fs.writeFileSync(path.join(tmpDir, 'README.md'), '# hello');
    spawnSync('git', ['add', 'README.md'], { cwd: tmpDir });

    const result = spawnSync('bash', [hookGuardCommit], {
      input: payloadCommit(),
      cwd: tmpDir,
      encoding: 'utf8',
    });
    assert.ok(
      !estRefuse(result.stdout),
      `guard-commit ne doit pas s'appliquer sans projet reconnu (stdout="${result.stdout}")`
    );
    assert.equal(result.status, 0);
  });
});
