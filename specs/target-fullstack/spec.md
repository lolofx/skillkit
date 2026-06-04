# Spec — SkillKit fullstack & `--target`

> Statut : validée
> Date : 2026-06-04

## Besoin

Le kit ne sert aujourd'hui que le backend .NET. On veut qu'il serve aussi le
**frontend Angular** et les projets **fullstack** (back + front). À l'installation, le
dev ne doit recevoir que ce qui concerne sa stack (`--target`). Au runtime, l'agent IA
doit savoir s'il travaille sur du back ou du front pour charger les bons guidelines et
skills. Valeur : un seul template pour les trois types de projets, sans bruit ni règles
hors-sujet.

## Comportement attendu

### Classification en 3 buckets

Chaque fichier du kit appartient à un bucket : `shared`, `backend` ou `frontend`.

- **shared** — tronc commun, toujours installé quelle que soit la cible : `AGENTS.md`,
  `CLAUDE.md`, `PROJECT.md`, `.mcp.json`, `specs/README.md`, `guidelines/standards.md`,
  `guidelines/tdd.md`, `skills/workflow/**`, `skills/delivery/**`, `.claude/settings.json`,
  les commands de workflow/delivery, l'agent `test-writer`, les hooks.
- **backend** — `guidelines/architecture.md`, `guidelines/ddd.md`, `guidelines/dotnet.md`,
  `skills/backend/**`, les commands `ddd-review`/`file-review`/`csharp-quality`, les agents
  `backend-implementer`/`backend-reviewer`.
- **frontend** — `guidelines/angular.md` (nouveau), `skills/frontend/**` (convertis au format
  `SKILL.md`), les commands `ng-review`/`ng-explain` (nouveaux).

### Flag `--target`

`skillkit init|update [cible] [--target backend|frontend|all] [--dry-run]`

- `--target backend` → installe `shared` + `backend`.
- `--target frontend` → installe `shared` + `frontend`.
- `--target all` → installe tout (`shared` + `backend` + `frontend`).
- **Sans `--target`** : la valeur est lue dans `PROJECT.md` (champ `Type projet`). Si
  `PROJECT.md` est absent de la cible ou le champ non renseigné → défaut `all`.
- `--target` fourni explicitement **prime** sur `PROJECT.md`.
- Valeur de `--target` invalide → erreur explicite, exit ≠ 0, rien écrit.

### `PROJECT.md` — champ `Type projet`

Nouveau champ dans le gabarit `PROJECT.md` :

```
## Type projet
- Type : {backend | frontend | fullstack}
```

Correspondance install : `backend`→backend, `frontend`→frontend, `fullstack`→all.
Ce champ sert aussi au runtime : l'agent le lit pour savoir quelle(s) stack(s) sont en
jeu, et combine avec l'extension du fichier touché (`.cs`→backend, `.ts`/`.html`→frontend).

### Hooks multi-runner

`track-tests` et `guard-commit` reconnaissent les suites de test frontend en plus du
backend :

- backend : `dotnet test`, `node --test` (déjà supporté)
- frontend : `ng test`, `npm test` / `npm run test`, `vitest`, `jest`

Détection du type de projet par le gate : présence de `*.sln`/`*.csproj` (backend) et/ou
`angular.json`/`package.json` côté front. Dans un projet où une suite reconnue existe, le
commit reste refusé sans run vert récent de cette suite.

### Contenu frontend

- `skills/frontend/ng-review.md` et `ng-explain.md` sont convertis au format `SKILL.md`
  (frontmatter `name` + `description` uniquement), francisés, et déplacés en
  `skills/frontend/ng-review/SKILL.md` et `skills/frontend/ng-explain/SKILL.md`.
- `guidelines/angular.md` est créé (équivalent frontend de `dotnet.md` : signals, OnPush,
  standalone, `inject()`, qualité TS).
- `.claude/commands/ng-review.md` et `ng-explain.md` sont créés (wrappers minces).

## Critères d'acceptation

### CLI & parsing

- [ ] Étant donné `--target backend`, quand `init`, alors seuls les fichiers `shared` +
      `backend` sont planifiés ; aucun fichier `frontend`.
