#!/usr/bin/env bash
# track-tests.sh - PostToolUse hook (Bash), Linux / macOS / WSL variant.
# Recognises: dotnet test, node --test, ng test, npm test, npm run test, vitest.
# Writes a marker (UTC ISO 8601 timestamp + PASS/FAIL) read by guard-commit.
# Requires: jq.

set -u
payload=$(cat)

# Without jq no marker is written: say so (guard-commit will deny commits anyway)
if ! command -v jq >/dev/null 2>&1; then
    printf '{"systemMessage":"track-tests: jq is missing, test runs will not be recorded (install jq)"}\n'
    exit 0
fi

tool=$(printf '%s' "$payload" | jq -r '.tool_name // empty')
[ "$tool" = "Bash" ] || exit 0
cmd=$(printf '%s' "$payload" | jq -r '.tool_input.command // empty')
printf '%s' "$cmd" | grep -Eqi 'dotnet[[:space:]]+test\b|node[[:space:]]+--test\b|ng[[:space:]]+test\b|npm[[:space:]]+(run[[:space:]]+)?test\b|npx?[[:space:]]+vitest\b|vitest\b' || exit 0

out=$(printf '%s' "$payload" | jq -r '[.tool_response.stdout // empty, .tool_response.stderr // empty, .tool_response.output // empty] | join("\n")')

# Failure patterns cover dotnet test (EN and FR locales), node --test ("# fail N") and build errors.
# The FR patterns are anchored without accents so they survive an encoding layer eating them.
result="PASS"
if printf '%s' "$out" | grep -Eqi 'Failed!|chou.{0,2}[[:space:]]*!|chec[[:space:]]*!|chec[[:space:]]*:[[:space:]]*[1-9]|failed:[[:space:]]*[1-9]|error[[:space:]]+(CS|MSB)[0-9]+|test run failed|[[:space:]]fail[[:space:]]+[1-9]'; then
    result="FAIL"
elif ! printf '%s' "$out" | grep -Eqi 'passed|ussi|total[[:space:]]*:?[[:space:]]*[0-9]|pass[[:space:]]+[0-9]'; then
    # No recognisable summary: do not certify a PASS
    result="FAIL"
fi

timestamp=$(date -u +%Y-%m-%dT%H:%M:%SZ)
mkdir -p .claude 2>/dev/null
printf '%s|%s' "$timestamp" "$result" > .claude/.last-test-run

exit 0
