---
name: generate-tests
description: Concevoir ou générer des tests depuis du code, des exigences, un work item, un correctif ou des critères d'acceptation, et produire un plan d'action de couverture. Utiliser pour une génération de tests structurée — confiance, cas limites, régressions, tests à plus forte valeur d'abord.
---

# Generate Tests

## Objectif

Définir la **bonne stratégie de test avant** de générer du code de test.
Prioriser la couverture à forte valeur et les scénarios métier — pas la quantité.

Si `PROJECT.md` est présent, utiliser ses frameworks de test, conventions de nommage
et chemins. Les règles de fond (quoi tester, AAA, comportement vs implémentation)
sont dans `skillkit/guidelines/tdd.md` — ce skill les applique.

> En TDD strict (nouvelle feature), les tests s'écrivent **avant** le code, un par un
> (`skillkit/skills/workflow/tdd/`). Ce skill sert surtout à couvrir du code **existant**
> (legacy, filet avant refactor, trous de couverture).

## Déroulé

1. Déterminer la cible : fonction, classe, service, composant, endpoint, correctif,
   critère d'acceptation.
2. Identifier le comportement critique.
3. Découper les scénarios : happy path, cas limites, cas d'échec.
4. Prioriser le plus petit ensemble de tests donnant une confiance forte.
5. Restituer le plan d'action.
6. Générer le code des tests si demandé.

## Règles de conception

Toujours préférer :

- des tests orientés comportement
- des noms de scénario clairs (`Create_WithEmptyName_ReturnsValidationError`)
- une intention par test quand c'est praticable
- des assertions stables
- le minimum de mocks nécessaire pour isoler le comportement

Éviter :

- le sur-mocking qui masque les défauts de logique
- les assertions fragiles liées aux détails d'implémentation
- les cas redondants qui n'ajoutent pas de confiance

## Cibles par langage

### .NET

Suivre les conventions du projet (`PROJECT.md`). Cibler :

- comportement des aggregates / Value Objects (happy path + invariants violés)
- résultats des handlers (mocks des ports, mapping, cas d'erreur)
- règles de validation
- frontières de mapping
- exceptions et cas limites

Hors périmètre unitaire : repositories (intégration) et endpoints (dispatch pur) —
voir le tableau de `skillkit/guidelines/tdd.md`.

### Angular

- comportement du composant plutôt que le bruit du template
- points d'interaction avec les services
- résultats observables, validation de formulaire
- changements d'état déclenchés par l'utilisateur

### Python

- comportement des fonctions, couverture des branches métier
- scénarios de parsing/transformation
- comportement des exceptions, conditions aux bornes

### TypeScript

- logique métier typée, helpers et transformers
- comportement asynchrone, validation de payload
- branches et gestion d'erreur

## Contexte Azure DevOps

Si l'entrée inclut un bug ou un work item :

- recommander un test de régression
- mapper les scénarios aux critères d'acceptation disponibles
- distinguer les tests requis avant merge des tests de durcissement optionnels

## Format de sortie

# Plan d'action tests

## Cible à couvrir
- Ce qui doit être testé et l'objectif métier ou technique.

## Scénarios prioritaires
1. Comportement principal attendu
2. Cas limite important
3. Cas d'échec ou d'entrée invalide
4. Cas de régression si pertinent

## Stratégie de tests
- Tests unitaires à ajouter en premier
- Tests d'intégration si nécessaires
- Stratégie de mock ou de fixtures si pertinente

## Ordre recommandé
1. Le test de régression ou happy path à plus forte valeur
2. La couverture des cas limites
3. La couverture des chemins d'échec
4. Les tests de durcissement optionnels

## Critères de validation
- Ce que les tests verts doivent prouver
- Les risques restant non couverts, le cas échéant

## Garde-fous

- Expliquer les arbitrages si la couverture exhaustive est inutile.
- Préférer un petit ensemble solide à une grande suite fragile.
- En générant du code : suivre les conventions de nommage et frameworks du projet.
