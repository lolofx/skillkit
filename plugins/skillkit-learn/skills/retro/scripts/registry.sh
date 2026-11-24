#!/usr/bin/env bash
# registry.sh - lesson registry of the retro, .skillkit/lessons.json (local, git-ignored).
#   list                         one line per lesson: id | status | count | target
#   show ID                      full entry
#   record ID TARGET "LESSON" "EVIDENCE" [explicit]
#                                new lesson, or +1 occurrence of an existing one (count by distinct date+evidence).
#                                "explicit" = the user said it themselves (correction / approval)
#   status ID candidate|applied|rejected
#   due                          lessons the retro may propose now (see rules)
# Rules for "due": status candidate AND (count >= 2 OR explicit). "applied" lessons that recur are
# reported as INEFFECTIVE (the written rule did not prevent the problem). "rejected" are never proposed again.
# Requires: jq.
set -u
command -v jq >/dev/null || { echo "ERROR: jq is missing"; exit 2; }
f=.skillkit/lessons.json
mkdir -p .skillkit; [ -f .skillkit/.gitignore ] || printf '*\n' > .skillkit/.gitignore
[ -f $f ] || echo '[]' > $f
now=$(date -u +%Y-%m-%d)
save() { jq "$@" $f > $f.tmp && mv $f.tmp $f; }

case "${1:-}" in
list) jq -r '.[]|"\(.id) | \(.status) | x\(.occurrences|length) | \(.target)"' $f ;;
show) jq --arg id "${2:?id}" '.[]|select(.id==$id)' $f ;;
record)
    id=${2:?id}; target=${3:?target}; lesson=${4:?lesson}; ev=${5:?evidence}; explicit=false
    [ "${6:-}" = "explicit" ] && explicit=true
    save --arg id "$id" --arg t "$target" --arg l "$lesson" --arg e "$ev" --arg d "$now" --argjson x $explicit '
      (map(.id)|index($id)) as $i
      | if $i == null then . + [{id:$id,target:$t,lesson:$l,status:"candidate",explicit:$x,occurrences:[{date:$d,evidence:$e}]}]
        else .[$i] |= (if any(.occurrences[]; .date==$d and .evidence==$e) then .
                       else (.occurrences += [{date:$d,evidence:$e}]) end
                       | .explicit = (.explicit or $x)) end'
    ;;
status)
    id=${2:?id}; st=${3:?status}
    case $st in candidate|applied|rejected) ;; *) echo "ERROR: status must be candidate|applied|rejected"; exit 2;; esac
    save --arg id "$id" --arg s "$st" --arg d "$now" 'map(if .id==$id then .status=$s | .statusDate=$d else . end)'
    ;;
due)
    jq -r --arg none "(none)" '
      [ .[] | select(.status=="candidate" and ((.occurrences|length)>=2 or .explicit))
            | "DUE \(.id) | x\(.occurrences|length)\(if .explicit then " explicit" else "" end) | \(.target) | \(.lesson)" ]
      + [ .[] | select(.status=="applied") | . as $L | select(any(.occurrences[]; .date > ($L.statusDate // "")))
            | "INEFFECTIVE \(.id) | applied \(.statusDate), recurred | \(.target) | \(.lesson)" ]
      | if length==0 then [$none] else . end | .[]' $f ;;
*) sed -n '2,13p' "$0"; exit 2 ;;
esac
