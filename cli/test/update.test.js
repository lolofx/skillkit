'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { init } = require('../lib/init');
const { update } = require('../lib/update');

const racineTemplate = path.join(__dirname, '..', '..');

function dansCibleTemporaire(callback) {
  const cible = fs.mkdtempSync(path.join(os.tmpdir(), 'skillkit-update-'));
  try {
    callback(cible);
  } finally {
    fs.rmSync(cible, { recursive: true, force: true });
  }
}

test('update : skillkit/ diverge → remplace par la version template', () => {
  dansCibleTemporaire((cible) => {
    // Arrange : init puis divergence d'un fichier skillkit/
    init(racineTemplate, cible);
    const fichier = path.join(cible, 'skillkit', 'guidelines', 'tdd.md');
    fs.writeFileSync(fichier, 'contenu divergent localement', 'utf8');

    // Act
    update(racineTemplate, cible);

    // Assert : le fichier est revenu a la version template
    const contenuTemplate = fs
      .readFileSync(path.join(racineTemplate, 'skillkit', 'guidelines', 'tdd.md'), 'utf8')
      .replace(/\r\n/g, '\n');
    const contenuCible = fs.readFileSync(fichier, 'utf8').replace(/\r\n/g, '\n');
    assert.equal(contenuCible, contenuTemplate);
  });
});

test('update : CLAUDE.md et .claude/hooks/ personnalises → strictement identiques avant/apres', () => {
  dansCibleTemporaire((cible) => {
    // Arrange : init puis modification de fichiers hors skillkit/
    init(racineTemplate, cible);

    const claudeMd = path.join(cible, 'CLAUDE.md');
    const claudeMdModifie = fs.readFileSync(claudeMd, 'utf8') + '\n## Ajout local';
    fs.writeFileSync(claudeMd, claudeMdModifie, 'utf8');

    const hook = path.join(cible, '.claude', 'hooks', 'guard-bash.ps1');
    const hookModifie = '# Version personnalisee\n' + fs.readFileSync(hook, 'utf8');
    fs.writeFileSync(hook, hookModifie, 'utf8');

    // Act
    update(racineTemplate, cible);

    // Assert : hors skillkit/ strictement identique avant/apres
    assert.equal(fs.readFileSync(claudeMd, 'utf8'), claudeMdModifie);
    assert.equal(fs.readFileSync(hook, 'utf8'), hookModifie);
  });
});

test('update : divergences hors skillkit/ signalees dans le rapport (informatif)', () => {
  dansCibleTemporaire((cible) => {
    // Arrange : init puis divergence sur CLAUDE.md (hors skillkit/)
    init(racineTemplate, cible);
    const claudeMd = path.join(cible, 'CLAUDE.md');
    fs.writeFileSync(claudeMd, 'contenu personnel', 'utf8');

    // Act
    const actions = update(racineTemplate, cible);

    // Assert : CLAUDE.md diverge apparait dans le rapport avec un statut "diverge"
    const actionClaudeMd = actions.find((a) => a.path === 'CLAUDE.md');
    assert.ok(actionClaudeMd, 'CLAUDE.md diverge doit apparaitre dans les actions');
    assert.match(actionClaudeMd.status, /diverge/, 'le statut doit indiquer une divergence locale');
    // Et le fichier n'a pas ete modifie
    assert.equal(fs.readFileSync(claudeMd, 'utf8'), 'contenu personnel');
  });
});

test('update : cible sans dossier skillkit/ → erreur explicite, rien cree', () => {
  dansCibleTemporaire((cible) => {
    // Act + Assert : throw attendu
    assert.throws(
      () => update(racineTemplate, cible),
      (err) => {
        assert.ok(err instanceof Error);
        assert.ok(
          err.message.toLowerCase().includes('skillkit'),
          `message doit mentionner skillkit : ${err.message}`
        );
        return true;
      }
    );
    // Assert : aucun fichier cree malgre l'appel
    assert.equal(fs.readdirSync(cible).length, 0, 'aucun fichier ne doit etre cree');
  });
});
