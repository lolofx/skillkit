#!/usr/bin/env bash
# layer-map.sh <range> [layers-file]
# Lists each commit of <range> (for example main..HEAD) with the architecture layers its files touch.
# Output, one line per commit, oldest first:
#   <sha> <layers comma-separated | none> <test|notest> <subject>
# Layers: domain, application, api, infrastructure, other.
# Override the path patterns with a layers-file of lines:  <layer> <extended-regex>
# Patterns are tried in order, the first match wins.
set -u
range=${1:?usage: layer-map.sh <range> [layers-file]}
custom=${2:-}

default_patterns() {
cat <<'PAT'
domain          (^|/)(Domain|domain|Core|core)(/|\.)|\.Domain(\.|/)|\.(model|entity)\.ts$
application     (^|/)(Application|application|UseCases|usecases)(/|\.)|\.Application(\.|/)|(^|/)(facades?|stores?|state)(/|$)|\.(facade|store)\.ts$
infrastructure  (^|/)(Infrastructure|infrastructure|Persistence|persistence)(/|\.)|\.Infrastructure(\.|/)|(^|/)(Migrations|migrations)(/|$)|(^|/)(http|adapters?)(/|$)|\.(http|adapter|client|repository)\.ts$
api             (^|/)(Api|API|Web|WebApi|Presentation|presentation|Endpoints|Controllers)(/|\.)|\.(Api|Web|WebApi)(\.|/)|\.component\.(ts|html|scss|css)$|\.component\.spec\.ts$|(^|/)(components|pages|routes)(/|$)
PAT
}

patterns=$(default_patterns)
if [ -n "$custom" ]; then
  [ -f "$custom" ] || { echo "layers-file not found: $custom" >&2; exit 2; }
  patterns=$(cat "$custom")
fi

classify_file() {
  local f=$1 layer re
  while read -r layer re; do
    [ -z "$layer" ] && continue
    if printf '%s' "$f" | grep -Eq -- "$re"; then printf '%s' "$layer"; return; fi
  done <<< "$patterns"
  printf 'other'
}

is_test() {
  printf '%s' "$1" | grep -Eqi '(^|/)(tests?|specs?)(/|\.)|Tests?\.|\.spec\.|\.test\.'
}

for sha in $(git rev-list --reverse "$range"); do
  layers=""; has_test=notest
  while IFS= read -r f; do
    [ -z "$f" ] && continue
    is_test "$f" && has_test=test
    l=$(classify_file "$f")
    case ",$layers," in *",$l,"*) ;; *) layers="${layers:+$layers,}$l";; esac
  done < <(git diff-tree --no-commit-id --name-only -r "$sha")
  printf '%s %s %s %s\n' "$(git rev-parse --short "$sha")" "${layers:-none}" "$has_test" "$(git log -1 --format=%s "$sha")"
done
