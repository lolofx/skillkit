---
name: ddd-review
description: Évaluer l'architecture DDD/CQRS d'un module backend en 3 phases — le DDD est-il justifié ? (arbitre du profil domaine), revue couche par couche, détection des fuites de couche. Utiliser pour auditer un module, valider un choix de profil ou vérifier la conformité socle + gradation.
---

# Review architecture DDD/CQRS

Analyser l'architecture du module indiqué par l'utilisateur.

Lire tous les fichiers du module. Si `PROJECT.md` est présent : utiliser sa stack,
ses chemins de couches, ses conventions et son **profil domaine déclaré** pour adapter
chaque constat. S'il est absent : conventions génériques, le dire une fois.

Références : `skillkit/guidelines/architecture.md` (socle — vérifié **toujours**),
`skillkit/guidelines/ddd.md` (gradation — vérifiée **selon le profil**).

---

## Phase 1 — Le DDD est-il justifié ici ?

Cette phase est l'**arbitre du profil domaine** : elle tranche quand le profil n'est pas
déclaré dans `PROJECT.md`, ou semble mal choisi.

Évaluer selon ces critères (`skillkit/guidelines/ddd.md`) :

- Combien de règles métier ? (transitions d'état, validations, calculs)
- Des invariants à protéger ? (une valeur qui doit toujours respecter une contrainte métier)
- La logique métier est-elle réutilisée par plusieurs cas d'usage ?
- Des états et des transitions ? (cycles de vie, statuts, progression)
- Des Value Objects avec leurs propres règles de validité ?

**Verdict :**

- ✅ Profil « riche » justifié → continuer en Phase 2 avec la checklist complète
- ⚠️ Profil « riche » excessif → expliquer pourquoi et proposer la structure simplifiée
  (CQRS sans aggregate riche — profil « simple »)
- 🔶 **Incohérence** profil déclaré ↔ code observé → la signaler explicitement
  (ex. : profil « simple » déclaré mais invariants métier éparpillés dans les handlers)

---

## Phase 2 — Revue couche par couche

### Structure attendue

Adapter les noms et chemins à `PROJECT.md`. Structure générique de référence :
voir `skillkit/guidelines/architecture.md` §3 (module métier / use case, jamais technique).

### Couche Domaine

**Socle (toujours) :**

- [ ] Zéro import d'infrastructure (pas d'ORM, de client HTTP, de framework)
- [ ] `I{X}Repository` est une interface `public` côté domaine, sans dépendance ORM
- [ ] Les règles métier sont testables sans aucune infrastructure

**Gradation (profil riche uniquement) :**

- [ ] Aggregates `sealed` avec constructeur `private` ou `protected`
- [ ] Factory `public static {X}Aggregate Create(...)` validant les invariants (exception si invalide)
- [ ] `Reconstitute(...)` pour reconstruire depuis la persistence sans re-valider
- [ ] Méthodes de mutation avec validation métier → `Result<T>` (échec attendu ≠ bug)
- [ ] Aucun setter public — changements d'état par méthodes métier nommées
- [ ] IDs générés dans la factory, pas par la base
- [ ] Value Objects validant leurs invariants à la construction
- [ ] Domain events implémentant l'interface du projet, dispatchés via l'aggregate

### Couche Application

- [ ] Un handler = une action métier précise (un Command ou une Query)
- [ ] Commands et Queries en `public record` implémentant les interfaces du projet
- [ ] Handlers et validators `internal sealed`
- [ ] Le projet de test accède aux internals (ex. : `InternalsVisibleTo`)
- [ ] Aucune préoccupation HTTP dans les handlers
- [ ] Pas de logique métier inline — délégation aux méthodes du domaine
- [ ] Handlers retournant `Result<T>` — tous les échecs explicites, pas de `throw` (profil riche)
- [ ] Validators utilisant la librairie du projet, `internal sealed`
- [ ] Mapping DTO ↔ domaine délégué à une extension, pas inline dans le handler

### Couche Infrastructure

- [ ] Repository `internal sealed` implémentant l'interface du domaine
- [ ] Entités ORM distinctes des objets du domaine (profil riche)
- [ ] Configuration tables/colonnes selon les conventions du projet, index explicites
- [ ] Extensions de mapping Aggregate ↔ Entité ORM ↔ DTO (profil riche)
- [ ] Aucune logique métier dans le repository — persistence et lecture uniquement
- [ ] Lectures seules en no-tracking
- [ ] Écritures persistées explicitement avec cancellation token
- [ ] Repository enregistré dans le conteneur DI avec le bon lifetime

