---
name: frontend/ng-review
description: Revue pédagogique d'un fichier Angular 17+ — 4 axes : migration vers les patterns modernes, architecture, performance, qualité TypeScript
---

# Revue de fichier Angular

Effectue une revue complète de : **$ARGUMENTS**

Lis le fichier entier en premier. Si `PROJECT.md` est présent, utilise sa stack et ses
conventions pour adapter chaque finding au contexte concret du projet.
Si absent, applique les bonnes pratiques Angular et le mentionne une fois.

Analyse le fichier selon les 4 axes ci-dessous. Pour chaque finding, explique
**POURQUOI** c'est un problème — pas seulement comment le corriger.

---

## Axe 1 — Migration vers l'Angular moderne (patterns obsolètes)

Détecte et explique chaque pattern dépassé :

| Détecté | Problème | Solution moderne |
|---|---|---|
| `@Input()` decorator | API classe — non réactive | `input()` / `input.required()` signal |
| `@Output()` + `EventEmitter` | Verbeux, typage faible | `output<T>()` |
| `[(ngModel)]` / `@Input()` + `@Output()` two-way binding | Cérémonie manuelle | `model<T>()` |
| `*ngIf` / `*ngFor` / `*ngSwitch` | Ancienne syntaxe de directive structurelle | `@if` / `@for` / `@switch` |
| `constructor(private x: X)` | Injection par constructeur | `inject(X)` |
| `BehaviorSubject` pour l'état local | RxJS pour de l'état synchrone | `signal<T>()` |
| `subscribe()` sans nettoyage | Fuite mémoire potentielle | `toSignal()` ou `takeUntilDestroyed()` |
| Pipe `async` | Masque la gestion d'erreurs | `toSignal()` avec `initialValue` |
| `ChangeDetectionStrategy.Default` (ou absent) | Re-renders excessifs | `OnPush` partout |
| `@NgModule` | Architecture dépassée | Composants standalone + `app.config.ts` |
| `@HostBinding` / `@HostListener` | Decorateurs verbeux | Objet `host: {}` dans `@Component` |
| Appel de méthode dans le template `[prop]="method()"` | Recalculé à chaque détection de changement | Signal `computed()` |

---

## Axe 2 — Architecture et responsabilités (SRP)

Vérifie :

- **Composant qui fait trop** : affiche-t-il ET gère-t-il l'état ? Découper en smart + presentational.
- **Logique métier dans le template** : les conditions et transformations complexes appartiennent à `computed()`.
- **Appels HTTP directs dans le composant** : la récupération de données doit passer par un service.
- **Store mal utilisé** : l'état local qui n'a pas besoin d'être partagé ne doit pas vivre dans un store global.
- **Composant smart dans `components/`** : les composants presentational ne doivent pas injecter de services métier.

---

## Axe 3 — Performance

Vérifie :

- `track` absent ou peu discriminant dans `@for` — utiliser `track item.id`, pas `track $index`.
- Signaux `computed()` redondants ou inutilement imbriqués.
- Sections lourdes sans `@defer` pour le chargement différé.
- Images sans `NgOptimizedImage` (`<img ngSrc="...">`).
- Entrées inutilisées dans le tableau `imports` du composant (augmente la taille du bundle).
- Signaux lus plusieurs fois dans le template quand un seul `computed()` suffirait.

---

## Axe 4 — Qualité TypeScript

Vérifie :

- `any` explicite ou implicite.
- Types trop larges (`string` au lieu d'un type union de littéraux).
- Assertion non-null (`!`) sans commentaire justificatif.
- Interfaces manquantes pour les DTOs et modèles de domaine.
- Chaînage optionnel (`?.`) utilisé où le type devrait être non-nullable — masque un problème de conception.

---

## Format de sortie

Pour chaque finding :

```
{🔴|🟠|🟡|🟢} **{Titre court}**
Emplacement : `{fichier:ligne — ou section composant / template}`
Problème : {ce qui ne va pas et pourquoi c'est important}
Correction : {suggestion concrète et actionnable}
Avant : {extrait exact du fichier relu}
Après :  {version corrigée adaptée au contexte de ce fichier}
Doc : {lien angular.dev si pertinent — omettre si aucun}
```

**Niveaux de sévérité :**

| Niveau | Label | Quand l'utiliser |
|---|---|---|
| 🔴 | Critique | À corriger obligatoirement — bug de correction, fuite mémoire, problème de sécurité |
| 🟠 | Majeur | Devrait être corrigé — problème de performance ou d'architecture significatif |
| 🟡 | Mineur | Faible impact — nommage, style, ou amélioration mineure |
| 🟢 | Suggestion | Optionnel — idée de modernisation ou piste future |

**Règles :**
- Un bloc par finding — ne pas regrouper des problèmes sans lien.
- `Emplacement` peut être omis si le problème est structurel (pas de ligne unique).
- `Correction` doit être actionnable — ne jamais écrire « envisager d'améliorer » ou « penser à refactorer ».
- `Avant / Après` doivent utiliser le code exact du fichier relu, pas des exemples inventés.
- `Doc` est optionnel — l'inclure uniquement quand la référence angular.dev soutient directement la correction.

---

## Résumé final obligatoire

Terminer chaque revue par ce bloc exact :

```
---
**Score : {X}/10**

**Top 3 à corriger :**
1. {finding le plus impactant — une ligne}
2. {second — une ligne}
3. {troisième — une ligne}

**Ce qui fonctionne bien :**
- {point fort réel — jamais sauté, même pour les fichiers faibles}
```

**Règles :**
- Le score reflète la santé globale du code, pas seulement le nombre de problèmes.
- Les 3 éléments du top doivent déjà apparaître comme findings ci-dessus — aucun nouveau problème ici.
- « Ce qui fonctionne bien » est obligatoire. Si le fichier n'a pas de vraies forces, noter ce qui est au moins correct.

---

## Règle pédagogique

Ne pas se contenter de montrer « le code correct ». Pour les patterns importants (Signals, `OnPush`,
`inject()`, `@defer`), expliquer brièvement le mécanisme sous-jacent.
L'objectif est que le développeur comprenne **POURQUOI**, pas seulement **QUOI** changer.
