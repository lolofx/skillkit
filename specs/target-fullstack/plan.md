# Plan — SkillKit fullstack & `--target`

> Spec : ./spec.md
> Profil domaine : n/a (outillage CLI Node, pas de domaine métier — TDD via `node --test`)

Ordre : cœur CLI pur (testable sans disque) → câblage → contenu frontend → hooks.
Chaque étape = un cycle TDD complet. Les `.ps1` sont mis à jour pour parité dans le même
GREEN que leur `.sh` (la parité n'est pas testée sous Linux — limitation assumée, cohérente
avec l'existant).

## Étape 1 — Classifier un chemin en bucket

- **Test (RED)** : une fonction pure `classifyBucket(path)` retourne `shared` / `backend` /
  `frontend` pour des chemins représentatifs : `guidelines/tdd.md`→shared,
  `guidelines/standards.md`→shared, `guidelines/architecture.md`→backend,
  `guidelines/ddd.md`→backend, `guidelines/dotnet.md`→backend, `guidelines/angular.md`→frontend,
  `skillkit/skills/frontend/ng-review/SKILL.md`→frontend, `skillkit/skills/backend/...`→backend,
  `skillkit/skills/workflow/...`→shared, `skillkit/skills/delivery/...`→shared,
  `.claude/commands/ddd-review.md`→backend, `.claude/commands/ng-review.md`→frontend,
  `.claude/commands/commit.md`→shared, `.claude/agents/test-writer.md`→shared,
  `.claude/agents/backend-implementer.md`→backend, `.claude/hooks/...`→shared, `AGENTS.md`→shared.
- **Implémentation (GREEN)** : table de règles ordonnées dans `cli/lib/manifest.js`
  (fonction pure, sans accès disque). `buildManifest` ajoute le champ `bucket` à chaque entrée.
- **Done quand** : test classifier vert ; `buildManifest` retourne des entrées
  `{ path, strategy, bucket }` ; les 36 tests existants restent verts.

## Étape 2 — Filtrer le manifest par target

- **Test (RED)** : fonction pure `filterByTarget(manifest, target)` — `backend` → entrées
  `shared`+`backend` (aucune `frontend`) ; `frontend` → `shared`+`frontend` (aucune `backend`) ;
  `all` → toutes les entrées, inchangées.
- **Implémentation (GREEN)** : `filterByTarget` dans `manifest.js` (ou module dédié).
- **Done quand** : les trois cas verts.

## Étape 3 — Résoudre le target (précédence) + champ PROJECT.md

- **Test (RED)** : fonction pure `resolveTarget({ flag, projectMd })` —
  flag `backend|frontend|all` prime toujours ; flag absent + `projectMd` contenant
  `Type : backend` → `backend`, `fullstack` → `all`, `frontend` → `frontend` ; flag absent +
  `projectMd` undefined ou champ absent → `all` ; flag invalide (`zorglub`) → throw avec message.
- **Implémentation (GREEN)** : `resolveTarget` ; mapping `fullstack`→`all`. Ajout du champ
  `## Type projet` au gabarit `PROJECT.md` du template (lu côté cible au runtime/install).
  Un test vérifie que le gabarit `PROJECT.md` déclare bien le champ `Type`.
- **Done quand** : précédence et cas d'erreur verts ; `PROJECT.md` du template porte le champ.

## Étape 4 — Câbler `--target` dans init / update / CLI + README

- **Test (RED)** : via `init()`/`update()` et `runCli` sur cible temporaire —
  `init` avec `{ target: 'backend' }` ne crée aucun fichier `frontend` ;
  `init` sans target et sans `PROJECT.md` cible crée tout (rétro-compat) ;
  `init` sans target avec `PROJECT.md` cible `Type : backend` → pas de `frontend` ;
  `update` avec `target: 'frontend'` ne touche que `shared`+`frontend` sous `skillkit/` ;
  `runCli('init', cible, '--target', 'zorglub')` → exit ≠ 0, cible inchangée.
- **Implémentation (GREEN)** : `init.js`/`update.js` acceptent `{ target }`, résolvent via
  `resolveTarget` (flag + `PROJECT.md` cible) et filtrent le manifest. `bin/skillkit.js` parse
  `--target <val>` et `--target=<val>`, appelle `resolveTarget`, gère l'erreur → exit 1.
  Mise à jour `README.md` : usage `--target`, tableau des buckets.
- **Done quand** : tous les cas CLI verts ; README documente `--target` ; 36 tests existants verts.

## Étape 5 — Convertir les skills frontend en `SKILL.md` (français)

- **Test (RED)** : `skillkit/skills/frontend/ng-review/SKILL.md` et
  `.../ng-explain/SKILL.md` existent ; frontmatter limité à `name` + `description` (absence de
  `trigger:`, `version:`, `stack:`, `args:`) ; contenu en français (présence de marqueurs FR) ;
  les anciens `skillkit/skills/frontend/ng-review.md` / `ng-explain.md` n'existent plus.
- **Implémentation (GREEN)** : convertir et franciser le contenu existant (déjà riche),
  déplacer en `ng-review/SKILL.md` et `ng-explain/SKILL.md`, supprimer les `.md` obsolètes.
- **Done quand** : tests de format/présence verts ; manifest (étape 1) classe ces fichiers
  `frontend` et les inclut (ce sont des `*/SKILL.md`).

## Étape 6 — `guidelines/angular.md` + commands frontend

- **Test (RED)** : `skillkit/guidelines/angular.md` existe ;
  `.claude/commands/ng-review.md` et `.claude/commands/ng-explain.md` existent et sont des
  wrappers minces (référencent le SKILL canonique).
- **Implémentation (GREEN)** : rédiger `angular.md` (signals, OnPush, standalone, `inject()`,
  qualité TS — pendant frontend de `dotnet.md`) ; écrire les deux commands wrappers.
  Mise à jour de l'index `AGENTS.md` (section skills frontend) et `CLAUDE.md` (table commands).
- **Done quand** : présence vérifiée ; index à jour.

## Étape 7 — `track-tests` reconnaît les runners frontend

- **Test (RED)** : test `node --test` qui *spawn* `bash .claude/hooks/track-tests.sh` avec un
  payload JSON simulant `ng test` (puis `npm test`, `vitest`) à sortie réussie → marqueur
  `.claude/.last-test-run` écrit avec `PASS` ; payload à sortie en échec → `FAIL`.
- **Implémentation (GREEN)** : étendre le pattern de commande et la détection de résultat dans
  `track-tests.sh` (et `.ps1` en parité). Backend (`dotnet test`, `node --test`) inchangé.
- **Done quand** : marqueur correct pour `ng test`/`npm test`/`vitest` ; cas backend non régressés.

## Étape 8 — `guard-commit` reconnaît une suite frontend

- **Test (RED)** : test `node --test` qui *spawn* `bash .claude/hooks/guard-commit.sh` dans une
  cible temporaire (repo git minimal avec `angular.json`/`package.json` ou `*.test.ts`) +
  payload `git commit` → `deny` si aucun marqueur vert récent ; `allow` (exit 0 sans deny) après
  marqueur frontend vert récent. Cas backend (`*.csproj`) inchangé.
- **Implémentation (GREEN)** : détecter un projet frontend (présence `angular.json` /
  `package.json`) et nommer la suite attendue (`ng test` / `npm test`) dans `guard-commit.sh`
  (et `.ps1` en parité). Gate souple : un run vert d'une suite reconnue suffit (cf. décision spec).
- **Done quand** : deny/allow corrects côté frontend ; comportement backend non régressé.

## Couverture des critères d'acceptation

| Critère (spec.md) | Étape(s) |
|---|---|
| `--target backend` → shared+backend | 2, 4 |
| `--target frontend` → shared+frontend | 2, 4 |
| `--target all` → tout | 2, 4 |
| sans target + PROJECT.md backend → shared+backend | 3, 4 |
| sans target + sans PROJECT.md → all | 3, 4 |
| `--target` prime sur PROJECT.md | 3, 4 |
| `--target` invalide → erreur, exit≠0 | 3, 4 |
| `update --target frontend` filtré | 2, 4 |
| chaque fichier porte un bucket | 1 |
| tdd.md / standards.md = shared | 1 |
| architecture/ddd/dotnet = backend | 1 |
| angular.md + skills/frontend = frontend | 1 |
| workflow/delivery = shared | 1 |
| ng-review/SKILL.md format + FR | 5 |
| ng-explain/SKILL.md format + FR | 5 |
| angular.md existe | 6 |
| commands ng-review/ng-explain | 6 |
| anciens ng-*.md supprimés | 5 |
| track-tests : ng test → PASS | 7 |
| track-tests : npm test/vitest → PASS | 7 |
| guard-commit refuse sans run front vert | 8 |
| backend (dotnet/node) inchangé | 7, 8 |
