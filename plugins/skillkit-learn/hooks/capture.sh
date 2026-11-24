#!/usr/bin/env bash
# capture.sh - PostToolUse hook (Bash, Skill), Linux / macOS / WSL variant.
# Appends objective session signals to .skillkit/journal/<session>.jsonl:
#   test-run (PASS/FAIL), command-failed, skill-used.
# Never blocks, never prints. Requires: jq (silently skipped without it).

set -u
payload=$(cat)
command -v jq >/dev/null 2>&1 || exit 0

tool=$(printf '%s' "$payload" | jq -r '.tool_name // empty')
session=$(printf '%s' "$payload" | jq -r '.session_id // "unknown"' | tr -d '\n' | tr -c 'A-Za-z0-9_-' '_')
ts=$(date -u +%Y-%m-%dT%H:%M:%SZ)
dir=".skillkit/journal"

# emit TYPE [jq --arg pairs...]: the object is {ts,type} plus every --arg given
emit() {
    local type=$1; shift
    mkdir -p "$dir" 2>/dev/null || return 0
    [ -f .skillkit/.gitignore ] || printf '*\n' > .skillkit/.gitignore
    jq -cn --arg ts "$ts" --arg type "$type" "$@" \
        '$ARGS.named' >> "$dir/$session.jsonl" 2>/dev/null
}

if [ "$tool" = "Skill" ]; then
    name=$(printf '%s' "$payload" | jq -r '.tool_input.skill // empty')
    [ -n "$name" ] && emit skill-used --arg skill "$name"
    exit 0
fi

[ "$tool" = "Bash" ] || exit 0
cmd=$(printf '%s' "$payload" | jq -r '.tool_input.command // empty' | head -c 300)
out=$(printf '%s' "$payload" | jq -r '[.tool_response.stdout // empty, .tool_response.stderr // empty, .tool_response.output // empty] | join("\n")')
code=$(printf '%s' "$payload" | jq -r '.tool_response.exit_code // .tool_response.exitCode // empty')

if printf '%s' "$cmd" | grep -Eqi 'dotnet[[:space:]]+test\b|node[[:space:]]+--test\b|ng[[:space:]]+test\b|npm[[:space:]]+(run[[:space:]]+)?test\b|vitest\b'; then
    result="PASS"
    printf '%s' "$out" | grep -Eqi 'Failed!|chou.{0,2}[[:space:]]*!|chec[[:space:]]*!|failed:[[:space:]]*[1-9]|error[[:space:]]+(CS|MSB)[0-9]+|test run failed|[[:space:]]fail[[:space:]]+[1-9]' && result="FAIL"
    detail=$(printf '%s' "$out" | grep -Ei 'error|fail|chec' | head -3 | head -c 400)
    emit test-run --arg result "$result" --arg command "$cmd" --arg detail "$detail"
elif [ -n "$code" ] && [ "$code" != "0" ]; then
    emit command-failed --arg exit "$code" --arg command "$cmd"
fi
exit 0
