---
name: review
description: Reviewer un changement de code (PR, diff, fichier, snippet, choix d'implémentation) et produire un plan d'action orienté livraison. Utiliser quand on veut une review structurée — exactitude, risque de régression, maintenabilité, lisibilité, alignement architecture, prêt-à-merger.
---

# Review

## Objectif

Reviewer du code de façon orientée livraison : un **plan d'action concret**, pas une
critique générique. Se concentrer sur ce qui compte pour livrer en sécurité.

Si `PROJECT.md` est présent, adapter chaque constat à la stack, aux conventions et au
profil domaine déclarés. Vérifier le socle (`skillkit/guidelines/architecture.md`) **toujours** ;
la panoplie DDD (`skillkit/guidelines/ddd.md`) **seulement si le profil la déclare**.

## Déroulé

1. Identifier le périmètre : PR, diff, fichier/snippet, choix architectural, implémentation à risque.
2. Déterminer le risque dominant : exactitude, régression, maintenabilité, lisibilité,
   sécurité/exposition de données, performance, testabilité.
3. Reviewer avec les heuristiques du langage concerné.
4. Prioriser les constats.
5. Restituer le plan d'action.

## Priorités de review

Dans cet ordre, sauf demande contraire explicite :

1. Exactitude fonctionnelle
2. Risque de régression
3. Validation ou cas limite manquants
4. Lisibilité et maintenabilité
5. Impact sur les tests (workflow TDD respecté ? — `skillkit/guidelines/tdd.md`)
6. Performance à impact plausible
7. Remarques de style uniquement

Ne pas noyer la réponse sous des remarques de style quand des risques plus importants existent.

## Heuristiques par langage

### .NET

- gestion du null et vérifications défensives
- mauvais usage d'async/await (`.Result`, `.Wait()`, token absent)
- exceptions avalées ; échec métier attendu levé en exception au lieu de `Result<T>`
- frontières repository/handler floues, fuite de couche (`skillkit/guidelines/architecture.md`)
- classes sur-couplées, confusion DTO/domaine
- effets de bord cachés dans les handlers

### Angular

- cycle de vie des subscriptions
- complexité de composant inutile, duplication d'état
- logique de template à déplacer en TypeScript
- typage faible, formulaires fragiles
- séparation smart/présentation peu claire

### Python

- effets de bord implicites, exceptions trop larges
- arguments par défaut mutables, validation manquante
- responsabilité de fonction floue, nommage masquant l'intention métier
- trous de test sur la logique de branchement

### TypeScript

- `any` ou typage faible masquant des défauts
- branchements qui devraient être modélisés par les types
- hypothèses d'exécution cachées, mapping dupliqué
- gestion d'erreur pauvre, nullables non vérifiés

## Contexte Azure DevOps

Si l'entrée mentionne un work item, une PR, des critères d'acceptation ou un bug :

- aligner la review sur l'intention déclarée et signaler tout écart code ↔ ticket
- pointer les validations manquantes avant merge
- proposer des suites convertibles en sous-tâches ou commentaires

## Format de sortie

# Plan d'action review

## Constat
- Ce que le changement semble faire.
- Posture globale : acceptable, risqué, incomplet, ou à clarifier.

## Risques principaux
- Les 3 à 5 constats les plus importants, avec pourquoi ils comptent.
- Impact : élevé, moyen, faible.

## Actions recommandées
1. Action à faire en premier
2. Action suivante
3. Durcissement ou nettoyage optionnel

## Vérifications avant merge
- Checks précis à lancer (dont la suite de tests complète)
- Scénarios précis à tester
- Zones de code à relire

## Décision proposée
- prêt pour merge
- prêt après corrections ciblées
- à retravailler avant nouvelle review

## Garde-fous

- Être explicite quand les éléments sont incomplets.
- Séparer les problèmes confirmés des inquiétudes plausibles.
- Préférer l'observation actionnable au conseil abstrait.
- Ne jamais inventer de convention projet — s'appuyer sur `PROJECT.md` et `skillkit/guidelines/`.
- Rester concis mais concret.
