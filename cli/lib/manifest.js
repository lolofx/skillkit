'use strict';

const fs = require('node:fs');
const path = require('node:path');

/**
 * Fichiers exclus par chemin exact (relatif a la racine, separateurs POSIX).
 */
const EXCLUSIONS_EXACTES = new Set([
  'README.md',
  'package.json',
  '.gitignore',
  '.claude/settings.local.json',
]);

/**
 * Dossiers exclus : tout chemin egal au dossier ou prefixe par lui est ecarte.
 */
const PREFIXES_EXCLUS = [
  '.git/',
  '.github/',
  'cli/',
  'node_modules/',
  'skillkit/docs/',
];

/**
 * Regles de bucket, evaluees dans l'ordre : la premiere qui matche gagne.
 * `shared` = installe quelle que soit la cible ; `backend` / `frontend` = filtre.
 *
 * @type {Array<{ bucket: string, matche: (p: string) => boolean }>}
 */
const REGLES_BUCKET = [
  { bucket: 'frontend', matche: (p) => p.startsWith('skillkit/skills/frontend/') },
  { bucket: 'backend', matche: (p) => p.startsWith('skillkit/skills/backend/') },
  { bucket: 'frontend', matche: (p) => p === 'skillkit/guidelines/angular.md' },
  {
    bucket: 'backend',
    matche: (p) =>
      p === 'skillkit/guidelines/architecture.md' ||
      p === 'skillkit/guidelines/ddd.md' ||
      p === 'skillkit/guidelines/dotnet.md',
  },
  {
    bucket: 'frontend',
    matche: (p) => p === '.claude/commands/ng-review.md' || p === '.claude/commands/ng-explain.md',
  },
  {
    bucket: 'backend',
    matche: (p) =>
      p === '.claude/commands/ddd-review.md' ||
      p === '.claude/commands/file-review.md' ||
      p === '.claude/commands/csharp-quality.md',
  },
  {
    bucket: 'backend',
    matche: (p) =>
      p === '.claude/agents/backend-implementer.md' || p === '.claude/agents/backend-reviewer.md',
  },
  { bucket: 'shared', matche: () => true },
];

/**
 * Regles de strategie, evaluees dans l'ordre : la premiere qui matche gagne.
 * Chaque regle indique pour quels chemins elle s'applique et la strategie a
 * associer. La derniere regle (catch-all) couvre le reste du kit en `copy`.
 *
 * @type {Array<{ strategy: string, matche: (relatif: string) => boolean }>}
 */
const REGLES = [
  {
    strategy: 'merge-markdown',
    matche: (relatif) => relatif === 'CLAUDE.md' || relatif === 'AGENTS.md',
  },
  {
    strategy: 'merge-json',
    matche: (relatif) => relatif === '.claude/settings.json' || relatif === '.mcp.json',
  },
  {
    strategy: 'copy-if-absent',
    matche: (relatif) => relatif === 'PROJECT.md' || relatif === 'specs/README.md',
  },
  {
    strategy: 'copy',
    matche: () => true,
  },
];

/**
 * Construit le manifest du kit en scannant le template sur disque (lecture
 * seule). Retourne, pour chaque fichier retenu, son chemin relatif a la racine
 * (separateurs POSIX) et la strategie d'installation associee.
 *
 * @param {string} racineTemplate Chemin absolu de la racine du template.
 * @returns {Array<{ path: string, strategy: string }>}
 */
function buildManifest(racineTemplate) {
  const fichiers = lister(racineTemplate, racineTemplate);

  const manifest = [];
  for (const relatif of fichiers) {
    if (estExclu(relatif)) {
      continue;
    }
    const regle = REGLES.find((r) => r.matche(relatif));
    const regleBucket = REGLES_BUCKET.find((r) => r.matche(relatif));
    manifest.push({ path: relatif, strategy: regle.strategy, bucket: regleBucket.bucket });
  }

  return manifest;
}

/**
 * Liste recursivement tous les fichiers sous un dossier, en chemins relatifs a
 * la racine et separateurs POSIX. Aucun tri ni filtrage : c'est le role des
 * regles d'exclusion en aval.
 *
 * @param {string} dossier Dossier courant a parcourir (absolu).
 * @param {string} racine Racine du template (absolue) pour calculer le relatif.
 * @returns {string[]}
 */
