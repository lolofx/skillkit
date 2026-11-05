---
name: plugin-audit
description: "Audit which Claude Code plugins/skills are active in the current project, detect the project's stack (frontend/backend/other) to filter out plugins that don't fit, and interactively disable the irrelevant ones by writing verified overrides to the project's personal .claude/settings.local.json — never the shared, git-tracked .claude/settings.json. Use at the start of a dev session, or whenever the user asks to clean up plugins, reduce skill noise, check which plugins are active, or says things like \"disable the useless plugins\", \"which plugins are active here\", \"too many skills loaded\". More readable than the raw /plugin command since it groups plugins by relevance to the current project instead of listing everything flat. User-invoked only, never triggers automatically."
disable-model-invocation: true
---

# /plugin-audit

Reduce plugin/skill noise for the current project without touching the team's shared config. Runs entirely read-first: it proposes a list of `plugin@marketplace: false` overrides and only writes after explicit confirmation.

## Why this exists

A plugin can be active in a session for three different reasons, and they need three different fixes:
- listed `true` in the git-tracked `.claude/settings.json` → a team decision, don't touch it here
- listed `true` (or unmentioned, `defaultEnabled`) in the user-level `~/.claude/settings.json` → your own global default, affects every project
- synced/pushed by the org (`~/.claude/plugins/synced/...`) → not something a teammate installed in this repo, and not something you installed either

Since `enabledPlugins` merges **key by key** across settings files with precedence `project.local > project > user`, the only way to turn a plugin off for *this project only, for you only* is an explicit `false` entry in this project's `.claude/settings.local.json` (gitignored, personal). Omitting a plugin never disables it — it just inherits whatever the next, less-specific source says (usually `true`).

## Steps

### 1. See what's active

Don't shell out for this — the list of currently available skills/plugins is already in your context, in the system-reminder that enumerates skills at session start (or after `/clear`). Read it directly.

### 2. Detect the project's stack

Look at the current repo, cheapest signal first:
- Its own `CLAUDE.md` (root, or `.claude/`) — if it explicitly names which plugins/skills it uses (many repos do, see any "shared skills" or "routing" section), that's the strongest signal, use it as-is.
- Marker files: `angular.json`/`package.json` with Angular deps → frontend web; `*.csproj`/`*.sln` → .NET backend; `pyproject.toml`/`requirements.txt` → Python; etc. Use judgment, don't build an exhaustive table — one or two marker files are usually enough to tell backend from frontend from "something else".

### 3. Classify plugins into three buckets

For each active plugin (group by plugin, not by individual skill):
- **Relevant to this project** — name/purpose matches the detected stack, or it's explicitly referenced in the repo's own CLAUDE.md. Keep.
- **Generic / likely off-topic** — plugins whose purpose has nothing to do with the detected stack (e.g. a data-science or generic-productivity plugin in a pure frontend Angular repo). Candidate for disabling.
- **Already disabled** — skip, nothing to do.

Present this to the user as three short groups, not a flat list, and ask which of the "generic/off-topic" bucket to disable. Don't assume — the user may want to keep something generic on purpose (e.g. they said "always keep plugin X").

### 4. Verify the real plugin id — never guess it

This is the step that actually matters; guessing wrong here means writing a `false` entry that silently does nothing. For each plugin the user wants disabled, resolve its exact `name@marketplace` id by checking, in order:

```bash
# 1. Classic marketplaces (declared via /plugin marketplace add)
grep -rl "\"name\": *\"<plugin-name>\"" ~/.claude/plugins/cache/*/*/  2>/dev/null

# 2. Org-synced plugins (often NOT in known_marketplaces.json)
grep -rl "\"name\": *\"<plugin-name>\"" ~/.claude/plugins/synced/*/manifest.json 2>/dev/null
cat ~/.claude/plugins/synced/*/<plugin-name>.meta.json 2>/dev/null
```

The field you trust is `marketplace_name` (meta.json) or `marketplaceName` (manifest.json) — never assume `@claude-plugins-official` by default; plenty of active plugins (confirmed empirically: `engineering`, `data`, `productivity` → `knowledge-work-plugins`; `andrej-karpathy-skills` → its own marketplace of the same name) live elsewhere.

**If a plugin has zero matches in any of the above locations**, say so explicitly instead of writing a guessed entry. It's very likely a built-in skill bundled with the Claude Code client itself (seen so far: `artifact-design`, `workflow-authoring`, `run`, `init`, `security-review`, and unresolved on at least one machine: `dataviz`, `anthropic-skills`) — these aren't real plugins and can't be toggled via `enabledPlugins`. Tell the user to check with `/plugin` inside the session to be sure, rather than writing a no-op.

### 5. Decide where to write

```bash
git ls-files .claude/settings.json    # non-empty → tracked, shared with the team, DO NOT edit for a personal preference
grep -n "settings.local.json" .gitignore   # confirm it's actually gitignored before relying on it
```

Target file: `.claude/settings.local.json` at the repo root.
- If it doesn't exist, create it with just `{"enabledPlugins": {}}`.
- If `.claude/settings.local.json` isn't listed in `.gitignore`, warn the user — don't add the gitignore entry yourself without asking, that's a shared file.
- If it exists, read it first and merge into its existing `enabledPlugins` object — don't clobber other keys (`permissions`, `skillOverrides`, etc. may already be there).

### 6. Propose, then write

Show the exact list of `"plugin@marketplace": false` entries with the verified source for each one, and wait for explicit confirmation before editing. Don't batch this with step 3's bucket question — verification (step 4) can change the picture (an unresolvable plugin drops out of the list).

### 7. After writing

Tell the user to:
- run `/plugin` in this project session to confirm the resolved state (it shows which source is overriding what)
- restart the session (or `/clear`) to see the skill list actually shrink — the current session already has the old list loaded
