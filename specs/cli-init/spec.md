# Spec — CLI `skillkit init` (package npm local)

> Statut : validée
> Date : 2026-06-04

## Besoin

Aujourd'hui, installer le kit dans un projet consiste à copier des fichiers à la main
depuis le repo template — fastidieux, source d'oublis (un hook, le `.mcp.json`…) et
impossible à rejouer proprement quand le kit évolue. On veut une commande unique,
`npx skillkit init`, exécutable depuis n'importe quel projet, qui installe ou met à
jour le kit **sans jamais écraser le travail du projet hôte**. Le package reste
**local** (pas de publication npm) : il est rendu disponible une fois via `npm link`
depuis le repo skillkit.

## Comportement attendu

### Installation du package (une fois, sur le poste)

```
cd <repo skillkit> && npm link
```

Ensuite, depuis n'importe quel projet : `npx skillkit init` (ou `skillkit init`).

### `skillkit init` — projet vierge

Depuis la racine d'un projet cible, la commande copie le kit complet :

| Élément | Contenu |
|---|---|
| `skillkit/` | guidelines + skills (`docs/` exclu en totalité — historique et doc du template, pas du kit) |
| `.claude/` | commands, agents, hooks, `settings.json` |
| `AGENTS.md`, `CLAUDE.md`, `PROJECT.md` | fichiers racine du contrat |
| `specs/README.md` | conventions SDD |
| `.mcp.json` | context7 pré-configuré |

Ne sont **jamais** copiés : `.git/`, `README.md` (celui du template parle du template,
pas du projet hôte), `.github/` (placeholder sans valeur hors template), `specs/*/`
(specs vivantes du repo skillkit), `package.json`/code du CLI lui-même.

En fin d'exécution, la commande affiche un **rapport** : fichiers créés, fusionnés,
ignorés (et pourquoi).

### `skillkit init` — projet existant : fusion, jamais d'écrasement

Principe : **le contenu du projet hôte est intouchable**. Trois stratégies selon le fichier :

| Fichier existant | Stratégie |
|---|---|
| `CLAUDE.md`, `AGENTS.md` | **Fusion par bloc délimité** : le contenu du kit est ajouté entre des marqueurs `<!-- skillkit:start -->` / `<!-- skillkit:end -->`, le contenu existant est préservé. Si les marqueurs existent déjà, seul leur contenu est remplacé (idempotence). |
| `.claude/settings.json`, `.mcp.json` | **Fusion JSON** : les hooks, `permissions.deny` et serveurs MCP du kit sont ajoutés sans supprimer ni modifier les entrées existantes. Pas de doublon si déjà présents. |
| `PROJECT.md` | **Jamais touché** s'il existe (il appartient au projet, rempli par l'équipe). Copié seulement s'il est absent. |
| `specs/README.md` | Copié seulement s'il est absent. |
| Fichiers du kit identiques (`.claude/commands/*`, `skillkit/**`…) | Rien à faire, signalé « à jour ». |
| Fichiers du kit **modifiés localement** (hors `skillkit/`) | **Non écrasés** : signalés en conflit dans le rapport, résolution manuelle. |

### `skillkit update` — mise à jour du kit

Réécrase **uniquement** le dossier `skillkit/` (la frontière kit ↔ projet) avec la
version courante du template. Tout le reste (`.claude/`, fichiers racine, `specs/`)
n'est pas touché — le rapport signale si ces fichiers divergent du template, à titre
informatif.

### `--dry-run` — simulation

Disponible sur `init` et `update` : affiche le rapport complet (créé / fusionné /
ignoré / à jour / conflit) **sans rien écrire** dans la cible.

### Erreurs