### Couche Présentation

- [ ] L'enregistrement du module organise les endpoints en groupes de routes
- [ ] Chaque groupe de routes dans sa classe dédiée
- [ ] Endpoints injectant uniquement le mediator + cancellation token (+ paramètres)
- [ ] Zéro logique métier — uniquement dispatch → `.Match(...)`
- [ ] Zéro `try/catch` — les erreurs passent par `Result<T>` → mapper d'erreurs
- [ ] Autorisation déclarée explicitement sur chaque groupe
- [ ] Types de réponse OpenAPI documentés (succès + erreurs)
- [ ] Enregistrement du module auto-découvert, pas câblé à la main

### Tests

- [ ] Tests de factory d'aggregate : happy path + entrées invalides (exception attendue)
- [ ] Tests de Value Objects : happy path + violations d'invariants
- [ ] Tests des méthodes de mutation : succès (`result.IsSuccess`) + cas d'échec
- [ ] Tests de handlers : appels repository vérifiés (mock) + mapping DTO + cas d'erreur
- [ ] Structure AAA (Arrange / Act / Assert)
- [ ] Repositories hors périmètre unitaire (intégration)
- [ ] Endpoints hors périmètre unitaire (dispatch pur)
- [ ] Tests d'architecture si pertinents (ex. : aucun import ORM dans le domaine)

---

## Phase 3 — Détection des fuites de couche

Une **fuite de couche** = de la logique placée dans la mauvaise couche.

Détecter et rapporter :

- Logique métier dans un handler (devrait être dans le domaine)
- Dépendance ORM ou infrastructure importée dans le domaine ou un handler
- Endpoint appelant un repository directement (contourne le mediator)
- Repository contenant des règles de filtrage métier
- Contexte HTTP dans un handler
- `public` sur un handler ou validator (casse l'encapsulation du module)
- Aggregate avec setter public (casse l'encapsulation du domaine)
- Entité ORM utilisée directement dans un handler (contourne le mapping)
- Domain event dispatché sans handler enregistré

---

## Format de sortie

### Phase 1 — Verdict

Énoncer clairement : **profil riche justifié / excessif / partiellement justifié /
incohérent avec le déclaré**, avec 2-3 lignes de justification.

### Phase 2 — Scores par couche

```
## Review architecture — {MODULE}

### Scores par couche
- Domaine        : X/5 — {commentaire en une ligne}
- Application    : X/5 — {commentaire}
- Infrastructure : X/5 — {commentaire}
- Présentation   : X/5 — {commentaire}
- Tests          : X/5 — {commentaire}
```

### Phase 3 — Fuites de couche

Pour chaque constat :

```
{🔴|🟠|🟡|🟢} **{Titre court}**
Localisation : `{fichier:ligne — ou couche / classe}`
Problème : {ce qui ne va pas et pourquoi c'est important}
Correction : {suggestion concrète et actionnable}
```

**Niveaux de sévérité :**

| Niveau | Libellé | Quand l'utiliser |
|---|---|---|
| 🔴 | Critique | À corriger absolument — bug d'exactitude, sécurité, risque de perte de données |
| 🟠 | Majeur | À corriger — problème significatif de design ou de maintenabilité |
| 🟡 | Mineur | Faible impact — nommage, style, petite amélioration structurelle |
| 🟢 | Suggestion | Optionnel — idée de refactor ou piste future |

### Synthèse finale obligatoire

```
---
**Top 3 à corriger :**
1. {constat le plus impactant — une ligne}
2. {deuxième — une ligne}
3. {troisième — une ligne}

**Ce qui fonctionne bien :**
- {point fort réel — jamais omis, même pour un module faible}
```

---

## Règle pédagogique

Pour chaque problème, expliquer le **principe DDD / Clean Architecture violé**
et **pourquoi il compte** :

- **Testabilité** : le handler est-il testable sans ORM ni infrastructure HTTP ?
- **Maintenabilité** : où regarde-t-on quand une règle métier change ?
- **Évolutivité** : le schéma de base peut-il changer sans toucher au domaine ?
- **Encapsulation** : le module peut-il changer ses internes sans casser la présentation ?
