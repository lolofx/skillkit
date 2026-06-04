'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { init } = require('../lib/init');
const { formatReport } = require('../lib/report');

// Le template est le repo reel (lecture seule) ; la cible est un dossier
// temporaire sous $TEMP (hors OneDrive, pour eviter les verrous de synchro).
const racineTemplate = path.join(__dirname, '..', '..');

/**
 * Cree une cible temporaire vierge, execute le callback, puis nettoie le
 * dossier quoi qu'il arrive.
 *
 * @param {(cible: string) => void} callback
 */
function dansCibleTemporaire(callback) {
  const cible = fs.mkdtempSync(path.join(os.tmpdir(), 'skillkit-init-'));
  try {
    callback(cible);
  } finally {
    fs.rmSync(cible, { recursive: true, force: true });
  }
}

test('init sur cible vierge : la structure complete du kit existe apres execution', () => {
  dansCibleTemporaire((cible) => {
    // Act
    init(racineTemplate, cible);

    // Assert : les fichiers pivots de chaque zone du kit existent dans la cible
    const attendus = [
      'skillkit/guidelines/tdd.md',
      'skillkit/skills/workflow/tdd/SKILL.md',
      '.claude/settings.json',
      '.claude/hooks/guard-bash.ps1',
      'AGENTS.md',
      'CLAUDE.md',
      'PROJECT.md',
      'specs/README.md',
      '.mcp.json',
    ];
    for (const relatif of attendus) {
      assert.ok(
        fs.existsSync(path.join(cible, ...relatif.split('/'))),
        `${relatif} doit exister dans la cible apres init`
      );
    }
  });
});

test('init sur cible vierge : aucun fichier exclu du kit n\'est present dans la cible', () => {
  dansCibleTemporaire((cible) => {
    // Act
    init(racineTemplate, cible);

    // Assert : les exclusions du manifest ne sont jamais materialisees
    const exclus = ['README.md', '.github', 'skillkit/docs', 'specs/cli-init', 'cli', 'package.json'];
    for (const relatif of exclus) {
      assert.ok(
        !fs.existsSync(path.join(cible, ...relatif.split('/'))),
        `${relatif} ne doit pas exister dans la cible apres init`
      );
    }
  });
});

test('init sur cible vierge : le rapport liste chaque fichier avec son statut', () => {
  dansCibleTemporaire((cible) => {
    // Act
    const actions = init(racineTemplate, cible);
    const rapport = formatReport(actions);

    // Assert : une ligne par action, portant le path et le statut
    const lignes = rapport.split('\n').filter((l) => l.trim() !== '');
    assert.equal(lignes.length, actions.length, 'le rapport doit avoir une ligne par fichier');
    for (const action of actions) {
      const ligne = lignes.find((l) => l.includes(action.path));
      assert.ok(ligne, `le rapport doit mentionner ${action.path}`);
      assert.ok(
        ligne.includes(action.status),
        `la ligne de ${action.path} doit porter son statut (${action.status})`
      );
    }
  });
});
