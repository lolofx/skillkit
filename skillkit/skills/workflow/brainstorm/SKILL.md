---
name: brainstorm
description: Clarifier une idée ou un besoin AVANT toute spec ou implémentation — questions une par une, exploration de 2-3 approches, décision argumentée. Utiliser dès qu'un besoin est flou, qu'une feature démarre ou qu'un choix de conception n'est pas tranché.
---

# Brainstorm

## Objectif

Transformer une idée floue en **décision claire et partagée**, avant d'écrire la moindre
ligne de spec ou de code. Le livrable est une compréhension commune : besoin, approche
retenue, raisons du choix.

## Règles du jeu

- **Une question à la fois.** Jamais de rafale de questions — chaque réponse oriente
  la suivante.
- Questions fermées ou à choix multiples de préférence : plus facile d'y répondre.
- Reformuler ce qu'on a compris au fil de l'eau ; corriger sans frais à ce stade.
- Pas de solution avant d'avoir compris le problème. Pas de code pendant le brainstorm.
- S'appuyer sur le contexte : `PROJECT.md` (stack, profil domaine), le code existant
  si pertinent.

## Déroulé

### 1. Comprendre le besoin

Explorer, une question à la fois :

- Quel problème résout-on ? Pour qui ?
- Qu'est-ce qui se passe aujourd'hui sans cette feature ?
- Quel est le périmètre minimal qui apporte de la valeur ?
- Qu'est-ce qui est explicitement **hors périmètre** ?
- Y a-t-il des contraintes (délai, compatibilité, données existantes) ?

### 2. Explorer 2-3 approches

Quand le besoin est clair, proposer **2 ou 3 approches** :

- Pour chacune : principe, avantages, inconvénients, coût relatif.
- Inclure l'option simple — souvent sous-estimée. Penser à la gradation :
  ce besoin justifie-t-il un domaine riche ou un CRUD suffit-il ? (`skillkit/guidelines/ddd.md`)
- Donner un avis argumenté, mais la décision appartient à l'utilisateur.

### 3. Décider et conclure

- Acter l'approche retenue et **pourquoi** (les raisons comptent autant que le choix).
- Lister les décisions prises et les questions restées ouvertes.
- Proposer la suite : `skillkit/skills/workflow/spec/` pour formaliser, ou directement
  `skillkit/skills/workflow/plan/` si le besoin est trivial.

## Format de sortie (en fin de session)

```
## Brainstorm — {sujet}

### Besoin
{2-3 phrases : problème, pour qui, valeur}

### Approche retenue
{l'approche + pourquoi elle gagne sur les alternatives}

### Décisions
- {décision} — {raison}

### Hors périmètre
- {ce qu'on ne fait pas, explicitement}

### Questions ouvertes
- {ce qui reste à trancher, et quand}

### Suite proposée
{/spec <feature> | /plan <feature> | autre}
```

## Garde-fous

- Ne pas conclure tant que le besoin n'est pas compris — mieux vaut une question
  de plus qu'une spec fausse.
- Ne pas imposer l'approche sophistiquée : le coût de la sur-ingénierie est réel.
- Si l'utilisateur a déjà tout décidé : le constater, résumer, passer à la spec.
