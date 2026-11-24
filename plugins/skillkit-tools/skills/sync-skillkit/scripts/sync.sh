#!/usr/bin/env bash
# sync.sh [--apply] - compare every installed skillkit-* plugin to the marketplace HEAD.
# Always refreshes the marketplace clone. With --apply, runs `claude plugin update` on the stale ones.
# Output: one line per installation "STATE id scope version [projectPath]", STATE = OK | STALE | UPDATED | FAILED.
# Requires: claude, jq, git.
set -u
apply=0; [ "${1:-}" = "--apply" ] && apply=1
mp=${SKILLKIT_MARKETPLACE:-skillkit}

for c in claude jq git; do command -v "$c" >/dev/null || { echo "ERROR: $c is missing"; exit 2; }; done

claude plugin marketplace update "$mp" >/dev/null 2>&1 || echo "WARN: marketplace update failed (offline?), comparing to the local clone"
loc=$(claude plugin marketplace list --json | jq -r --arg m "$mp" '.[]|select(.name==$m)|.installLocation')
[ -d "$loc" ] || { echo "ERROR: marketplace '$mp' not found"; exit 2; }
head=$(git -C "$loc" rev-parse HEAD)
short=${head:0:12}
echo "marketplace $mp at $short"

stale=0
while IFS=$'\t' read -r id scope ver proj; do
    if [ "$ver" = "$short" ]; then echo "OK $id $scope $ver ${proj:-}"; continue; fi
    stale=1
    if [ $apply -eq 1 ] && claude plugin update "$id" --scope "$scope" >/dev/null 2>&1; then
        echo "UPDATED $id $scope $ver -> $short ${proj:-}"
    elif [ $apply -eq 1 ]; then
        echo "FAILED $id $scope $ver ${proj:-}"
    else
        echo "STALE $id $scope $ver ${proj:-}"
    fi
done < <(claude plugin list --json | jq -r --arg m "@$mp" '.[]|select(.id|endswith($m))|[.id,.scope,.version,(.projectPath//"")]|@tsv')

[ $apply -eq 1 ] && [ $stale -eq 1 ] && echo "Restart Claude Code sessions to load the updates."
exit 0
