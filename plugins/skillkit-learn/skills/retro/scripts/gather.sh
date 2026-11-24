#!/usr/bin/env bash
# gather.sh [--all] [BASE] - evidence for the retro, from the project root.
# Summarises .skillkit/journal/*.jsonl (last 24h, or every file with --all), then the branch history
# against BASE (default: origin/HEAD branch, else main). Read-only. Requires: jq, git.
set -u
all=0; [ "${1:-}" = "--all" ] && { all=1; shift; }
base=${1:-$(git symbolic-ref -q --short refs/remotes/origin/HEAD 2>/dev/null | sed 's#^origin/##')}
base=${base:-main}
command -v jq >/dev/null || { echo "ERROR: jq is missing"; exit 2; }

echo "## Journal"
files=()
if [ -d .skillkit/journal ]; then
    if [ $all -eq 1 ]; then
        while IFS= read -r f; do files+=("$f"); done < <(ls -1 .skillkit/journal/*.jsonl 2>/dev/null)
    else
        while IFS= read -r f; do files+=("$f"); done < <(find .skillkit/journal -name '*.jsonl' -mtime -1 2>/dev/null)
    fi
fi
if [ ${#files[@]} -eq 0 ]; then
    echo "(no journal: rely on the conversation only)"
else
    echo "files: ${#files[@]}"
    cat "${files[@]}" | jq -rs '
      "events: \(length)",
      "skills used: \([.[]|select(.type=="skill-used")|.skill]|group_by(.)|map("\(.[0]) x\(length)")|join(", "))",
      "test runs: \([.[]|select(.type=="test-run")]|length) (FAIL: \([.[]|select(.type=="test-run" and .result=="FAIL")]|length))",
      "failing commands (repeated first): \([.[]|select(.type=="command-failed")|.command[0:80]]|group_by(.)|map({c:.[0],n:length})|sort_by(-.n)|.[0:5]|map("\(.c) x\(.n)")|join(" | "))",
      "",
      "### Notes (corrections, approvals, frictions)",
      ([.[]|select(.type=="note")|"- [\(.kind)] \(.what) | \"\(.quote)\" | \(.skill)"]|if length==0 then ["(none)"] else . end)[]'
fi

echo; echo "## Lesson registry"
reg="$(dirname "$0")/registry.sh"
if [ -f .skillkit/lessons.json ]; then bash "$reg" due; else echo "(empty)"; fi

echo; echo "## Branch vs $base"
git rev-parse --git-dir >/dev/null 2>&1 || { echo "(not a git repository)"; exit 0; }
range="$base..HEAD"; git rev-parse -q --verify "$base" >/dev/null || range="origin/$base..HEAD"
git log --format='%h %s' "$range" 2>/dev/null | head -30
echo; git diff --stat "${range%..HEAD}...HEAD" 2>/dev/null | tail -15
exit 0