- [ ] Étant donné `--target frontend`, quand `init`, alors seuls `shared` + `frontend` ;
      aucun fichier `backend`.
- [ ] Étant donné `--target all`, quand `init`, alors tous les fichiers (comportement actuel).
- [ ] Étant donné aucun `--target` et un `PROJECT.md` cible avec `Type : backend`, quand
      `init`, alors `shared` + `backend`.
- [ ] Étant donné aucun `--target` et aucun `PROJECT.md` dans la cible, quand `init`, alors
      `all` (défaut rétro-compatible).
- [ ] Étant donné `--target backend` ET un `PROJECT.md` cible disant `frontend`, quand
      `init`, alors `--target` prime → `shared` + `backend`.
- [ ] Étant donné `--target zorglub` (invalide), quand `init`, alors message d'erreur, exit
      ≠ 0, cible inchangée.
- [ ] `update --target frontend` ne met à jour que les fichiers `shared` + `frontend` sous
      `skillkit/`.

### Classification

- [ ] Chaque fichier du manifest porte un bucket `shared|backend|frontend`.
- [ ] `guidelines/tdd.md` et `guidelines/standards.md` sont `shared`.
- [ ] `guidelines/architecture.md`, `ddd.md`, `dotnet.md` sont `backend`.
- [ ] `guidelines/angular.md` et `skills/frontend/**/SKILL.md` sont `frontend`.
- [ ] `skills/workflow/**` et `skills/delivery/**` sont `shared`.

### Contenu frontend

- [ ] `skills/frontend/ng-review/SKILL.md` existe, frontmatter = `name` + `description`
      seulement (plus de `trigger`/`version`/`stack`), contenu en français.
- [ ] `skills/frontend/ng-explain/SKILL.md` idem.
- [ ] `guidelines/angular.md` existe.
- [ ] `.claude/commands/ng-review.md` et `ng-explain.md` existent (wrappers).
- [ ] Les anciens `skills/frontend/ng-review.md` / `ng-explain.md` (format obsolète) ne
      sont plus présents.

### Hooks

- [ ] `track-tests` écrit un marqueur vert après un `ng test` réussi.
- [ ] `track-tests` écrit un marqueur vert après un `npm test` / `vitest` réussi.
- [ ] `guard-commit` refuse le commit dans un projet frontend sans run frontend vert récent.
- [ ] Le comportement backend existant (`dotnet test`, `node --test`) est inchangé.

## Hors périmètre

- La structure du **code source du projet cible** (`src/backend`, `src/frontend`…) : c'est
  une décision du dev, le kit n'impose rien.
- **Agents frontend dédiés** (`frontend-implementer`, `frontend-reviewer`) : non créés cette
  itération. `test-writer` (shared) couvre le RED des deux stacks ; les agents
  `backend-*` restent backend. Pendant frontend = itération ultérieure.
- Déclinaison Copilot `.github/instructions/` : reste un placeholder.
- Publication npm / `npx skillkit` global : `private: true` conservé tant que non éprouvé.

## Décisions

- **3 buckets `shared`/`backend`/`frontend`** (brainstorm) — pas de duplication du tronc
  commun, classification par chemin dans `manifest.js`.
- **`PROJECT.md` source unique** (brainstorm) — un seul endroit pour install ET runtime.
- **`--target` prime sur `PROJECT.md`** — permet de forcer ponctuellement sans éditer le fichier.
- **Défaut `all` si `PROJECT.md` absent** — rétro-compatibilité stricte avec l'existant.
- **Classification par chemin, pas par frontmatter** — moins de fichiers touchés, table
  centralisée et testable.
- **Agents frontend hors périmètre** — éviter une session trop lourde ; `test-writer` est
  déjà agnostique.

## Questions ouvertes

_(toutes tranchées à la validation de la spec)_

- ~~**Gate fullstack**~~ → **tranché** : un run vert d'une suite reconnue suffit pour cette
  itération (comportement actuel étendu). Durcissement « back ET front verts » = itération
  ultérieure.
- ~~**Détection du runner frontend**~~ → **tranché** : reconnaissance par la commande
  exécutée (`ng test`, `npm test`, `vitest`, `jest`), comme pour le backend — pas de lecture
  de `angular.json`.
