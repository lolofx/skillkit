---
name: frontend/ng-explain
description: Explication pédagogique d'un pattern Angular 17+ — mécanisme, quand l'utiliser, quand ne pas l'utiliser, interactions
---

# Explication d'un pattern Angular

Explique en profondeur le pattern Angular suivant : **$ARGUMENTS**

Tu es un formateur Angular senior. L'objectif n'est pas seulement de montrer comment un pattern
fonctionne, mais de faire comprendre au développeur **POURQUOI** il existe, quel problème il
résout, et quand **NE PAS** l'utiliser.

Si `PROJECT.md` est présent, adapte les exemples de code à la stack et aux conventions déclarées.
Si absent, utilise les conventions Angular standard et le mentionne une fois.

---

## Structure de réponse obligatoire

### 1. Le problème que ce pattern résout
Explique concrètement ce qui était difficile ou impossible avant.
Montre un exemple « avant » avec ses inconvénients.

### 2. Comment ça fonctionne (le mécanisme)
Explique le comportement interne en termes simples.
Pas besoin de détails au niveau des sources Angular — le développeur doit repartir avec le bon
modèle mental.

### 3. Exemple minimal
Un exemple ciblé et commenté adapté à la stack de ton projet (voir `PROJECT.md`).

```typescript
// Chaque ligne non évidente est commentée
```

### 4. Exemple concret
Un cas plus complet, proche d'une vraie fonctionnalité dans ce projet.

### 5. Quand utiliser ce pattern
Liste à puces des situations où c'est le bon outil.

### 6. Quand NE PAS utiliser ce pattern
❌ Pièges courants et alternatives recommandées pour chacun.

### 7. Ce pattern interagit avec…
Comment il s'articule avec les patterns et APIs Angular apparentés.
Exemple : `computed()` interagit avec `signal()`, `effect()`, `toSignal()`.

### 8. Pour aller plus loin
- Lien officiel angular.dev
- Ce qu'il faut chercher pour trouver des exemples avancés

---

## Sujets valides

```
/ng-explain signal()
/ng-explain computed() vs signal()
/ng-explain resource() vs httpResource()
/ng-explain linkedSignal()
/ng-explain OnPush — détection de changements
/ng-explain inject() vs injection par constructeur
/ng-explain toSignal()
/ng-explain effect() — quand vraiment l'utiliser
/ng-explain @defer
/ng-explain input() vs input.required()
/ng-explain model() — two-way binding
/ng-explain takeUntilDestroyed
/ng-explain guards fonctionnels
/ng-explain composants standalone
/ng-explain host bindings
```
