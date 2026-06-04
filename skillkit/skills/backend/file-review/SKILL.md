---
name: file-review
description: Review pédagogique d'un fichier backend sur 4 axes — patterns DDD/CQRS (selon profil domaine), architecture et responsabilités, qualité du langage, gestion des erreurs. Utiliser pour reviewer un fichier en expliquant le POURQUOI de chaque constat.
---

# Review de fichier backend

Réaliser une review complète du fichier indiqué par l'utilisateur.

Lire le fichier en entier d'abord. Si `PROJECT.md` est présent : utiliser sa stack,
ses conventions, ses chemins et son **profil domaine** pour adapter chaque constat.
S'il est absent : conventions génériques, le dire une fois.

Analyser selon les 4 axes ci-dessous. Pour chaque constat, expliquer **POURQUOI**
c'est un problème — pas seulement comment le corriger.

> **Gradation** : l'axe 1 (patterns DDD) ne s'applique en entier que si le module est
> au profil « riche » (`skillkit/guidelines/ddd.md`). En profil « simple », vérifier uniquement
> le socle (axes 2-4) — et signaler toute sur-ingénierie (aggregate sur un CRUD).

---

## Axe 1 — Patterns DDD / CQRS (profil riche)

Détecter et expliquer chaque écart aux conventions aggregate / handler / repository :

| Détecté | Problème | Correction attendue |
|---|---|---|
| Setter `public` sur un aggregate ou une entité | Casse l'encapsulation — l'état est modifiable de n'importe où | Constructeur `private` + méthodes métier nommées (`ChangeStatus()`, `Recalculate()`) |
| Constructeur `public` sur un aggregate | Contourne la factory — invariants non validés à la création | `public static {X}Aggregate Create(...)` + constructeur `private`/`protected` |
| Aggregate non `sealed` | Autorise l'héritage — complique encapsulation et tests | Toujours `sealed` |
| `new {X}Aggregate(...)` direct dans un handler | Contourne la factory — invariants non garantis | `{X}Aggregate.Create(...)` |
| `public` sur un handler de command/query | Exposé hors de sa couche — casse l'encapsulation | `internal sealed` |
| `public` sur un validator | Idem — les validators sont des détails d'implémentation | `internal sealed` |
| Interface de repository définie côté infrastructure | Couple l'infrastructure au domaine | Interface côté domaine, implémentation côté infrastructure |
| `throw` dans un handler | Casse le flux `Result<T>` — exception non gérée uniformément | Retourner `Result.Failure(Error.NotFound(...))` ou équivalent |
| Handler retournant `T` au lieu de `Result<T>` | Perd la gestion d'erreur uniforme de l'application | Retourner `Result<TResponse>` systématiquement |
| `try/catch` dans un endpoint | Masque les erreurs, casse le flux `Result<T>` | `.Match(onSuccess, toErrorResponse)` |
| Logique métier dans un endpoint | Viole le SRP — un endpoint ne fait que dispatcher | Zéro logique : `mediator.Send(...) → .Match(...)` |
| Mapping entité ↔ aggregate dans un handler | Fuite de couche — le handler ignore comment la persistence fonctionne | Extension de mapping dédiée côté infrastructure |
| Version de dépendance en dur dans un .csproj avec versioning centralisé | Risque de désynchronisation | Laisser le fichier central porter la version |

## Axe 2 — Architecture et responsabilités (socle — toujours)

Vérifier (`skillkit/guidelines/architecture.md`) :

- **Handler trop gros** : fait-il plus d'une chose ? Orchestrer OU transformer — pas les deux.
- **Logique métier dans un handler** : une règle métier complexe vit dans le domaine,
  pas inline dans le handler.
- **Dépendance d'infrastructure dans le domaine** : ni ORM, ni client HTTP, ni framework.
- **Command/Query non `public record`** : inaccessible depuis la couche d'entrée.
- **Repository contenant des règles métier** : il persiste et lit — il ne filtre pas
  par règle métier, ne valide pas d'entrées.
