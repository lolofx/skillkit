# specs/ — conventions SDD du kit

Conventions de spec-driven development **agnostiques**, compatibles avec les outils SDD
du marché (mapping en bas de page). L'outil utilisé par le projet est déclaré dans
`PROJECT.md` (champ « Outil SDD »).

## Structure d'une feature

```
specs/<feature>/
  ├─ spec.md     ← QUOI / POURQUOI : besoin, critères d'acceptation, hors-périmètre, décisions
  ├─ plan.md     ← COMMENT : étapes ordonnées, chaque étape = 1 cycle TDD + critère de done
  └─ tasks.md    ← suivi : étape → statut (à faire / red / green / refactored / reviewed)
```

- `<feature>` : slug court en kebab-case (ex. : `order-cancellation`).
- Les gabarits détaillés sont dans les skills : `skillkit/skills/workflow/spec/` (spec.md)
  et `skillkit/skills/workflow/plan/` (plan.md + tasks.md).
- `tasks.md` est tenu à jour **pendant** l'implémentation — c'est lui que le gate
  de commit (`skillkit/skills/delivery/commit/`) vérifie.

## Cycle de vie

```
/brainstorm  →  décisions
/spec        →  specs/<feature>/spec.md          (statut : brouillon → validée)
/plan        →  specs/<feature>/plan.md + tasks.md
/tdd         →  un cycle par étape, tasks.md mis à jour au fil de l'eau
/review      →  review structurée
/commit      →  gate : tests verts + doc/spec à jour + guidelines respectées
```

## Mapping vers les outils SDD

Une équipe qui adopte un outil SDD remplace `/spec` et `/plan` par les commandes de son
outil — **le reste du kit (TDD, review, gate de commit) reste identique**.

| Convention du kit | OpenSpec | spec-kit | BMAD |
|---|---|---|---|
| `spec.md` | `openspec/changes/<id>/proposal.md` | `/specify` → spec.md | PRD (analyst/PM) |
| `plan.md` | `design.md` + `tasks.md` | `/plan` | architecture + stories |
| `/tdd` par étape | apply | `/implement` | dev agent |

Déclarer le choix dans `PROJECT.md` pour que devs et agents utilisent les bons artefacts.
