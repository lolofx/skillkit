# CLAUDE.md

@AGENTS.md

---

Ce qui suit est **spécifique à Claude Code**. Le contrat de session est dans `AGENTS.md` (inclus ci-dessus).

## Commands

Chaque command est un wrapper mince qui charge le skill canonique correspondant :

| Command | Skill chargé |
|---|---|
| `/brainstorm <sujet>` | `skillkit/skills/workflow/brainstorm/` |
| `/spec <feature>` | `skillkit/skills/workflow/spec/` |
| `/plan <feature>` | `skillkit/skills/workflow/plan/` |
| `/tdd <étape>` | `skillkit/skills/workflow/tdd/` |
| `/ng-review <fichier>` | `skillkit/skills/frontend/ng-review/` |
| `/ng-explain <pattern>` | `skillkit/skills/frontend/ng-explain/` |
| `/ddd-review <module>` | `skillkit/skills/backend/ddd-review/` |
| `/file-review <fichier>` | `skillkit/skills/backend/file-review/` |
| `/csharp-quality <fichier>` | `skillkit/skills/backend/csharp-quality/` |
| `/review [cible]` | `skillkit/skills/delivery/review/` |
| `/fix-issue <issue>` | `skillkit/skills/delivery/fix-issue/` |
| `/refactor <cible>` | `skillkit/skills/delivery/refactor/` |
| `/generate-tests <cible>` | `skillkit/skills/delivery/generate-tests/` |
| `/commit` | `skillkit/skills/delivery/commit/` — gate : tests verts + doc à jour obligatoires |

## Agents (`.claude/agents/`)

| Agent | Rôle | Garde-fou |
|---|---|---|
| `test-writer` | Écrit les tests RED depuis une étape du plan | Ne touche JAMAIS au code de prod |
| `backend-implementer` | Fait passer au GREEN puis refactore | Ne touche JAMAIS aux tests |
| `backend-reviewer` | Review indépendante post-implémentation | Lecture seule — rapporte, ne corrige pas |

Pour un cycle TDD complet : `test-writer` (RED) → `backend-implementer` (GREEN + refactor)
→ `backend-reviewer`. La séparation test-writer / implementer est volontaire :
un agent ne peut pas adapter un test à son code.

## Hooks actifs (`.claude/hooks/` + `settings.json`)

| Hook | Effet |
|---|---|
| `guard-bash` | Bloque les commandes destructrices (`rm -rf`, `git push --force`, `drop database`…) |
| `guard-commit` | Bloque `git commit` si aucune suite de tests verte récente (dotnet/node/ng/npm/vitest) |
| `track-tests` | Trace chaque exécution de tests — dotnet, node, ng, npm test, vitest (marqueur lu par guard-commit) |

Ne pas contourner un hook qui bloque : corriger la cause (lancer les tests, retirer la commande dangereuse).
