---
name: sync-skillkit
description: Check that every installed skillkit plugin (user and project scopes) is at the latest marketplace commit, and update the stale ones on request. Use when the user asks whether skillkit is up to date, to force a plugin update, or after a skillkit PR was merged. Not for enabling or disabling plugins (use plugin-audit).
disable-model-invocation: true
---

# /sync-skillkit

Skillkit has no `version` field: a plugin's version is the commit SHA of the marketplace. A plugin is stale when its installed SHA differs from the marketplace HEAD.

## Steps

1. Check (read-only except the marketplace refresh):

   ```bash
   "${CLAUDE_PLUGIN_ROOT}/skills/sync-skillkit/scripts/sync.sh"
   ```

   Each line is `OK` or `STALE` with the plugin, scope, installed SHA and, for project scope, the project path.

2. If something is `STALE`, show the list and ask before updating. Then:

   ```bash
   "${CLAUDE_PLUGIN_ROOT}/skills/sync-skillkit/scripts/sync.sh" --apply
   ```

3. Report `UPDATED` / `FAILED` lines. Updates load only after a restart: tell the user to restart their sessions.

## Limits

- An installation scoped to **another project** may only update from that project: if it stays `STALE` or `FAILED`, say which path to run the skill from.
- Offline, the comparison uses the local marketplace clone and warns about it.
