---
name: fix-issue
description: Analyser un bug, incident, régression, work item, stack trace ou comportement cassé et produire un plan d'action de correction. Utiliser pour une démarche de remédiation structurée — causes racines probables, correctif minimal sûr, étapes de validation, ordre de livraison.
---

# Fix Issue

## Objectif

Transformer un rapport de bug ou une description d'échec en **plan de remédiation réaliste**.
Prioriser l'isolement de la cause racine, la correction sûre et la validation —
jamais de changement large sans analyse.

Si `PROJECT.md` est présent, adapter chemins, conventions et pattern d'erreurs au projet.
La correction suit le workflow TDD (`skillkit/guidelines/tdd.md`) : le scénario en échec devient
un test rouge **avant** le correctif.

## Déroulé

1. Reformuler le problème en termes opérationnels.
2. Identifier la couche probable de l'échec : validation d'entrée, logique domaine,
   persistence, contrat d'API, état/flux frontend, comportement asynchrone,
   configuration ou environnement.
3. Distinguer les faits des hypothèses.
4. Proposer le chemin de correction le plus petit et le plus sûr.
5. Ajouter les étapes de vérification et les checks de régression.

## Analyse de cause racine

Toujours chercher à identifier :

- la condition de déclenchement
- le chemin en échec
- la cause racine probable
- pourquoi le problème a échappé aux barrières (test manquant ? validation absente ?)
- ce qui doit être validé après correction

Si l'entrée est incomplète : hypothèses **classées par probabilité**, pas de fausse certitude.

## Heuristiques par langage

### .NET

- références null, problèmes de mapping
- flux async incorrects
- enregistrements DI manquants ou mal scopés
- sérialisation / model binding
- trous de validation entre endpoint, handler et domaine
- incohérences de transaction ou de persistence

### Angular

- race conditions dans les subscriptions
- état périmé après appel API
- binding de formulaire, hypothèses de change detection
- conditions de template fragiles
- incohérences de guards/resolvers

### Python

- entrées non vérifiées, trous de branchement
- gestion d'exception faible
- effets de bord de mutation d'état
- défauts de parsing/conversion
- hypothèses d'intégration cachées dans les helpers

### TypeScript

- hypothèses invalides sur la forme des payloads
- mauvais usage des nullables, ordre asynchrone
- logique de transformation dupliquée
- narrowing insuffisant, gestion d'erreur incohérente

## Contexte Azure DevOps

Si l'entrée référence un work item, bug, incident ou des critères d'acceptation :

- aligner le correctif d'abord sur le symptôme métier
- indiquer quelles informations recopier dans le work item
- produire des actions convertibles en tâches d'implémentation, de test et de validation

## Format de sortie

# Plan d'action correction

## Problème reformulé
- Le problème en une ou deux phrases précises.
- Impact visible.

## Causes probables
- Classées de la plus probable à la moins probable.
- Pour chacune : le signal qui la soutient.

## Actions recommandées
1. Confirmer le scénario en échec et le reproduire
2. Écrire le test rouge qui capture le bug (`skillkit/guidelines/tdd.md`)
3. Inspecter la zone la plus probablement fautive
4. Appliquer le plus petit changement sûr → test vert
5. Valider le correctif de bout en bout

## Points de vigilance
- Risques de régression
- Risques d'intégrité des données
- Risques de compatibilité de contrat
- Effets de bord UI ou workflow

## Vérifications après correction
- Scénarios exacts à rejouer
- Cas négatifs ou limites à tester
- Logs ou métriques à surveiller si pertinent

## Proposition de découpage Azure DevOps
- investigation
- correction
- tests
- validation fonctionnelle

## Garde-fous

- Ne jamais sauter au patch sans analyse de cause racine.
- Privilégier le correctif sûr le moins invasif.
- Signaler explicitement le contexte manquant.
- Pas de refactor large sauf s'il est nécessaire pour corriger en sécurité.