- Cible sans droits d'écriture, ou chemin inexistant → message d'erreur explicite, code de sortie ≠ 0, aucune écriture partielle.
- `update` dans un projet sans dossier `skillkit/` → erreur explicite (« lancez d'abord init »).

## Critères d'acceptation

### Init — projet vierge

- [ ] Étant donné un dossier cible vide, quand on lance `skillkit init`, alors `skillkit/` (guidelines + skills), `.claude/` (commands, agents, hooks, settings.json), `AGENTS.md`, `CLAUDE.md`, `PROJECT.md`, `specs/README.md` et `.mcp.json` existent dans la cible.
- [ ] Étant donné un init terminé, alors ni `README.md`, ni `.git/`, ni `.github/`, ni `skillkit/docs/`, ni les `specs/<feature>/` du template ne sont présents dans la cible.
- [ ] Étant donné un init terminé, alors le rapport liste chaque fichier avec son statut (créé / fusionné / ignoré / à jour / conflit).

### Init — fusion

- [ ] Étant donné une cible avec un `CLAUDE.md` contenant du texte projet, quand on lance `init`, alors ce texte est intégralement préservé et le bloc kit est présent entre les marqueurs.
- [ ] Étant donné un init déjà exécuté, quand on relance `init`, alors aucun fichier n'est dupliqué et le contenu est identique (idempotence) — les blocs marqués sont remplacés, pas réajoutés.
- [ ] Étant donné un `.claude/settings.json` existant avec un hook propre au projet, quand on lance `init`, alors ce hook est conservé et les hooks du kit sont ajoutés.
- [ ] Étant donné un `.mcp.json` existant avec un serveur MCP propre au projet, quand on lance `init`, alors ce serveur est conservé et context7 est ajouté.
- [ ] Étant donné un `PROJECT.md` existant rempli, quand on lance `init`, alors il est strictement identique avant/après.
- [ ] Étant donné un `.claude/commands/tdd.md` modifié localement, quand on lance `init`, alors il n'est pas écrasé et le rapport le signale en conflit.

### Update

- [ ] Étant donné un projet initialisé dont `skillkit/guidelines/tdd.md` a divergé du template, quand on lance `update`, alors le fichier est remplacé par la version du template.
- [ ] Étant donné un projet initialisé dont `CLAUDE.md` et `.claude/hooks/` ont été personnalisés, quand on lance `update`, alors ces fichiers sont strictement identiques avant/après.
- [ ] Étant donné une cible sans dossier `skillkit/`, quand on lance `update`, alors la commande échoue avec un message explicite et ne crée rien.

### Dry-run

- [ ] Étant donné une cible quelconque, quand on lance `init --dry-run` ou `update --dry-run`, alors le rapport est affiché et **aucun** fichier n'est créé, modifié ou supprimé dans la cible.

### Erreurs

- [ ] Étant donné une cible non inscriptible, quand on lance `init`, alors code de sortie ≠ 0 et message explicite.

## Hors périmètre

- Publication sur le registry npm (le package reste local, `npm link` uniquement).
- Commandes `add` / `remove` / `publish` / gestion de skills à l'unité (vision spec-cli-v0, archivée).
- Option `--tool copilot|codex` : l'argument pourra exister plus tard, v1 = déclinaison Claude Code uniquement.
- Mise à jour automatique de `.claude/` ou des fichiers racine lors d'un `update` (résolution manuelle assumée).
- Scaffolding .NET (le kit reste AI-layer only, cf. design template-backend).
- Interface interactive (prompts) : v1 = flags uniquement.

## Décisions

- **Fusion plutôt qu'écrasement ou skip** pour les fichiers partagés (CLAUDE.md, settings.json, .mcp.json) — c'est le seul comportement sûr dans un projet existant. (Décidé en session, 2026-06-04.)
- **`npm link` une fois, puis `npx skillkit init` partout** — plus confortable qu'un chemin absolu à chaque invocation. (Décidé en session.)
- **Commande dédiée `skillkit update`**, qui ne touche que `skillkit/` — la frontière kit ↔ projet de l'addendum du design rend l'opération sans risque. (Décidé en session.)
- **`--dry-run` dès la v1** sur `init` et `update` — peu coûteux, rassurant sur un projet existant. (Décidé en session.)
- **`skillkit/docs/` exclu en totalité** de la copie — la doc (design, archive, integrations) appartient au template, pas au projet hôte. (Décidé en session.)
- **Marqueurs de bloc** (`<!-- skillkit:start/end -->`) pour la fusion Markdown — rend l'init idempotent et prépare un éventuel update de ces blocs plus tard.
- **Zéro dépendance npm** visée : Node ≥ 18 (`fs.cp`, `node:test`) suffit — cohérent avec l'esprit « wrappers minces, pas de machinerie ».

## Questions ouvertes

- Aucune.
