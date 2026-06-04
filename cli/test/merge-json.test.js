'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const { mergeJson } = require('../lib/merge-json');

// Fixture : settings.json du kit (version simplifiee, forme reelle).
const SETTINGS_KIT = JSON.stringify({
  permissions: { deny: ['Bash(rm -rf:*)', 'Bash(git push --force:*)'] },
  hooks: {
    PreToolUse: [
      {
        matcher: 'Bash',
        hooks: [
          {
            type: 'command',
            command:
              'powershell .claude/hooks/guard-bash.ps1 || bash .claude/hooks/guard-bash.sh',
          },
        ],
      },
    ],
  },
});

// Fixture : .mcp.json du kit.
const MCP_KIT = JSON.stringify({
  mcpServers: {
    context7: { command: 'npx', args: ['-y', '@upstash/context7-mcp'] },
  },
});

test('settings.json : le hook projet et son deny sont preserves, les hooks et permissions.deny du kit sont ajoutes', () => {
  // Arrange : un settings.json projet avec un hook custom et un deny custom
  const existant = JSON.stringify({
    permissions: { deny: ['Bash(curl projet-interne:*)'] },
    hooks: {
      PreToolUse: [
        {
          matcher: 'Bash',
          hooks: [{ type: 'command', command: 'node scripts/projet-guard.js' }],
        },
      ],
    },
  });

  // Act
  const resultat = mergeJson(existant, SETTINGS_KIT);

  // Assert : fusion reussie
  assert.equal(resultat.status, 'merged', 'la fusion de deux JSON valides doit reussir');
  const fusion = JSON.parse(resultat.content);

  // Le deny projet et le deny kit coexistent
  assert.ok(
    fusion.permissions.deny.includes('Bash(curl projet-interne:*)'),
    'le deny projet doit etre preserve'
  );
  assert.ok(
    fusion.permissions.deny.includes('Bash(rm -rf:*)'),
    'le deny du kit doit etre ajoute'
  );
  assert.ok(
    fusion.permissions.deny.includes('Bash(git push --force:*)'),
    'le second deny du kit doit etre ajoute'
  );

  // Les commandes de hook projet et kit coexistent dans PreToolUse
  const commandes = fusion.hooks.PreToolUse.flatMap((entree) =>
    entree.hooks.map((h) => h.command)
  );
  assert.ok(
    commandes.includes('node scripts/projet-guard.js'),
    'le hook projet doit etre preserve'
  );
  assert.ok(
    commandes.some((c) => c.includes('guard-bash')),
    'le hook du kit doit etre ajoute'
  );
});

test('.mcp.json : le serveur MCP projet est preserve, context7 est ajoute', () => {
  // Arrange : un .mcp.json projet avec un serveur custom
  const existant = JSON.stringify({
    mcpServers: {
      'mon-serveur': { command: 'node', args: ['./mcp/mon-serveur.js'] },
    },
  });

  // Act
  const resultat = mergeJson(existant, MCP_KIT);

  // Assert
  assert.equal(resultat.status, 'merged', 'la fusion de deux JSON valides doit reussir');
  const fusion = JSON.parse(resultat.content);

  assert.ok(fusion.mcpServers['mon-serveur'], 'le serveur MCP projet doit etre preserve');
  assert.ok(fusion.mcpServers.context7, 'le serveur context7 du kit doit etre ajoute');
});

test('idempotence : fusionner deux fois avec le meme kit ne cree pas de doublon', () => {
  // Arrange : un settings.json projet
  const existant = JSON.stringify({
    permissions: { deny: ['Bash(curl projet-interne:*)'] },
    hooks: {
      PreToolUse: [
        {
          matcher: 'Bash',
          hooks: [{ type: 'command', command: 'node scripts/projet-guard.js' }],
        },
      ],
    },
  });

  // Act : premiere fusion, puis seconde fusion du resultat avec le meme kit
  const uneFois = mergeJson(existant, SETTINGS_KIT);
  const deuxFois = mergeJson(uneFois.content, SETTINGS_KIT);

  // Assert : la seconde fusion est identique a la premiere (aucune entree dupliquee)
  assert.equal(uneFois.status, 'merged', 'la premiere fusion doit reussir');
  assert.equal(deuxFois.status, 'merged', 'la seconde fusion doit reussir');
  assert.equal(
    deuxFois.content,
    uneFois.content,
    'une seconde fusion avec le meme kit ne doit rien changer'
  );

  // Verification explicite : aucun deny en double
  const fusion = JSON.parse(deuxFois.content);
  const denySet = new Set(fusion.permissions.deny);
  assert.equal(
    denySet.size,
    fusion.permissions.deny.length,
    'aucune entree deny ne doit etre dupliquee'
  );

  // Verification explicite : aucune commande de hook en double
  const commandes = fusion.hooks.PreToolUse.flatMap((entree) =>
    entree.hooks.map((h) => h.command)
  );
  const commandesSet = new Set(commandes);
  assert.equal(
    commandesSet.size,
    commandes.length,
    'aucune commande de hook ne doit etre dupliquee'
  );
});

test('JSON cible invalide : aucun crash, resultat « conflit », le contenu existant n\'est pas ecrase', () => {
  // Arrange : un existant qui n'est pas du JSON parsable
  const existant = '{ ceci n\'est pas: du JSON valide';

  // Act
  const resultat = mergeJson(existant, SETTINGS_KIT);

  // Assert : conflit signale, pas de contenu fusionne produit
  assert.equal(
    resultat.status,
    'conflict',
    'un JSON cible invalide doit produire un statut conflit'
  );
  assert.equal(
    resultat.content,
    undefined,
    'aucun contenu fusionne ne doit etre produit en cas de conflit'
  );
});

test('JSON kit invalide : throw avec un message mentionnant le kit (donnee de packaging corrompue = bug, pas conflit)', () => {
  // Arrange : un existant valide mais un kit non parsable
  const existant = '{}';
  const kitInvalide = 'PAS DU JSON';

  // Act + Assert : un kit corrompu est un bug de packaging, il doit faire throw,
  // distinctement du cas « cible invalide -> conflit »
  assert.throws(
    () => mergeJson(existant, kitInvalide),
    /kit/i,
    'un kit non parsable doit faire throw avec un message mentionnant le kit'
  );
});
