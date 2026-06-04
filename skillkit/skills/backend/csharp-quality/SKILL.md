---
name: csharp-quality
description: Check de qualité du langage C# — indépendant de l'architecture, fonctionne sur n'importe quel fichier C# quel que soit le pattern ou le framework. Nullabilité, async, discipline de typage, LINQ/collections, mécanique des exceptions, hygiène de code.
---

# Check qualité C#

Reviewer la qualité **au niveau du langage** du fichier C# indiqué par l'utilisateur.

Ce skill couvre uniquement le langage — nullabilité, exactitude async, discipline de
typage, collections, mécanique des exceptions, hygiène. Les patterns DDD, l'architecture
et la stratégie d'erreurs sont couverts par d'autres skills
(`skillkit/skills/backend/file-review/`, `skillkit/skills/backend/ddd-review/`).

Lire le fichier en entier. Pour chaque constat, expliquer **POURQUOI** c'est un
problème — pas seulement quoi changer.

---

## Nullabilité

- `string?` / `T?` où la valeur ne devrait jamais être null — masque un problème de
  design ; corriger la cause amont, pas la rustiner de null checks.
- Opérateur null-forgiving (`!`) sans commentaire expliquant pourquoi null est
  impossible — hypothèse implicite invisible pour le prochain lecteur.
- Chaînage optionnel (`?.`) là où le type devrait être non-nullable — signale un
  contrat manquant, pas un null check manquant.
- `== null` / `!= null` au lieu du pattern matching (`is null` / `is not null`) —
  non idiomatique en C# moderne.

## Async / concurrence

- Méthode `async Task` sans `await` — méthode synchrone déguisée (warning CS1998).
- `.Result` ou `.Wait()` sur une `Task` en contexte async — deadlock potentiel,
  surtout sous contexte de requête ASP.NET.
- Méthode `async` sans paramètre `CancellationToken` — l'appelant ne peut pas annuler ;
  omission acceptable seulement pour du vrai fire-and-forget.
- `CancellationToken` reçu mais non transmis aux appels async internes — token
  silencieusement ignoré en milieu de chaîne.
- `DateTime.Now` au lieu de `DateTime.UtcNow` — sensible au fuseau ; toujours stocker
  et comparer en UTC.

## Discipline de typage

- Abus de `var` où le type inféré n'est pas évident — réduit la lisibilité sans gain réel.
- `object` ou `dynamic` quand un type concret est disponible — perd les garanties du compilateur.
- Record mutable (`{ get; set; }`) pour un type qui devrait être immuable — préférer
  `{ get; init; }` ou un record positionnel.
- Champ privé jamais réassigné après construction mais non `readonly` — signal
  d'intention manqué.
- Tuple anonyme (`(string, int)`) là où un record ou struct nommé serait plus clair.
- Nombre ou chaîne magique — extraire en constante nommée ou membre d'enum.
- `string` là où un enum empêcherait les valeurs invalides à la compilation.

## LINQ et collections

- `Count() > 0` au lieu de `Any()` — itère toute la collection ; `Any()` s'arrête
  au premier élément.
- `.ToList().FirstOrDefault()` — matérialise toute la collection pour un seul élément ;
  `.FirstOrDefault()` directement.
- `Select()` avant `Where()` — toujours filtrer avant de projeter.
- Résultat de `FirstOrDefault()` utilisé sans null check — null-reference silencieuse
  à l'exécution.
- Chaîne LINQ là où un simple `foreach` serait plus clair — LINQ n'est pas toujours
  le bon outil.

## Mécanique des exceptions

- Bloc `catch` vide — avale l'exception en silence ; au minimum logger et relancer.
- `catch (Exception)` — trop large ; attraper le type le plus spécifique possible.
- `throw e` au lieu de `throw` — réinitialise la stack trace ; toujours relancer
  avec `throw` nu.
- `try/catch` autour de code qui ne peut pas lever — bruit qui trompe sur le risque réel.

## Hygiène de code

- Type ou membre plus visible que nécessaire (`public` quand `internal`/`private`
  suffirait) — visibilité minimale toujours.
- Classe concrète non `sealed` sans sous-classe prévue — `sealed` améliore la
  dévirtualisation JIT et signale l'intention.
- Classe utilitaire `static` portant de la logique à dépendances externes — préférer
  un service injectable pour la testabilité.
- `IDisposable` / `IAsyncDisposable` sans `using` / `await using` — fuite de ressource.
- Méthode async sans suffixe `Async` — casse la convention BCL.
- Méthode synchrone portant le suffixe `Async` — nom trompeur.
- Directives `using` inutilisées — du bruit ; les supprimer.

---

## Format de sortie

Pour chaque constat :

```
{🔴|🟠|🟡|🟢} **{Titre court}**
Localisation : `{fichier:ligne — ou classe / méthode}`
Problème : {ce qui ne va pas et pourquoi c'est important}
Correction : {suggestion concrète et actionnable}
Avant : {extrait exact du fichier reviewé}
Après : {version corrigée, adaptée au contexte de CE fichier}
```

**Niveaux de sévérité :**

| Niveau | Libellé | Quand l'utiliser |
|---|---|---|
| 🔴 | Critique | À corriger absolument — deadlock, fuite de ressource, risque de corruption |
| 🟠 | Majeur | À corriger — problème significatif d'exactitude ou de maintenabilité |
| 🟡 | Mineur | Faible impact — style, nommage, petite amélioration |
| 🟢 | Suggestion | Optionnel — idée de modernisation ou piste future |

**Règles :**
- Un bloc par constat — ne pas regrouper des problèmes sans rapport.
- `Correction` actionnable — jamais « envisager d'améliorer ».
- `Avant / Après` avec le code exact du fichier, pas des exemples inventés.

## Synthèse finale obligatoire

```
---
**Score : {X}/10**

**Top 3 à corriger :**
1. {constat le plus impactant — une ligne}
2. {deuxième — une ligne}
3. {troisième — une ligne}

**Ce qui fonctionne bien :**
- {point fort réel — jamais omis, même pour un fichier faible}
```

Le score reflète la qualité globale du langage, pas le nombre de constats.
Le top 3 reprend des constats déjà listés — pas de nouveau problème dans la synthèse.
« Ce qui fonctionne bien » est obligatoire ; à défaut, noter ce qui est au moins correct.
