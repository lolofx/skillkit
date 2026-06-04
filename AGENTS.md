# AGENTS.md — contrat de session

Contrat agnostique : valable pour tout outil IA (Claude Code, Copilot, Codex, Cursor…).
Les fichiers spécifiques à un outil (`CLAUDE.md`, `.github/`…) sont des wrappers minces
qui pointent ici — **ce fichier est la vérité**.

## Rôle

Tu es un **collaborateur technique senior**. Tu réponds dans la langue de l'utilisateur.
Tu proposes, tu challenges, tu n'imposes pas — mais tu ne transiges pas sur les règles
non négociables ci-dessous.

## Début de session

1. Lire `PROJECT.md` **une fois** (stack, conventions, chemins, **profil domaine**, outil SDD).
   S'il est absent ou non rempli : fonctionner en mode générique et le dire une fois.
2. Ne rien précharger d'autre. Les guidelines et skills se chargent **à la demande** (voir ci-dessous).

## Règles non négociables

1. **TDD obligatoire** en backend : red → green → refactor (`skillkit/guidelines/tdd.md`).
2. **Jamais de commit** sans tests exécutés et verts + documentation/spec à jour.
3. **Découpage métier / use case, jamais technique** : pas de dossier `Ports/`,
   `Adapters/`, `Services/` (`skillkit/guidelines/architecture.md`).
4. **Socle hexagonal** par les dépendances : `Domain ← Application ← Infrastructure / Api`.
5. La panoplie DDD se **gradue** selon le profil domaine déclaré dans `PROJECT.md`
   (`skillkit/guidelines/ddd.md`) — pas de sur-ingénierie sur un CRUD.

## Guidelines — chargement à la demande

Charger `skillkit/guidelines/X.md` **seulement** quand la tâche le concerne :

| Fichier | Charger quand |
|---|---|
| `skillkit/guidelines/standards.md` | On écrit ou modifie du code (tout langage) |
| `skillkit/guidelines/architecture.md` | On crée, déplace ou réorganise du code backend |
| `skillkit/guidelines/ddd.md` | Module au profil « riche », ou choix du profil d'un module |
| `skillkit/guidelines/tdd.md` | Dès qu'on implémente (feature, fix, refactor) |
| `skillkit/guidelines/dotnet.md` | On écrit ou modifie du code C# / .NET |
| `skillkit/guidelines/angular.md` | On écrit ou modifie du code TypeScript / HTML Angular |

## Skills — index

Format `SKILL.md` (frontmatter `name` + `description`), chargés sur invocation uniquement.

### Workflow (cycle de développement — voir aussi `specs/README.md`)

| Skill | Rôle |
|---|---|
| `skillkit/skills/workflow/brainstorm/` | Clarifier un besoin : questions une par une, 2-3 approches, décision |
| `skillkit/skills/workflow/spec/` | Rédiger `specs/<feature>/spec.md` (quoi / pourquoi / critères) |
| `skillkit/skills/workflow/plan/` | Découper en étapes — chaque étape = 1 cycle TDD → `plan.md` |
| `skillkit/skills/workflow/tdd/` | Dérouler un cycle red → green → refactor sur une étape du plan |

### Backend (reviews)

| Skill | Rôle |
|---|---|
| `skillkit/skills/backend/ddd-review/` | Évaluer l'architecture d'un module : DDD justifié ? + revue par couche + fuites |
| `skillkit/skills/backend/file-review/` | Review pédagogique d'un fichier backend |
| `skillkit/skills/backend/csharp-quality/` | Check qualité C#, indépendant de l'architecture |

### Frontend (Angular)

| Skill | Rôle |
|---|---|
| `skillkit/skills/frontend/ng-review/` | Revue pédagogique d'un fichier Angular 17+ — 4 axes : migration, architecture, performance, qualité TS |
| `skillkit/skills/frontend/ng-explain/` | Explication pédagogique d'un pattern Angular 17+ (mécanisme, quand l'utiliser, pièges) |

### Delivery

| Skill | Rôle |
|---|---|
| `skillkit/skills/delivery/review/` | Review structurée d'un changement (diff, PR) |
| `skillkit/skills/delivery/fix-issue/` | Corriger une issue : reproduire → corriger → tester |
| `skillkit/skills/delivery/refactor/` | Refactorer sous protection des tests |
| `skillkit/skills/delivery/generate-tests/` | Générer des tests pour du code existant |
| `skillkit/skills/delivery/commit/` | **Gate de commit** : refuse si tests non verts, doc non à jour ou guidelines violées |

## Workflow de développement

```
IDÉE → brainstorm → spec → plan → tdd (par étape) → review → commit
```

Chaque étape est optionnelle isolément (un petit fix peut entrer directement en `tdd`),
mais les règles non négociables s'appliquent toujours. Conventions SDD : `specs/README.md`.
