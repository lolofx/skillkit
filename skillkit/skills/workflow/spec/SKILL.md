---
name: spec
description: Rédiger la spécification d'une feature dans specs/<feature>/spec.md — le QUOI et le POURQUOI : besoin, critères d'acceptation, hors-périmètre, décisions. Utiliser après un brainstorm ou quand un besoin clair doit être formalisé avant le plan.
---

# Spec

## Objectif

Formaliser le **QUOI** et le **POURQUOI** d'une feature dans `specs/<feature>/spec.md`.
La spec décrit le comportement attendu et ses limites — jamais le découpage technique
(ça, c'est le plan : `skillkit/skills/workflow/plan/`).

Conventions SDD du projet : `specs/README.md`. Si `PROJECT.md` déclare un outil SDD
externe (OpenSpec, spec-kit, BMAD), utiliser ses commandes — ce skill couvre les
conventions du kit.

## Déroulé

1. **Vérifier les acquis.** Un brainstorm a eu lieu ? Repartir de ses décisions.
   Sinon, vérifier que le besoin est assez clair — s'il est flou, proposer
   `skillkit/skills/workflow/brainstorm/` d'abord.
2. **Nommer la feature.** Un slug court en kebab-case : `specs/order-cancellation/`.
3. **Rédiger `spec.md`** selon le gabarit ci-dessous. Chaque critère d'acceptation
   doit être **testable** — il deviendra des tests dans le plan.
4. **Faire valider** la spec par l'utilisateur avant de proposer la suite
   (`skillkit/skills/workflow/plan/`).

## Gabarit de `specs/<feature>/spec.md`

```markdown
# Spec — {nom de la feature}

> Statut : brouillon | validée
> Date : {YYYY-MM-DD}

## Besoin

{2-5 phrases : le problème, pour qui, la valeur. Le POURQUOI.}

## Comportement attendu

{Description du comportement du point de vue de l'utilisateur/du consommateur de l'API.
Pas de détail d'implémentation.}

## Critères d'acceptation

- [ ] {critère testable — étant donné X, quand Y, alors Z}
- [ ] {critère testable}
- [ ] {cas d'erreur : étant donné X invalide, alors erreur E}

## Hors périmètre

- {ce que cette feature ne fait explicitement pas}

## Décisions

- {décision prise (au brainstorm ou ici)} — {raison}

## Questions ouvertes

- {point non tranché, à lever avant ou pendant le plan}
```

## Garde-fous

- Une spec sans critère d'acceptation testable n'est pas une spec.
- Le hors-périmètre est aussi important que le périmètre : il évite la dérive.
- Pas de choix techniques dans la spec (sauf s'ils SONT le besoin, ex. : contrainte
  de compatibilité).
- Si une question ouverte bloque les critères d'acceptation, la lever **avant**
  de valider la spec.
