---
name: tdd
description: Dérouler un cycle TDD complet (RED → GREEN → REFACTOR) sur une étape du plan, en respectant le socle architecture et le profil domaine. Utiliser pour implémenter chaque étape d'un plan, ou tout fix/feature qui touche du code de production.
---

# TDD — dérouler un cycle

## Objectif

Implémenter **une étape** (du plan `specs/<feature>/plan.md`, ou un fix isolé) par un
cycle TDD complet. Les règles de fond sont dans `skillkit/guidelines/tdd.md` — les charger
et les appliquer strictement. Ce skill est le **mode opératoire**.

## Avant de commencer

1. Identifier l'étape : depuis `plan.md`/`tasks.md`, ou reformuler le comportement
   visé si on entre directement (petit fix).
2. Charger `skillkit/guidelines/tdd.md` + `skillkit/guidelines/architecture.md` ;
   `skillkit/guidelines/ddd.md` si le profil du module est « riche » (`PROJECT.md`) ;
   `skillkit/guidelines/dotnet.md` si code C#.
3. Vérifier que la suite de tests existante est **verte** avant de toucher quoi que ce soit.

## Le cycle

### 🔴 RED

1. Écrire **un seul** test — le plus petit qui fasse avancer l'étape
   (scénario décrit dans le plan).
2. Exécuter : vérifier qu'il **échoue pour la bonne raison** (comportement absent),
   pas pour une erreur de setup ou une typo.
3. Mettre à jour `tasks.md` : étape → `red`.

### 🟢 GREEN

1. Écrire le **minimum** de code pour faire passer le test — pas d'anticipation.
2. Placer le code au bon endroit du socle (module métier / use case) et respecter
   le profil domaine.
3. Exécuter **toute la suite** : le nouveau test passe, rien d'autre ne casse.
4. `tasks.md` : étape → `green`.

### 🔵 REFACTOR

1. Nettoyer code **et** tests (nommage, duplication, extraction) sans changer
   le comportement ni les assertions.
2. Suite complète verte après chaque modification.
3. `tasks.md` : étape → `refactored`.

## Travail en équipe d'agents

Si l'environnement fournit des agents séparés (ex. : `test-writer`,
`backend-implementer`) :

- le RED est écrit par l'agent de test, le GREEN/REFACTOR par l'agent d'implémentation ;
- **celui qui écrit le test ne l'implémente pas ; celui qui implémente ne touche pas
  aux tests** — un test jugé faux est signalé, jamais corrigé en douce.

## En sortie de cycle

- Annoncer : étape, test ajouté, fichiers touchés, état de la suite (`X/X verts`).
- Étape suivante du plan → relancer un cycle.
- Plan terminé → proposer `skillkit/skills/delivery/review/` puis `skillkit/skills/delivery/commit/`.

## Garde-fous

- Un test qui passe du premier coup en RED est suspect : investiguer avant de continuer.
- Jamais de code de production sans test rouge préalable — même pour « un fix évident ».
- Jamais d'assertion modifiée pour faire passer un test.
- Bloqué (dépendance manquante, plan ambigu, test impossible à écrire) → s'arrêter
  et demander, pas improviser.
