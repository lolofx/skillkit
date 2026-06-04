#!/usr/bin/env bash
# track-tests.sh — hook PostToolUse (Bash), variante linux/CI.
# Reconnaît : dotnet test, node --test, ng test, npm test, npm run test, vitest.
# Écrit un marqueur (timestamp UTC ISO 8601 + PASS/FAIL) consulté par guard-commit.
# Dépendance : jq.

set -u
payload=$(cat)

# sans jq : marqueur non écrit — le signaler (guard-commit bloquera de toute façon)
if ! command -v jq >/dev/null 2>&1; then
    printf '{"systemMessage":"track-tests : jq manquant, les tests ne seront pas traces (installer jq)"}\n'
    exit 0
fi

tool=$(printf '%s' "$payload" | jq -r '.tool_name // empty')
[ "$tool" = "Bash" ] || exit 0
cmd=$(printf '%s' "$payload" | jq -r '.tool_input.command // empty')
printf '%s' "$cmd" | grep -Eqi 'dotnet[[:space:]]+test\b|node[[:space:]]+--test\b|ng[[:space:]]+test\b|npm[[:space:]]+(run[[:space:]]+)?test\b|npx?[[:space:]]+vitest\b|vitest\b' || exit 0

out=$(printf '%s' "$payload" | jq -r '[.tool_response.stdout // empty, .tool_response.stderr // empty, .tool_response.output // empty] | join("\n")')

result="PASS"
if printf '%s' "$out" | grep -Eqi 'Failed!|[ée]chou[ée][[:space:]]*!|[ée]chec[[:space:]]*!|[ée]chec[[:space:]]*:[[:space:]]*[1-9]|failed:[[:space:]]*[1-9]|error[[:space:]]+(CS|MSB)[0-9]+|test run failed|[[:space:]]fail[[:space:]]+[1-9]'; then
    result="FAIL"
elif ! printf '%s' "$out" | grep -Eqi 'passed|r[ée]ussi|total[[:space:]]*:?[[:space:]]*[0-9]|pass[[:space:]]+[0-9]'; then
    # Aucun résumé reconnaissable → ne pas certifier un PASS
    result="FAIL"
fi

timestamp=$(date -u +%Y-%m-%dT%H:%M:%SZ)
[ -d .claude ] && printf '%s|%s' "$timestamp" "$result" > .claude/.last-test-run

exit 0
