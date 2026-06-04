'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { init } = require('../lib/init');

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

/**
 * Ecrit un fichier dans la cible (dossiers crees au besoin) a partir d'un
 * chemin relatif POSIX.
 *
 * @param {string} cible Racine de la cible.
 * @param {string} relatif Chemin relatif POSIX.
 * @param {string} contenu
 */
function ecrireDansCible(cible, relatif, contenu) {
  const absolu = path.join(cible, ...relatif.split('/'));
  fs.mkdirSync(path.dirname(absolu), { recursive: true });
  fs.writeFileSync(absolu, contenu, 'utf8');
}

/**
 * Lit un fichier de la cible a partir d'un chemin relatif POSIX.
 *
 * @param {string} cible Racine de la cible.
 * @param {string} relatif Chemin relatif POSIX.
 * @returns {string}
 */
function lireDansCible(cible, relatif) {
  return fs.readFileSync(path.join(cible, ...relatif.split('/')), 'utf8');
}

/**
 * Photographie l'etat complet de la cible : map chemin relatif POSIX -> contenu.
 *
 * @param {string} cible Racine de la cible.
 * @returns {Record<string, string>}
 */
function photographier(cible) {
  const etat = {};
  const parcourir = (dossier) => {
    for (const entree of fs.readdirSync(dossier, { withFileTypes: true })) {
      const absolu = path.join(dossier, entree.name);
      if (entree.isDirectory()) {
        parcourir(absolu);
      } else {
        const relatif = path.relative(cible, absolu).split(path.sep).join('/');
        etat[relatif] = fs.readFileSync(absolu, 'utf8');
      }
    }
  };
  parcourir(cible);
  return etat;
}

test('init sur projet existant : CLAUDE.md projet preserve, bloc kit ajoute entre marqueurs', () => {
  dansCibleTemporaire((cible) => {
    // Arrange
    const contenuProjet = '# Mon projet\n\nNotes locales du projet.\n';
    ecrireDansCible(cible, 'CLAUDE.md', contenuProjet);

    // Act
    const actions = init(racineTemplate, cible);

    // Assert : texte projet intact, bloc kit entre marqueurs, statut fusionne
    const resultat = lireDansCible(cible, 'CLAUDE.md');
    assert.ok(resultat.startsWith('# Mon projet'), 'le texte projet doit ouvrir le fichier');
    assert.ok(resultat.includes('Notes locales du projet.'), 'le texte projet doit etre preserve');
    assert.ok(resultat.includes('<!-- skillkit:start -->'), 'le marqueur de debut doit etre present');
    assert.ok(resultat.includes('<!-- skillkit:end -->'), 'le marqueur de fin doit etre present');
    assert.equal(actions.find((a) => a.path === 'CLAUDE.md').status, 'fusionne');
  });
});

test('init sur projet existant : hook projet conserve dans settings.json, hooks kit ajoutes', () => {
  dansCibleTemporaire((cible) => {
    // Arrange : un settings.json projet avec un hook maison
    const hookProjet = {
      matcher: 'MonOutil',
      hooks: [{ type: 'command', command: 'mon-hook.ps1' }],
    };
    ecrireDansCible(
      cible,
      '.claude/settings.json',
      JSON.stringify({ hooks: { PreToolUse: [hookProjet] } })
    );

    // Act
    init(racineTemplate, cible);

    // Assert : le hook projet et les hooks kit cohabitent
    const fusionne = JSON.parse(lireDansCible(cible, '.claude/settings.json'));
    const matchers = fusionne.hooks.PreToolUse.map((entree) => entree.matcher);
    assert.ok(matchers.includes('MonOutil'), 'le hook projet doit etre conserve');
    assert.ok(matchers.includes('Bash'), 'les hooks kit doivent etre ajoutes');
    assert.ok(fusionne.permissions, 'les permissions du kit doivent etre ajoutees');
  });
});

test('init sur projet existant : serveur MCP projet conserve, context7 ajoute', () => {
  dansCibleTemporaire((cible) => {
    // Arrange : un .mcp.json projet avec un serveur maison
    ecrireDansCible(
      cible,
      '.mcp.json',
      JSON.stringify({ mcpServers: { monServeur: { command: 'mon-serveur' } } })
    );

    // Act
    init(racineTemplate, cible);

    // Assert
    const fusionne = JSON.parse(lireDansCible(cible, '.mcp.json'));
    assert.ok(fusionne.mcpServers.monServeur, 'le serveur projet doit etre conserve');
    assert.ok(fusionne.mcpServers.context7, 'context7 doit etre ajoute');
  });
});

test('init sur projet existant : PROJECT.md rempli reste strictement identique', () => {
  dansCibleTemporaire((cible) => {
    // Arrange
    const contenuProjet = '# PROJECT\n\nStack : .NET 8.\nProfil domaine : riche.\n';
    ecrireDansCible(cible, 'PROJECT.md', contenuProjet);

    // Act
    const actions = init(racineTemplate, cible);

    // Assert : copy-if-absent — aucune ecriture, statut ignore
    assert.equal(lireDansCible(cible, 'PROJECT.md'), contenuProjet);
    assert.equal(actions.find((a) => a.path === 'PROJECT.md').status, 'ignore');
  });
});

test('init sur projet existant : fichier copy modifie localement non ecrase, statut conflit', () => {
  dansCibleTemporaire((cible) => {
    // Arrange : une command modifiee localement (strategie copy)
    const contenuModifie = '# tdd — version locale modifiee\n';
    ecrireDansCible(cible, '.claude/commands/tdd.md', contenuModifie);

    // Act
    const actions = init(racineTemplate, cible);

    // Assert
    assert.equal(lireDansCible(cible, '.claude/commands/tdd.md'), contenuModifie);
    assert.equal(actions.find((a) => a.path === '.claude/commands/tdd.md').status, 'conflit');
  });
});

test('init sur projet existant : double init idempotent — contenu identique, aucun doublon', () => {
  dansCibleTemporaire((cible) => {
    // Arrange : des fichiers projet qui declenchent les fusions
    ecrireDansCible(cible, 'CLAUDE.md', '# Mon projet\n');
    ecrireDansCible(
      cible,
      '.claude/settings.json',
      JSON.stringify({ hooks: { PreToolUse: [{ matcher: 'MonOutil', hooks: [] }] } })
    );

    // Act
    init(racineTemplate, cible);
    const apresPremier = photographier(cible);
    init(racineTemplate, cible);
    const apresSecond = photographier(cible);

    // Assert : etat strictement identique apres le second passage
    assert.deepEqual(apresSecond, apresPremier);
  });
});

test('init sur projet existant : fichier identique au kit aux fins de ligne pres -> a-jour', () => {
  dansCibleTemporaire((cible) => {
    // Arrange : meme contenu que le kit mais avec les EOL opposees
    const relatif = 'skillkit/guidelines/tdd.md';
    const contenuKit = fs.readFileSync(path.join(racineTemplate, ...relatif.split('/')), 'utf8');
    const contenuOppose = contenuKit.includes('\r\n')
      ? contenuKit.replace(/\r\n/g, '\n')
      : contenuKit.replace(/\n/g, '\r\n');
    ecrireDansCible(cible, relatif, contenuOppose);

    // Act
    const actions = init(racineTemplate, cible);

    // Assert : la difference d'EOL ne doit pas etre un conflit
    assert.equal(actions.find((a) => a.path === relatif).status, 'a-jour');
  });
});
