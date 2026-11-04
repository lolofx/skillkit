#!/usr/bin/env bash
# Repo conventions that `claude plugin validate` does not cover (see CLAUDE.md).
set -u
fail=0
err() { echo "ERROR: $*"; fail=1; }

# 1. No "version" key in manifests (each commit is a version)
for f in .claude-plugin/marketplace.json plugins/*/.claude-plugin/plugin.json; do
  jq -e 'has("version")' "$f" >/dev/null 2>&1 && err "$f declares a version"
done

# 2. Plugin names are prefixed skillkit-
for f in plugins/*/.claude-plugin/plugin.json; do
  jq -e '.name | startswith("skillkit-")' "$f" >/dev/null 2>&1 || err "$f: name must start with skillkit-"
done

# 3. Every SKILL.md has name + description frontmatter
while IFS= read -r f; do
  head -1 "$f" | grep -q '^---$' || { err "$f: missing frontmatter"; continue; }
  fm=$(awk 'NR>1 && /^---$/ {exit} NR>1 {print}' "$f")
  echo "$fm" | grep -q '^name:' || err "$f: missing name"
  echo "$fm" | grep -q '^description:' || err "$f: missing description"
done < <(find plugins -name SKILL.md)

# 4. .ps1 files are ASCII-only
while IFS= read -r f; do
  LC_ALL=C grep -nP '[^\x00-\x7F]' "$f" >/dev/null && err "$f: non-ASCII characters"
done < <(find plugins -name '*.ps1')

# 5. No absolute home paths, no symlinks inside plugins
grep -rnIE '/home/[a-z]+|C:\\Users' plugins --exclude='*.test.*' >/dev/null 2>&1 && err "absolute user path found in plugins/"
[ -z "$(find plugins -type l)" ] || err "symlink found in plugins/"

# 6. Hooks use ${CLAUDE_PLUGIN_ROOT}
for f in plugins/*/hooks/hooks.json; do
  [ -f "$f" ] && grep -q '"command"' "$f" && ! grep -q 'CLAUDE_PLUGIN_ROOT' "$f" && err "$f: command hook without CLAUDE_PLUGIN_ROOT"
done

[ $fail -eq 0 ] && echo "repo checks OK"
exit $fail
