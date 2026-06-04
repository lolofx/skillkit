# DDD — la gradation par microservice

> **Quand charger ce fichier :** dès qu'on touche au domaine d'un module dont le profil
> est « riche », ou pour décider du profil d'un nouveau module.
>
> Le socle (`skillkit/guidelines/architecture.md`) est obligatoire partout.
> La panoplie DDD décrite ici se **gradue** : on l'applique là où le métier le justifie,
> jamais par réflexe.

## 1. Deux profils, déclarés dans PROJECT.md

Le champ **« Profil domaine »** de `PROJECT.md` déclare le profil — globalement ou
module par module. Devs et agents lisent cette déclaration pour savoir quoi générer.

| | Profil **simple** | Profil **riche** |
|---|---|---|
| Quand | CRUD, référentiel, peu de règles | Domaine métier fort : invariants, états, calculs |
| Entités | Entités simples (POCO + validation d'entrée) | Aggregates `sealed` + factory |
| Handlers | Fins, logique de validation basique | Fins aussi — délèguent aux méthodes de l'aggregate |
| Erreurs | Convention du projet (`PROJECT.md`) | `Result<T>` de bout en bout |
| Value Objects | Non | Oui, pour tout concept avec règle propre |
| Domain events | Non | Oui, si des réactions métier en découlent |
| Entité ORM | Peut servir directement | **Distincte** de l'aggregate, mapping explicite |

### Critères de choix

Le profil **riche** se justifie si le module présente plusieurs de ces signes :

- Règles métier nombreuses : transitions d'état, validations croisées, calculs.
- Invariants à protéger (une valeur qui doit toujours respecter une contrainte métier).
- Cycle de vie avec états et transitions (statuts, progression).
- Concepts métier avec leurs propres règles de validité (candidats Value Objects).
- Logique métier réutilisée par plusieurs cas d'usage.

Sinon : profil **simple**. Un aggregate au-dessus d'un CRUD est de la sur-ingénierie —
il ajoute du code, des mappings et des tests sans protéger aucune règle.

### Arbitrage

- Profil non déclaré dans `PROJECT.md`, ou incohérent avec le code observé
  → la Phase 1 de la skill `ddd-review` (« DDD justifié ? ») sert d'arbitre.
- Les reviews vérifient le socle **toujours**, la panoplie DDD **seulement si le profil
  la déclare** — et signalent tout écart entre profil déclaré et code constaté.

## 2. Profil simple — règles

- Entités simples, sans factory ni encapsulation lourde.
- Handlers fins : validation d'entrée, appel repository, mapping DTO.
- Pas d'aggregate, pas de Value Object, pas de domain event.
- Le socle reste entier : ports côté domaine, découpage par use case,
  zéro logique métier dans endpoints et repositories.

## 3. Profil riche — la panoplie

### Aggregate

- `sealed`, constructeur `private`.
- Factory `public static {X}Aggregate Create(...)` : valide **tous** les invariants,
  lève une exception sur entrée invalide (une création invalide est un bug d'appelant).
- `Reconstitute(...)` pour reconstruire depuis la persistence **sans re-valider**
  (les invariants ont été garantis à la création).
- **Aucun setter public** : tout changement d'état passe par une méthode métier nommée
  (`Confirm()`, `Cancel(reason)` — jamais `set Status`).
- Les méthodes de mutation portant une validation métier retournent `Result<T>` :
  un échec métier attendu n'est pas une exception.
- Les IDs sont générés dans la factory, pas par la base.

### Value Objects

- Tout concept métier avec règle de validité propre (email, montant, période…).
- Valident leurs invariants à la construction.
- Immuables, égalité par valeur.

### Result&lt;T&gt;

- De bout en bout : aggregate → handler → endpoint.
- Les handlers retournent `Result<T>` — tous les échecs sont retournés explicitement,
  jamais de `throw` pour un cas métier attendu.
- L'Api convertit le `Result<T>` en réponse HTTP via le mapper d'erreurs du projet.

### Domain events

- Implémentent l'interface d'événement domaine du projet, dispatchés via l'aggregate.
- Chaque événement dispatché a un handler enregistré — un événement orphelin est un bug.

### Entité ORM ≠ aggregate

- L'entité ORM vit dans l'infrastructure, l'aggregate dans le domaine — deux objets distincts.
- Conversion par extensions de mapping explicites : Aggregate ↔ Entité ORM ↔ DTO.
- Le schéma de base peut évoluer sans toucher au domaine.

## 4. Checklist gradation (profil riche uniquement)

- [ ] Aggregates `sealed`, constructeur privé, factory `Create()` validant les invariants.
- [ ] `Reconstitute()` présent pour la reconstruction depuis la persistence.
- [ ] Aucun setter public — mutations par méthodes métier nommées.
- [ ] Mutations avec validation métier → `Result<T>`.
- [ ] Value Objects pour les concepts à règles propres, validés à la construction.
- [ ] `Result<T>` de bout en bout, zéro `throw` pour un échec métier attendu.
- [ ] Entité ORM distincte de l'aggregate, mappings explicites.
- [ ] Domain events dispatchés via l'aggregate, chacun avec son handler.
- [ ] Règles métier testables sans aucune infrastructure.
