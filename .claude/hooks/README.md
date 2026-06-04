# Hooks de sécurité

| Hook | Type | Action |
|---|---|---|
| `guard-bash` | `PreToolUse` (Bash) | Bloque : `rm -rf` (hors chemins temp), `git push --force` sur main/master, `git reset --hard`, `DROP DATABASE`/`DROP TABLE`, `TRUNCATE TABLE`, `del /s /q`, `Remove-Item -Recurse -Force` sur une racine |
| `guard-commit` | `PreToolUse` (Bash, `git commit`) | Refuse le commit sans suite de tests verte récente (< 30 min) — `dotnet test` ou `node --test`. **Non applicable si le repo ne contient ni `.sln`/`.csproj` ni `*.test.js`/`*.test.mjs`** |
| `track-tests` | `PostToolUse` (Bash, `dotnet test` / `node --test`) | Écrit le marqueur `.claude/.last-test-run` (timestamp UTC + PASS/FAIL) lu par guard-commit. Détecte les sorties EN **et FR** de `dotnet test`, et le résumé `# pass` / `# fail` de `node --test` |

## Mécanisme de blocage : JSON, pas code retour

Les hooks bloquent en écrivant sur stdout un JSON
`{"hookSpecificOutput":{"permissionDecision":"deny","permissionDecisionReason":"…"}}`
et sortent **toujours en 0**. C'est ce qui permet le dispatch polyglotte ci-dessous :
un chaînage `||` ne peut pas avaler le signal de blocage (un `exit 2` le pourrait).

## Multi-environnements : dispatch polyglotte

Les équipes sont hétéroclites (Windows pwsh 5.1 / pwsh 7, WSL2, Linux, Mac).
Chaque hook de `settings.json` est câblé ainsi :

```
powershell -NoProfile -ExecutionPolicy Bypass -File .claude/hooks/X.ps1 || bash .claude/hooks/X.sh
```

| Environnement | Shell des hooks | Ce qui s'exécute | Prérequis |
|---|---|---|---|
| Windows (pwsh 5.1 ou 7) | cmd | `X.ps1` via Windows PowerShell (toujours présent) ; `bash` jamais atteint | — |
| WSL2 / Linux / CI | sh | `powershell` introuvable (exit ≠ 0) → `X.sh` via bash | `jq` (`apt install jq`) |
| Mac | sh | idem → `X.sh` (compatible bash 3.2, fallback `date -j` BSD inclus) | `jq` (`brew install jq`) |

Sans `jq` sur un poste Unix, les `.sh` émettent un `systemMessage` d'avertissement
(« garde-fous INACTIFS ») au lieu de se taire.

## Encodage des `.ps1` — important

Les scripts PowerShell sont encodés en **UTF-8 avec BOM**. Sans BOM, Windows
PowerShell 5.1 les lit en ANSI : les caractères accentués/typographiques corrompent
le parsing (un tiret cadratin devient un guillemet qui termine la chaîne). Toute
modification doit préserver le BOM (`Set-Content -Encoding utf8BOM`).

Les `.ps1` re-décodent aussi leur stdin en UTF-8 (PS 5.1 lit en codepage OEM par
défaut — sans ça, la détection des sorties accentuées de `dotnet test` FR échoue)
et tolèrent un BOM en tête de payload.

## Tests

`test-hooks.ps1` est un smoke test manuel (20 cas : guard-bash, guard-commit,
track-tests dotnet EN + FR et node) :

```
powershell -NoProfile -ExecutionPolicy Bypass -File .claude/hooks/test-hooks.ps1
```

## Doubles sécurités

`permissions.deny` dans `settings.json` refuse déclarativement les mêmes patterns —
si un hook est désactivé, le deny tient encore. Un hook ne doit **jamais** être
contourné : corriger la cause (lancer les tests, retirer la commande dangereuse).