function lister(dossier, racine) {
  const resultat = [];
  for (const entree of fs.readdirSync(dossier, { withFileTypes: true })) {
    const absolu = path.join(dossier, entree.name);
    if (entree.isDirectory()) {
      resultat.push(...lister(absolu, racine));
    } else if (entree.isFile()) {
      resultat.push(versPosix(path.relative(racine, absolu)));
    }
  }
  return resultat;
}

/**
 * Indique si un chemin relatif doit etre ecarte du manifest.
 *
 * @param {string} relatif
 * @returns {boolean}
 */
function estExclu(relatif) {
  if (EXCLUSIONS_EXACTES.has(relatif)) {
    return true;
  }

  if (PREFIXES_EXCLUS.some((prefixe) => relatif.startsWith(prefixe))) {
    return true;
  }

  // specs/ : seul specs/README.md est conserve.
  if (relatif.startsWith('specs/') && relatif !== 'specs/README.md') {
    return true;
  }

  // skillkit/skills/ : seuls les SKILL.md sont retenus (les reliquats v1 et les
  // fichiers annexes comme agents/*.yaml sont ecartes).
  if (relatif.startsWith('skillkit/skills/') && !relatif.endsWith('/SKILL.md')) {
    return true;
  }

  return false;
}

/**
 * Convertit un chemin natif (potentiellement avec des backslashes Windows) en
 * chemin a separateurs POSIX.
 *
 * @param {string} chemin
 * @returns {string}
 */
function versPosix(chemin) {
  return chemin.split(path.sep).join('/');
}

/**
 * Retourne le bucket d'un chemin relatif : 'shared', 'backend' ou 'frontend'.
 *
 * @param {string} chemin Chemin relatif POSIX.
 * @returns {'shared'|'backend'|'frontend'}
 */
function classifyBucket(chemin) {
  return REGLES_BUCKET.find((r) => r.matche(chemin)).bucket;
}

/**
 * Filtre le manifest selon le target demande.
 * - 'backend'  → shared + backend
 * - 'frontend' → shared + frontend
 * - 'all'      → tout (inchange)
 *
 * @param {Array<{ path: string, strategy: string, bucket: string }>} manifest
 * @param {'backend'|'frontend'|'all'} target
 * @returns {Array<{ path: string, strategy: string, bucket: string }>}
 */
function filterByTarget(manifest, target) {
  if (target === 'all') return manifest;
  return manifest.filter((e) => e.bucket === 'shared' || e.bucket === target);
}

const VALID_TARGETS = new Set(['backend', 'frontend', 'all']);
const PROJECT_MD_TYPE_MAP = { backend: 'backend', frontend: 'frontend', fullstack: 'all' };

/**
 * Resout le target final selon la precedence : flag > PROJECT.md > defaut.
 *
 * @param {{ flag?: string, projectMd?: string }} opts
 * @returns {'backend'|'frontend'|'all'}
 * @throws {Error} Si flag est fourni mais invalide.
 */
function resolveTarget({ flag, projectMd } = {}) {
  if (flag !== undefined) {
    if (!VALID_TARGETS.has(flag)) {
      throw new Error(
        `--target invalide : "${flag}". Valeurs attendues : backend, frontend, all.`
      );
    }
    return flag;
  }
  if (projectMd) {
    const match = projectMd.match(/Type\s*:\s*(backend|frontend|fullstack)/);
    if (match) {
      return PROJECT_MD_TYPE_MAP[match[1]];
    }
  }
  return 'all';
}

/**
 * Lit PROJECT.md dans un dossier cible et retourne son contenu, ou undefined.
 *
 * @param {string} racineCible Chemin absolu du dossier cible.
 * @returns {string|undefined}
 */
function lireProjectMd(racineCible) {
  const p = path.join(racineCible, 'PROJECT.md');
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : undefined;
}

module.exports = { buildManifest, classifyBucket, filterByTarget, resolveTarget, lireProjectMd };
