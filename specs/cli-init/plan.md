# Plan — CLI `skillkit init` (package npm local)

> Spec : ./spec.md
> Profil domaine : simple (outil CLI, aucune logique métier riche)
> Stack : Node ≥ 18, zéro dépendance npm, tests `node:test`
> Code : `cli/` à la racine du repo (`cli/bin/`, `cli/lib/`, `cli/test/`) — jamais copié par init

Principe d'architecture : la logique (manifest, fusions, plan d'actions) est en
**fonctions pures** testables sans CLI ; l'exécution (écritures fs, rapport, parsing
d'arguments) est une coquille mince autour. Les étapes 1-4 ne touchent pas au
filesystem cible ; les étapes 5-8 sont des tests d'intégration sur dossiers temporaires.

---

## Étape 1 — Fusion Markdown par bloc marqué

- **Test (RED)** : `mergeMarkdown(existant, contenuKit)` —
  ① contenu existant sans marqueurs → contenu préservé + bloc kit ajouté entre
  `<!-- skillkit:start -->` / `<!-- skillkit:end -->` ;
  ② marqueurs déjà présents → seul l'intérieur du bloc est remplacé ;
  ③ idempotence : `merge(merge(x)) === merge(x)`.
- **Implémentation (GREEN)** : `cli/lib/merge-markdown.js` — fonction pure (string → string).
- **Done quand** : les 3 tests verts.

## Étape 2 — Fusion JSON additive

