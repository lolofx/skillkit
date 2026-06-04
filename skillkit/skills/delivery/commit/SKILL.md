---
name: commit
description: Gate de commit — vérifier que les tests sont exécutés et verts, que la doc/spec est à jour et que les guidelines sont respectées AVANT de committer. Refuse le commit si une condition manque. Utiliser pour tout commit de code.
---

# Commit — gate de qualité

## Objectif

Ce skill est un **gate**, pas un raccourci : il vérifie les trois conditions
non négociables, puis committe. **Si une condition échoue, le commit est refusé** —
on corrige d'abord, on ne contourne jamais.

## Les trois vérifications, dans l'ordre

### ① Tests exécutés et verts

- Lancer la suite de tests complète **maintenant** (ex. : `dotnet test`).
  « Ils passaient tout à l'heure » ne compte pas.
- Un seul test rouge, skippé sans justification ou non exécuté → **refus**,
  avec la sortie d'échec en clair.
- Si le changement ne touche aucun code testable (doc pure, config), le dire
  explicitement et passer à ②.

### ② Documentation et spec à jour

- La feature a une spec ? → `specs/<feature>/spec.md` reflète le comportement livré,
  `tasks.md` est à jour (statut de l'étape : red / green / refactored / reviewed).
- Le changement impacte une doc (README, guidelines, doc d'API) ? → elle est mise à jour
  **dans le même commit**.
- Doc obsolète ou suivi non tenu → **refus**, avec la liste précise de ce qui manque.

### ③ Guidelines respectées (vérification rapide)

Sur le diff uniquement — pas une review complète (pour ça : `skillkit/skills/delivery/review/`) :

- Socle : pas de dépendance technique dans le domaine, pas de dossier technique,
  pas de fuite de couche évidente (`skillkit/guidelines/architecture.md`).
- Profil domaine (`PROJECT.md`) cohérent avec le code ajouté (`skillkit/guidelines/ddd.md`).
- Pas de secret, credential ou donnée sensible dans le diff.
- Violation claire → **refus**, avec le fichier et la règle violée.

## Si tout est vert : committer

1. `git status` + `git diff` : comprendre exactement ce qui part dans le commit.
2. Stager les fichiers concernés — pas de `git add -A` aveugle.
3. Message de commit :
   - première ligne : impérative, concise, l'**intention** du changement ;
   - corps si utile : le pourquoi, pas le comment ;
   - dans la langue des commits existants du repo.
4. Committer, puis confirmer avec le hash et un résumé d'une ligne.

## Format de sortie

```
## Gate de commit

① Tests        : ✅ 42/42 verts (dotnet test, 8s)   | ❌ REFUS — {sortie d'échec}
② Doc / spec   : ✅ tasks.md à jour                  | ❌ REFUS — {ce qui manque}
③ Guidelines   : ✅ RAS sur le diff                  | ❌ REFUS — {fichier + règle}

→ Commit {hash} : {première ligne du message}
   ou
→ COMMIT REFUSÉ : {condition(s) en échec + action corrective}
```

## Garde-fous

- Ne jamais committer « quand même » à la demande, sans que les trois conditions
  soient vertes — expliquer ce qui manque et comment le corriger.
- Ne jamais modifier un test pour le faire passer (`skillkit/guidelines/tdd.md`).
- Ne jamais utiliser `--no-verify` ni contourner un hook.
- Un refus n'est pas un échec : c'est le gate qui fait son travail.
