#!/usr/bin/env bash
# guard-commit.sh — hook PreToolUse (Bash, pattern `git commit`), variante linux / mac / WSL2 / CI.
# Refuse le commit si aucune suite de tests verte récente (marqueur écrit par track-tests).
# Projets reconnus : .NET (*.sln/*.csproj), node (*.test.js), frontend (angular.json/package.json).
# Dépendance : jq.

set -u
MAX_AGE_MINUTES=30
payload=$(cat)

# sans jq : gate inactif — le signaler visiblement plutôt que se taire
if ! command -v jq >/dev/null 2>&1; then
    printf '{"systemMessage":"guard-commit : jq manquant, gate de commit INACTIF sur ce poste (installer jq)"}\n'
    exit 0
fi

tool=$(printf '%s' "$payload" | jq -r '.tool_name // empty')
[ "$tool" = "Bash" ] || exit 0
cmd=$(printf '%s' "$payload" | jq -r '.tool_input.command // empty')
printf '%s' "$cmd" | grep -Eqi 'git[[:space:]]+commit\b' || exit 0

# Repo sans projet reconnu → gate non applicable
dotnet_files=$(git ls-files '*.sln' '*.csproj' 2>/dev/null)
node_tests=$(git ls-files '*.test.js' '*.test.mjs' 2>/dev/null)
frontend_files=$(git ls-files 'angular.json' 'package.json' 2>/dev/null)
{ [ -n "$dotnet_files" ] || [ -n "$node_tests" ] || [ -n "$frontend_files" ]; } || exit 0

if [ -n "$dotnet_files" ]; then
    suite="dotnet test"
elif [ -n "$node_tests" ]; then
    suite="node --test"
elif git ls-files 'angular.json' 2>/dev/null | grep -q .; then
    suite="ng test"
else
    suite="npm test"
fi

block() {
    msg="COMMIT REFUSE par guard-commit : $1. Lance '$suite' (suite complete) et committe seulement si tout est vert."
    jq -cn --arg r "$msg" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$r}}'
    exit 0
}

marker=".claude/.last-test-run"
[ -f "$marker" ] || block "aucun '$suite' trace — les tests n'ont pas ete executes"

line=$(head -n1 "$marker")
ts=${line%%|*}
result=${line#*|}

[ "$result" = "PASS" ] || block "le dernier '$suite' a echoue ($ts)"

ts_epoch=$(date -d "$ts" +%s 2>/dev/null || date -j -f '%Y-%m-%dT%H:%M:%S' "${ts%%.*}" +%s 2>/dev/null) || block "marqueur de tests illisible"
now_epoch=$(date -u +%s)
age_minutes=$(( (now_epoch - ts_epoch) / 60 ))
[ "$age_minutes" -le "$MAX_AGE_MINUTES" ] || block "le dernier '$suite' vert date de plus de $MAX_AGE_MINUTES minutes — relance la suite"

exit 0
