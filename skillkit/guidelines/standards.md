# Standards globaux

> **Quand charger ce fichier :** dès qu'on écrit ou modifie du code, quel que soit le langage.
> Référence de base pour tout code produit par un dev ou un agent.

## 1. Style

- Code **lisible** : la clarté prime sur la concision astucieuse.
- Noms explicites en anglais : `CalculateInvoiceTotal`, `CustomerRepository`.
  Pas d'abréviations opaques (`CalcInvTot`), pas de noms génériques (`Manager`, `Helper`, `Utils`).
- Une **responsabilité principale** par classe/composant.
- Une méthode tient à l'écran sans scroll excessif ; au-delà, extraire.
- Pas de commentaire qui paraphrase le code. Un commentaire explique un **pourquoi**
  non évident, jamais un quoi.
- Suivre l'idiome du langage et du code environnant : densité de commentaires,
  conventions de nommage, style existant.

## 2. Gestion des erreurs

- **Jamais** d'exception avalée sans traitement ni log.
- Distinguer deux familles :
  - **Échec métier attendu** (validation, conflit, introuvable) → valeur de retour
    explicite (`Result<T>` ou équivalent du projet, voir `PROJECT.md`).
  - **Bug ou panne technique** (état impossible, infra en panne) → exception.
- Exceptions spécifiques plutôt que génériques quand le code appelant doit distinguer les cas.
- Toute erreur logguée porte son contexte : identifiants métier (id client, id commande…),
  opération en cours, message technique.

## 3. Logs

- Aucune donnée sensible dans les logs (mot de passe, token, données bancaires, données personnelles).
- Niveaux cohérents : `Debug` (diagnostic dev), `Info` (événement métier normal),
  `Warn` (anormal mais géré), `Error` (échec nécessitant attention).
- Les logs servent à **diagnostiquer en production** : entrée/sortie de cas d'usage,
  erreurs, chemins non standards. Messages courts, contexte structuré.

## 4. Nommage

- Types, méthodes, propriétés : selon la convention du langage (`PascalCase` en C#).
- Le nom dit l'**intention métier**, pas la technique : `ConfirmOrder()` et non `UpdateStatus(2)`.
- Booléens nommés en affirmation : `IsActive`, `HasPendingInvoice`.
- Conventions spécifiques au projet : voir `PROJECT.md`.

## 5. Tests

- Le workflow TDD est **obligatoire** en backend : voir `skillkit/guidelines/tdd.md`.
- Un test vérifie un **comportement métier**, pas une implémentation.
  Pas de test « cosmétique » qui duplique le code testé.
- Tests stables, lisibles, indépendants entre eux (pas d'ordre d'exécution implicite).
- Structure AAA : Arrange / Act / Assert.

## 6. Revue et commits

- Tout changement significatif passe par une revue (Pull Request ou équivalent).
- Avant tout commit : **tests verts exécutés** + documentation/spec à jour.
  C'est non négociable — voir `skillkit/guidelines/tdd.md`.
- Points de vigilance en revue : lisibilité, respect des guidelines, cohérence avec
  `skillkit/guidelines/architecture.md`, impact performance et sécurité.

## 7. Code généré par IA

- L'IA est une assistante, pas une autorité : tout code généré est relu et compris
  avant d'être commité.
- Le code généré respecte l'intégralité des fichiers de `skillkit/guidelines/` et de `PROJECT.md`.
- Ne jamais intégrer du code non compris.
