# TDD — workflow obligatoire

> **Quand charger ce fichier :** dès qu'on implémente du code backend (feature, fix, refactor).
>
> Le TDD est **obligatoire en backend**. Pas une recommandation : la règle.
> Aucun code de production sans test rouge préalable. Aucun commit sans tests verts.

## 1. Le cycle : red → green → refactor

Chaque étape d'un plan (`specs/<feature>/plan.md`) = **un cycle TDD complet**.

### 🔴 RED — écrire un test qui échoue

1. Écrire **un seul** test, le plus petit qui fasse avancer l'étape.
2. L'exécuter et **vérifier qu'il échoue pour la BONNE raison** :
   - ✅ Échec attendu : assertion fausse, méthode absente — le comportement n'existe pas encore.
   - ❌ Mauvaise raison : erreur de compilation imprévue, mauvais setup, typo —
     corriger le test, pas commencer l'implémentation.
3. Un test qui passe du premier coup est suspect : soit le comportement existe déjà,
   soit le test ne teste rien. Investiguer avant de continuer.

### 🟢 GREEN — implémentation minimale

1. Écrire le **minimum** de code pour faire passer le test. Pas d'anticipation,
   pas de « tant qu'on y est ».
2. Respecter `skillkit/guidelines/architecture.md` (socle) et `skillkit/guidelines/ddd.md`
   selon le profil domaine déclaré dans `PROJECT.md`.
3. Exécuter **toute la suite** : le nouveau test passe, aucun autre ne casse.

### 🔵 REFACTOR — nettoyer sous protection

1. Améliorer le code (nommage, duplication, extraction) **sans changer le comportement**.
2. Les tests restent verts à chaque pas. Un test qui casse pendant le refactor
   → revenir en arrière, pas adapter le test.
3. Refactorer aussi les tests si besoin (lisibilité), jamais leurs assertions.

## 2. Règles non négociables

- **Jamais modifier un test pour le faire passer.** Si un test semble faux,
  le signaler explicitement — la correction est une décision, pas un contournement.
- **Jamais de code de production sans test rouge préalable.** Y compris pour
  « un petit fix évident ».
- **Séparation des rôles quand on travaille en agents** : celui qui écrit le test
  ne l'implémente pas ; celui qui implémente ne touche pas aux tests.
- Un test vérifie un **comportement** observable, pas une implémentation
  (pas d'assertion sur des détails internes qui casseraient au moindre refactor).
- Structure AAA (Arrange / Act / Assert), un comportement par test, nom de test
  qui décrit le scénario : `Create_WithEmptyName_ReturnsValidationError`.

## 3. Gate de commit

Avant **tout** commit, dans cet ordre :

1. **Tests exécutés et verts** — la suite complète, à l'instant du commit,
   pas « ils passaient tout à l'heure ».
2. **Documentation à jour** — spec (`specs/<feature>/`), suivi (`tasks.md`),
   et toute doc impactée par le changement.
3. **Guidelines respectées** — vérification rapide socle + profil domaine.

Si l'un des trois manque : **pas de commit**. On corrige d'abord.

## 4. Quoi tester (et quoi ne pas tester)

| Cible | Tests unitaires |
|---|---|
| Règles métier (aggregate, Value Objects, entités) | ✅ Prioritaires — happy path + cas d'échec |
| Handlers (commands/queries) | ✅ Avec mocks des ports — orchestration + mapping + erreurs |
| Validators | ✅ Cas valides + chaque règle de rejet |
| Repositories | ❌ Hors périmètre unitaire — tests d'intégration séparés |
| Endpoints | ❌ Dispatch pur, rien à asserter en unitaire |

- Tests d'architecture si pertinents (ex. : aucun import ORM dans le domaine).
- Tests d'intégration (DB, services externes) isolés de la suite unitaire rapide.