- **Endpoint injectant plus que le mediator + cancellation token** : tout passe par
  le mediator.
- **Domain event sans handler enregistré** : événement dispatché ignoré en silence.

## Axe 3 — Qualité du langage

Vérifier :

- Type nullable (`string?`, `T?`) où la valeur ne devrait jamais être null — masque
  un problème de design.
- Opérateur null-forgiving (`!`) sans commentaire justificatif.
- Abus de `var` où le type n'est pas évident.
- Méthodes `async` sans propagation du cancellation token.
- Méthode `async` sans `await` — méthode synchrone déguisée.
- Appel bloquant (`.Result`, `.Wait()`) sur une opération async — deadlock potentiel.
- Heure locale (`DateTime.Now`) au lieu d'UTC (`DateTime.UtcNow`).
- ID généré dans le repository au lieu de la factory domaine — l'ID appartient au domaine.
- Record mutable (`{ get; set; }`) pour un DTO ou Value Object qui devrait être
  immuable — préférer `{ get; init; }` ou un record positionnel.
- Value Object sans validation d'invariants à la construction.

Pour une passe complète au niveau langage : `skillkit/skills/backend/csharp-quality/`.

## Axe 4 — Gestion des erreurs

Adapter au pattern d'erreurs déclaré dans `PROJECT.md`. Sinon, appliquer ce qui suit
en générique.

Vérifier :

- Retour de `null` au lieu d'un résultat d'échec typé dans un handler.
- Accès à `.Value` sans vérification de succès préalable — crash en cas d'échec.
- Première erreur seule transmise quand la liste complète est disponible.
- Type d'échec générique quand un type sémantique existe (`NotFound`, `Validation`, `Business`).
- Objets d'erreur sans `code` machine + `message` humain.
- Mapping résultat → HTTP manquant dans l'endpoint.

**Mapping générique type d'erreur → statut HTTP :**

| Type d'erreur | Statut HTTP | Quand |
|---|---|---|
| Validation | 400 | Entrée invalide ou règle d'entrée violée |
| NotFound | 404 | Ressource inexistante |
| Business / Conflict | 422 | Règle métier violée (entrée valide, état invalide) |
| Failure | 500 | Erreur technique inattendue |

**Pattern d'endpoint attendu (noms à adapter à la stack) :**

```
result = await mediator.Send(command, cancellationToken)
return result.Match(
    succès → HTTP 200 avec payload,
    échec  → réponse d'erreur mappée (ProblemDetails ou équivalent)
)
```

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
| 🔴 | Critique | À corriger absolument — bug d'exactitude, sécurité, risque de perte de données |
| 🟠 | Majeur | À corriger — problème significatif de design ou de maintenabilité |
| 🟡 | Mineur | Faible impact — nommage, style, petite amélioration structurelle |
| 🟢 | Suggestion | Optionnel — idée de refactor ou piste future |

**Règles :**
- Un bloc par constat — ne pas regrouper des problèmes sans rapport.
- `Localisation` omissible si le problème est structurel (pas de ligne unique).
- `Correction` actionnable — jamais « envisager d'améliorer ».
- `Avant / Après` avec le code exact du fichier, pas des exemples inventés.

## Synthèse finale obligatoire

Terminer chaque review par ce bloc exact :

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

**Règles :**
- Le score reflète la santé globale du code, pas le nombre de constats.
- Le top 3 reprend des constats déjà listés — pas de nouveau problème ici.
- « Ce qui fonctionne bien » est obligatoire. À défaut de point fort, noter ce qui
  est au moins correct.

---

## Règle pédagogique

Ne pas se contenter de montrer « le bon code ». Pour les patterns importants
(`Result<T>`, aggregates `sealed`, handlers `internal sealed`, domain events),
expliquer brièvement le mécanisme sous-jacent. L'objectif : que le dev comprenne
le **POURQUOI**, pas seulement le **QUOI**.
