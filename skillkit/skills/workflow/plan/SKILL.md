---
name: plan
description: Découper une feature spécifiée en étapes ordonnées dans specs/<feature>/plan.md — chaque étape = 1 cycle TDD avec son critère de done — et initialiser tasks.md pour le suivi. Utiliser après une spec validée, avant l'implémentation.
---

# Plan

## Objectif

Transformer une spec validée en **plan d'implémentation exécutable** :
`specs/<feature>/plan.md`. Le plan dit **COMMENT**, en étapes ordonnées où
**chaque étape = un cycle TDD complet** (red → green → refactor) avec un critère
de done vérifiable.

## Déroulé

1. **Relire la spec** (`specs/<feature>/spec.md`). Pas de spec ? Proposer
   `skillkit/skills/workflow/spec/` d'abord. Des questions ouvertes bloquantes ? Les lever.
2. **Lire le contexte technique** : `PROJECT.md` (chemins, profil domaine),
   `skillkit/guidelines/architecture.md` pour situer le code dans le socle,
   `skillkit/guidelines/ddd.md` si profil riche.
3. **Découper en étapes** :
   - chaque étape produit un comportement testable — elle commence par un test ;
   - une étape = petite (un cycle TDD, pas une journée) ;
   - ordonnées par dépendance : domaine → application → infrastructure → api,
     ou par valeur (le chemin nominal d'abord, les cas d'erreur ensuite) ;
   - chaque critère d'acceptation de la spec est couvert par au moins une étape.
4. **Écrire `plan.md`** (gabarit ci-dessous) et **initialiser `tasks.md`**.
5. **Faire valider** le plan avant de lancer l'implémentation (`skillkit/skills/workflow/tdd/`).

## Gabarit de `specs/<feature>/plan.md`

```markdown
# Plan — {nom de la feature}

> Spec : ./spec.md
> Profil domaine : {simple | riche} (cf. PROJECT.md)

## Étape 1 — {comportement visé}

- **Test (RED)** : {le scénario du test à écrire — ce qu'il vérifie}
- **Implémentation (GREEN)** : {où vit le code : module/couche/fichiers pressentis}
- **Done quand** : {critère vérifiable — test vert + condition}

## Étape 2 — {comportement visé}
...

## Couverture des critères d'acceptation

| Critère (spec.md) | Étape(s) |
|---|---|
| {critère 1} | 1, 2 |
```

## Gabarit de `specs/<feature>/tasks.md`

```markdown
# Suivi — {nom de la feature}

| # | Étape | Statut |
|---|---|---|
| 1 | {comportement} | à faire |
| 2 | {comportement} | à faire |
```

Statuts : `à faire` → `red` → `green` → `refactored` → `reviewed`.

## Garde-fous

- Une étape sans test n'est pas une étape — elle est soit à fusionner, soit mal pensée.
- Un critère d'acceptation non couvert par le plan = un trou : le signaler.
- Ne pas sur-découper : si une étape ne contient qu'un renommage, la fusionner.
- Le plan respecte le profil domaine déclaré — pas d'aggregate dans un plan
  de module « simple ».
