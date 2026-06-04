# Guidelines .NET

> **Quand charger ce fichier :** dès qu'on écrit ou modifie du code C# / .NET.
> Complète `standards.md` (global), `architecture.md` (socle) et `ddd.md` (gradation).

## 1. Version et langage

- S'aligner sur la version .NET déclarée dans `PROJECT.md` ; utiliser les fonctionnalités
  C# modernes compatibles avec cette version.
- **Nullable reference types activés** : pas de `!` pour faire taire le compilateur —
  traiter la nullabilité explicitement.
- `record` pour les types immuables porteurs de données (commands, queries, DTOs, Value Objects).
- `var` quand le type est évident à la lecture, type explicite sinon.
- Nommage : `PascalCase` (types, méthodes, propriétés), `camelCase` (variables, paramètres),
  `_camelCase` (champs privés), `I` préfixe interfaces.

## 2. Encapsulation et visibilité

- Visibilité **minimale par défaut** : `internal sealed` pour les handlers, validators
  et repositories ; `public` seulement pour ce qui constitue le contrat du module
  (commands, queries, DTOs, ports).
- Le projet de test accède aux internals via `InternalsVisibleTo`.
- Pas de classe statique « boîte à outils » (`XxxHelper`, `XxxUtils`) — préférer
  des méthodes d'extension ciblées ou des services injectés.

## 3. Injection de dépendances

- DI par constructeur, partout. Jamais de `new` sur une dépendance lourde,
  jamais de service locator.
- Lifetimes explicites et justifiés : `Scoped` par défaut pour ce qui touche
  la base, `Singleton` uniquement pour du sans-état.
- La couche domaine ne dépend d'aucun conteneur DI.

## 4. Asynchronisme

- `async`/`await` de bout en bout pour toute I/O — jamais de `.Result` ni `.Wait()`
  (deadlocks).
- Un `CancellationToken` traverse toute la chaîne : endpoint → handler → repository.
- Suffixe `Async` selon la convention du projet (`PROJECT.md`).

## 5. API HTTP

- DTOs dédiés en entrée/sortie — jamais une entité ORM ni un aggregate exposé.
- Validation des entrées à la frontière (validators), codes HTTP cohérents :
  2xx succès, 4xx erreur appelant (validation, introuvable, conflit), 5xx bug/panne.
- Les erreurs métier remontent via `Result<T>` (ou la convention de `PROJECT.md`)
  converties par le mapper d'erreurs — pas de `try/catch` dans les endpoints.
- Réponses documentées (OpenAPI) : forme du succès + formes d'erreur.

## 6. Persistence (EF Core ou équivalent)

- Configuration explicite des tables, colonnes et index (pas de convention implicite
  pour ce qui compte).
- Requêtes en lecture seule : `AsNoTracking()`.
- Écritures persistées explicitement avec le `CancellationToken`.
- Profil riche (`skillkit/guidelines/ddd.md`) : entité ORM ≠ aggregate, conversion par
  extensions de mapping.

## 7. Tests

- Frameworks et librairies de mock : ceux déclarés dans `PROJECT.md`.
- Workflow : `skillkit/guidelines/tdd.md` — obligatoire.
- Cibles et exclusions : voir le tableau « Quoi tester » de `tdd.md`.
- `dotnet test` doit passer **en entier** avant tout commit.
