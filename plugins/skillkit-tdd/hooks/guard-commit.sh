#!/usr/bin/env bash
# guard-commit.sh - PreToolUse hook (Bash, `git commit` commands), Linux / macOS / WSL variant.
# Denies the commit unless a recent green test run was recorded by track-tests.
# Recognised projects: .NET (*.sln/*.csproj), node (*.test.js), frontend (angular.json/package.json).
# Requires: jq.

set -u
MAX_AGE_MINUTES=30
payload=$(cat)

# Without jq the gate cannot work: say so visibly instead of staying silent
if ! command -v jq >/dev/null 2>&1; then
    printf '{"systemMessage":"guard-commit: jq is missing, the commit gate is INACTIVE on this machine (install jq)"}\n'
    exit 0
fi

tool=$(printf '%s' "$payload" | jq -r '.tool_name // empty')
[ "$tool" = "Bash" ] || exit 0
cmd=$(printf '%s' "$payload" | jq -r '.tool_input.command // empty')
printf '%s' "$cmd" | grep -Eqi 'git[[:space:]]+commit\b' || exit 0

# No recognised project: the gate does not apply
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
    msg="COMMIT DENIED by guard-commit: $1. Run '$suite' (full suite) and commit only when everything is green."
    jq -cn --arg r "$msg" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$r}}'
    exit 0
}

marker=".claude/.last-test-run"
[ -f "$marker" ] || block "no '$suite' run recorded - the tests have not been run"

line=$(head -n1 "$marker")
ts=${line%%|*}
result=${line#*|}

[ "$result" = "PASS" ] || block "the last '$suite' failed ($ts)"

ts_epoch=$(date -d "$ts" +%s 2>/dev/null || date -j -f '%Y-%m-%dT%H:%M:%S' "${ts%%.*}" +%s 2>/dev/null) || block "test marker unreadable"
now_epoch=$(date -u +%s)
age_minutes=$(( (now_epoch - ts_epoch) / 60 ))
[ "$age_minutes" -le "$MAX_AGE_MINUTES" ] || block "the last green '$suite' is older than $MAX_AGE_MINUTES minutes - rerun the suite"

exit 0