- **Test (RED)** : `mergeJson(existant, kit)` —
  ① `settings.json` : hook projet préservé, hooks et `permissions.deny` du kit ajoutés ;
  ② `.mcp.json` : serveur MCP projet préservé, context7 ajouté ;
  ③ pas de doublon si l'entrée du kit existe déjà (idempotence) ;
  ④ JSON cible invalide → résultat « conflit » (pas d'écrasement, pas de crash).
- **Implémentation (GREEN)** : `cli/lib/merge-json.js` — fonction pure.
- **Done quand** : les 4 tests verts.

## Étape 3 — Manifest du kit (quoi copier, comment)

- **Test (RED)** : `buildManifest(racineTemplate)` retourne la liste des fichiers du kit,
  chacun avec sa stratégie —
  ① contient `skillkit/guidelines/*.md`, `skillkit/skills/**/SKILL.md`, `.claude/**`
  (stratégie `copy`), `CLAUDE.md`/`AGENTS.md` (`merge-markdown`),
  `.claude/settings.json`/`.mcp.json` (`merge-json`), `PROJECT.md`/`specs/README.md`
  (`copy-if-absent`) ;
  ② ne contient ni `README.md`, ni `.git/`, ni `.github/`, ni `skillkit/docs/**`,
  ni `specs/<feature>/**`, ni `cli/**`, ni `package.json`.
- **Implémentation (GREEN)** : `cli/lib/manifest.js` — scan du template + règles
  d'inclusion/stratégie déclaratives. Testé contre le repo réel.
- **Done quand** : les 2 tests verts.

## Étape 4 — Plan d'actions (statut par fichier)

- **Test (RED)** : `planActions(manifest, contenusKit, contenusCible)` (fonction pure,
  maps `path → contenu`, clé absente = fichier absent) produit pour chaque fichier un statut —
  ① cible absente → `créé` ; ② identique au kit → `à jour` ;
  ③ différent + stratégie `copy` → `conflit` (jamais d'écrasement) ;
  ④ différent + stratégie fusion → `fusionné` ;
  ⑤ existant + `copy-if-absent` (PROJECT.md) → `ignoré`.
- **Implémentation (GREEN)** : `cli/lib/planner.js` — compare manifest et état cible,
  ne décide que des actions, n'écrit rien.
- **Done quand** : les 5 tests verts.

## Étape 5 — `init` sur cible vierge + rapport

- **Test (RED)** : intégration sur dossier temporaire —
  ① après `init`, la structure complète existe (skillkit/, .claude/, AGENTS.md,
  CLAUDE.md, PROJECT.md, specs/README.md, .mcp.json) ;
  ② aucun fichier exclu présent (README.md, .github/, skillkit/docs/, specs/cli-init/) ;
  ③ le rapport liste chaque fichier avec son statut.
- **Implémentation (GREEN)** : `cli/lib/executor.js` (applique les actions) +
  `cli/lib/report.js` (formatage) + commande `init`.
- **Done quand** : les 3 tests verts — couvre les 3 premiers critères de la spec.

## Étape 6 — `init` sur projet existant : fusion, conflits, idempotence

- **Test (RED)** : intégration —
  ① `CLAUDE.md` existant : texte projet préservé + bloc kit entre marqueurs ;
  ② `settings.json` avec hook projet : hook conservé + hooks kit ajoutés ;
  ③ `.mcp.json` avec serveur projet : conservé + context7 ajouté ;
  ④ `PROJECT.md` rempli : strictement identique avant/après ;
  ⑤ `.claude/commands/tdd.md` modifié localement : non écrasé, statut `conflit` ;
  ⑥ double `init` : contenu identique, aucun doublon (idempotence).
- **Implémentation (GREEN)** : câblage planner + fusions dans l'executor.
- **Done quand** : les 6 tests verts.

## Étape 7 — `skillkit update`

- **Test (RED)** : intégration —
  ① `skillkit/guidelines/tdd.md` divergé → remplacé par la version template ;
  ② `CLAUDE.md` et `.claude/hooks/` personnalisés → strictement identiques avant/après ;
  ③ divergences hors `skillkit/` signalées dans le rapport (informatif) ;
  ④ cible sans dossier `skillkit/` → erreur explicite, exit ≠ 0, rien créé.
- **Implémentation (GREEN)** : commande `update` (réutilise manifest filtré sur
  `skillkit/` + executor en mode écrasement).
- **Done quand** : les 4 tests verts.

## Étape 8 — `--dry-run`, erreurs, entrée CLI + packaging

- **Test (RED)** :
  ① `init --dry-run` et `update --dry-run` : rapport affiché, cible binairement
  inchangée (snapshot avant/après) ;
  ② cible non inscriptible → exit ≠ 0 + message explicite ;
  ③ commande inconnue / aucun argument → usage affiché, exit ≠ 0.
- **Implémentation (GREEN)** : `cli/bin/skillkit.js` (parsing argv, codes de sortie) +
  `package.json` racine (`bin: { skillkit }`, `engines: node >= 18`).
- **Done quand** : tests verts **+ smoke test manuel** : `npm link` puis
  `skillkit init --dry-run` dans un dossier témoin hors repo + section
  « Installation » ajoutée au `README.md` du template.

---

## Couverture des critères d'acceptation

| Critère (spec.md) | Étape(s) |
|---|---|
| Init vierge : structure complète créée | 3, 5 |
| Init vierge : exclusions absentes | 3, 5 |
| Rapport avec statut par fichier | 4, 5 |
| CLAUDE.md existant : texte préservé + bloc marqué | 1, 6 |
| Idempotence du double init | 1, 2, 6 |
| settings.json : hook projet conservé + hooks kit | 2, 6 |
| .mcp.json : serveur projet conservé + context7 | 2, 6 |
| PROJECT.md existant intouché | 4, 6 |
| Fichier kit modifié → conflit, non écrasé | 4, 6 |
| update : skillkit/ divergé remplacé | 7 |
| update : hors skillkit/ intouché | 7 |
| update sans skillkit/ → erreur | 7 |
| dry-run : aucune écriture | 8 |
| Cible non inscriptible → exit ≠ 0 | 8 |

Aucun trou : les 14 critères sont couverts.

## Points d'attention

- **Gate de commit** : `track-tests`/`guard-commit` ne traçaient que `dotnet test`.
  ✅ **Fait au premier commit** : hooks étendus à `node --test` (ps1 + sh, applicabilité
  du gate sur présence de `*.test.js`, smoke test `test-hooks.ps1` passé à 20 cas).
- **Fins de ligne (CRLF/LF)** — décision issue de la review des étapes 1-4 : les
  fonctions pures (étapes 1-4) sont agnostiques ; la **normalisation EOL se fera à la
  lecture fs (étape 5)** avant comparaison (`planActions`) et fusion. Sans ça, un kit
  LF face à une cible CRLF produirait des `conflit` permanents et casserait
  l'idempotence du double init.
- **Contrats durcis en review (étapes 1-4)** : kit JSON invalide → throw explicite
  (erreur de packaging, l'executor convertira en exit ≠ 0 à l'étape 8) ; entrée de
  manifest sans contenu kit correspondant → throw fail-fast (invariant consommé par
  l'étape 7 sur manifest filtré).
- **OneDrive** : les tests d'intégration écrivent dans `$env:TEMP` (hors OneDrive)
  pour éviter les verrous de synchronisation.
- **Chemins Windows/Linux** : utiliser `path.join`/`path.sep` partout — les hooks du
  kit étant polyglottes, le CLI doit l'être aussi (postes Windows + CI Linux).
