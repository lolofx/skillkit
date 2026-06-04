#!/usr/bin/env node
'use strict';

const path = require('node:path');
const { init } = require('../lib/init');
const { update } = require('../lib/update');
const { formatReport } = require('../lib/report');

const racineTemplate = path.join(__dirname, '..', '..');

const rawArgs = process.argv.slice(2);
const flags = rawArgs.filter((a) => a.startsWith('--'));
const positional = rawArgs.filter((a) => !a.startsWith('--'));

const commande = positional[0];
const racineCible = path.resolve(positional[1] ?? process.cwd());
const dryRun = flags.includes('--dry-run');

// --target <val> ou --target=<val>
let targetFlag;
const idxTarget = rawArgs.indexOf('--target');
if (idxTarget !== -1) {
  targetFlag = rawArgs[idxTarget + 1];
} else {
  const eqArg = flags.find((f) => f.startsWith('--target='));
  if (eqArg) targetFlag = eqArg.slice('--target='.length);
}

const commandesConnues = ['init', 'update'];

if (!commande || !commandesConnues.includes(commande)) {
  process.stderr.write(
    'Usage: skillkit <init|update> [cible] [--target backend|frontend|all] [--dry-run]\n' +
    '\n' +
    '  init    Installe le kit skillkit dans le projet cible\n' +
    '  update  Met a jour le dossier skillkit/ depuis le template\n' +
    '\n' +
    'Options:\n' +
    '  --target backend|frontend|all  Installe uniquement le sous-ensemble correspondant\n' +
    '  --dry-run                      Affiche le rapport sans modifier la cible\n'
  );
  process.exit(1);
}

try {
  const actions =
    commande === 'init'
      ? init(racineTemplate, racineCible, { dryRun, target: targetFlag })
      : update(racineTemplate, racineCible, { dryRun, target: targetFlag });
  process.stdout.write(formatReport(actions) + '\n');
} catch (err) {
  process.stderr.write(`Erreur: ${err.message}\n`);
  process.exit(1);
}
