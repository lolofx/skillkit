# SkillKit

**Un kit IA prêt à l'emploi pour projets backend .NET, frontend Angular et fullstack.**

Installez SkillKit dans n'importe quel repo existant : votre agent IA connaît immédiatement vos règles d'architecture, suit un workflow structuré, et des garde-fous l'empêchent de commettre du code non testé.

---

## Le problème

Quand vous démarrez un projet avec un agent IA (Claude, Copilot, Codex…), il ne connaît pas :
- votre architecture (hexagonale, DDD, découpages métier)
- vos conventions de code
- votre workflow (comment aller d'une idée à un commit propre)

Résultat : vous le réexpliquez à chaque session, il dérive, et il commit sans tests.

## La solution

SkillKit installe en un commande tout ce qu'il faut pour qu'un agent travaille bien dès la première session :

| Ce qui est installé | Ce que ça fait |
|---|---|
| `AGENTS.md` / `CLAUDE.md` | Contrat de session — l'agent sait qui il est et quelles règles sont non négociables |
| `PROJECT.md` | Fiche projet à remplir une fois : stack, conventions, profil domaine |
| `skillkit/guidelines/` | Règles techniques chargées à la demande (architecture, DDD, TDD, dotnet, angular) |
| `skillkit/skills/` | Workflows réutilisables : brainstorm, spec, plan, revue de code, refactor… |
| `.claude/commands/` | Raccourcis `/tdd`, `/ng-review`, `/ddd-review`, `/commit`… disponibles dans Claude Code |
| `.claude/agents/` | Agents spécialisés : `test-writer` (RED), `backend-implementer` (GREEN+REFACTOR), `backend-reviewer` |
| `.claude/hooks/` | Garde-fous : bloque les commandes destructrices, interdit les commits sans tests verts |

---

## Démarrage rapide

### Prérequis

- Node.js ≥ 18
- `jq` (pour les hooks — `apt install jq` / `brew install jq`)

### Installation du CLI

```bash
# Depuis ce repo
npm link

# Ou en npx (si publié)
npx skillkit
```

### Installer le kit dans un projet

```bash
# Projet backend .NET
skillkit init mon-projet --target backend

# Projet frontend Angular
skillkit init mon-projet --target frontend

# Projet fullstack
skillkit init mon-projet --target all

# Voir ce qui serait installé sans toucher au projet
skillkit init mon-projet --dry-run
```

Ensuite, remplissez `PROJECT.md` (stack, profil domaine, conventions) et lancez votre outil IA — le contexte est prêt.

---

## Le workflow guidé

Une fois installé, l'agent suit ce cycle pour chaque feature :

```
/brainstorm   → clarifie le besoin, propose 2-3 approches, aide à décider
/spec         → rédige specs/<feature>/spec.md (quoi / pourquoi / critères d'acceptation)
/plan         → découpe en étapes — chaque étape = 1 cycle TDD
/tdd          → RED → GREEN → REFACTOR, étape par étape
/review       → review structurée du diff avant merge
/commit       → GATE : refuse si tests non verts ou doc non à jour
```

Un petit fix peut entrer directement en `/tdd` — chaque commande est indépendante.

---

## Cibles d'installation (`--target`)

| Bucket | Contenu |
|---|---|
| `shared` | Toujours installé — TDD, standards, workflow, delivery, hooks, agents test-writer |
| `backend` | Guidelines architecture/DDD/dotnet, skills backend, agents backend-* |
| `frontend` | Guidelines Angular (signals, OnPush, standalone), skills ng-review/ng-explain |

Sans `--target`, la valeur est lue dans `PROJECT.md` (`Type : backend|frontend|fullstack`). Défaut : `all`.

---

## Mise à jour

```bash
# Met à jour skillkit/ depuis le template — vos fichiers hors skillkit/ sont préservés
skillkit update mon-projet
skillkit update mon-projet --target frontend --dry-run
```

---

## Structure du repo

```
AGENTS.md                  ← contrat de session agnostique (la source de vérité)
CLAUDE.md                  ← wrapper Claude Code (inclut AGENTS.md)
PROJECT.md                 ← à remplir : stack, conventions, profil domaine
skillkit/
├─ guidelines/             ← standards, architecture, ddd, tdd, dotnet, angular
├─ skills/
│  ├─ workflow/            ← brainstorm, spec, plan, tdd
│  ├─ backend/             ← ddd-review, file-review, csharp-quality
│  ├─ frontend/            ← ng-review, ng-explain
│  └─ delivery/            ← review, fix-issue, refactor, generate-tests, commit
└─ docs/                   ← intégrations, design, archives
specs/                     ← specs des features (spec.md / plan.md / tasks.md)
.claude/
├─ commands/               ← wrappers /tdd, /ng-review, /ddd-review, /commit…
├─ agents/                 ← test-writer, backend-implementer, backend-reviewer
└─ hooks/                  ← guard-bash, guard-commit, track-tests
```

---

## Les hooks de garde

Trois hooks actifs dès l'installation :

| Hook | Effet |
|---|---|
| `guard-bash` | Bloque `rm -rf`, `git push --force`, `DROP DATABASE` et autres commandes destructrices |
| `track-tests` | Trace chaque exécution de tests (dotnet, node, ng, npm, vitest) |
| `guard-commit` | Bloque `git commit` si aucun run de tests vert récent (≤ 30 min) |

Les hooks s'appliquent automatiquement dans les projets .NET (`*.sln`/`*.csproj`), Node (`*.test.js`) et frontend (`angular.json`/`package.json`).

---

## Compatibilité

SkillKit est conçu pour être **agnostique** : la vérité vit dans `AGENTS.md` et `skillkit/`, lus par n'importe quel outil.

| Outil | Support |
|---|---|
| Claude Code | ✅ Complet — commands, agents, hooks |
| Copilot / Codex / Cursor | ✅ Partiel — `AGENTS.md` + guidelines + skills (pas de hooks natifs) |
| Autre outil | ✅ Tout ce qui lit des fichiers Markdown |

---

## Feuille de route

- [x] Backend .NET — guidelines, skills, agents, hooks
- [x] Frontend Angular — guidelines angular.md, skills ng-review/ng-explain
- [x] CLI `skillkit init/update` avec `--target` et `--dry-run`
- [x] Hooks multi-runner (dotnet, node, ng, npm, vitest)
- [ ] Déclinaison Copilot (`.github/instructions/`)
- [ ] Publication npm (`npx skillkit`)
- [ ] Agents frontend dédiés (`frontend-implementer`, `frontend-reviewer`)
