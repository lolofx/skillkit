---
name: refactor
description: Refactorer des structures, classes, composants, services, modules ou de la logique dupliquée et produire un plan d'action d'amélioration interne sûre. Utiliser pour une démarche de refactoring structurée sans changement de comportement — lisibilité, modularité, cohésion, testabilité, maintenabilité.
---

# Refactor

## Objectif

Planifier et guider un refactoring sûr **sans changer le comportement métier**.
Prioriser les améliorations structurelles à faible risque qui rendent le code plus facile
à comprendre, tester et faire évoluer.

Règle absolue (`skillkit/guidelines/tdd.md`) : on refactore **sous protection des tests**.
Pas de filet de sécurité → on le construit d'abord. Les tests restent verts à chaque pas ;
un test qui casse → on revient en arrière, on n'adapte pas le test.

Si `PROJECT.md` est présent, aligner le refactoring sur le socle
(`skillkit/guidelines/architecture.md`) et le profil domaine (`skillkit/guidelines/ddd.md`).

## Déroulé

1. Identifier le moteur du refactoring : duplication, classe/composant trop gros,
   responsabilités floues, imbrication profonde, nommage pauvre, logique difficile
   à tester, mélange UI/orchestration/domaine.
2. Identifier ce qui doit rester inchangé.
3. Proposer des étapes incrémentales.
4. Mettre en évidence les risques de régression.
5. Restituer le plan d'action.

## Heuristiques

Chercher :

- des règles métier cachées, éparpillées en plusieurs endroits
- du mapping ou des conditions répétés
- des méthodes longues à responsabilités multiples
- des dépendances sur-couplées, mauvaise direction de dépendance (socle)
- des fichiers qui en font trop
- des noms faibles masquant l'intention
- des branchements à isoler

## Pistes par langage

### .NET

- extraire des méthodes/services focalisés
- isoler validation et mapping
- alléger l'orchestration des handlers
- clarifier les frontières domaine/application (`skillkit/guidelines/architecture.md`)
- améliorer la direction des dépendances et les points de test

### Angular

- sortir la logique des templates
- scinder les composants trop gros
- isoler le comportement à état
- réduire la complexité des subscriptions
- extraire des services réutilisables ou des helpers purs

### Python

- scinder les fonctions multi-usages
- isoler les effets de bord de la logique pure
- simplifier les branchements
- nommer selon les concepts métier
- réduire l'état partagé implicite

### TypeScript

- renforcer les types, modéliser les variantes explicitement
- extraire les helpers de transformation
- réduire la complexité conditionnelle
- isoler la coordination asynchrone des règles pures

## Contexte Azure DevOps

Si l'entrée mentionne dette technique, roadmap, phase de stabilisation ou maintenabilité :

- proposer un séquencement compatible avec le backlog refinement
- séparer les actions obligatoires des nettoyages optionnels
- mentionner les tests ou filets de sécurité requis avant de refactorer

## Format de sortie

# Plan d'action refactor

## Constat
- Le problème structurel actuel.
- En quoi il ralentit la livraison, la qualité ou la compréhension.

## Objectif de refactoring
- Ce qui doit s'améliorer, à comportement strictement constant.

## Actions recommandées
1. Ajouter ou confirmer les tests de protection
2. Extraire la première responsabilité à forte valeur
3. Simplifier nommage ou structure
4. Supprimer la duplication ou isoler les branchements
5. Relancer la validation après chaque étape

## Risques et garde-fous
- Risques de dérive de comportement
- Risques de dépendances cachées
- Zones nécessitant une validation incrémentale

## Ordre d'exécution conseillé
1. Filet de sécurité
2. Extraction structurelle
3. Simplification
4. Nettoyage

## Vérifications finales
- Comportement inchangé
- Tests toujours verts (suite complète exécutée)
- Lisibilité améliorée
- Responsabilités plus claires

## Garde-fous

- Ne pas proposer de refactoring qui change l'intention fonctionnelle, sauf demande
  explicite de redesign.
- Préférer les étapes incrémentales à la grande réécriture.
- Signaler où les tests manquent avant de recommander des changements profonds.
