---
name: marketplace-add
description: "Add a skill, command, agent, mod (hook / pane) or plugin to the skillkit marketplace from a described need. Recommends the right type first (mod, skill, command, or just a CLAUDE.md line), proposes a plan, waits for approval, then creates, declares, validates and propagates it. Use when the user says \"add this to the marketplace\", \"turn this into a skill / a mod\", \"I keep repeating X\". Explicit invocation only."
disable-model-invocation: true
---

# /marketplace-add

Add an element to the skillkit marketplace without forgetting its conventions or its propagation. **Nothing is created before the user approves the plan (step 3).**

Marketplace root: the repository this skill runs in (it holds `.claude-plugin/marketplace.json` and `plugins/<plugin>/`). If the current directory is not that repository, ask for its path once.

## 1. Understand the need

Start from what the user describes ("I keep repeating…", "I want to see…", "I need Claude to…"). If the need is vague, ask **one** question, no more. Do not assume what repeats: rely on what the user says or on histories you actually read, with numbers.

## 2. Recommend the type, with the reason

| Need | Type |
|---|---|
| Rule, preference, or stable fact to always apply | **A line in CLAUDE.md** (no plugin) |
| Procedure or sequence Claude runs on demand | **Skill** (`skills/<name>/SKILL.md`) |
| Shortcut for a command with arguments | **Command** (`commands/<name>.md`) |
| Deterministic, long or identically repeated logic | **Tested script** called by a skill, not prose |
| A specialised worker with a restricted toolset and its own context | **Agent** (`agents/<name>.md`) |
| What Claude Code **displays or does itself** must change (blocking a command, a pane, a status line, a toast, a hook on tools or prompts) | **Mod**: delegate the writing to the `plugin-authoring` skill |
| A coherent set of several elements | **Plugin** (new folder under `plugins/`) |

Give the recommendation **and** the reason in one sentence; name the alternative you rejected. A mod only if one of two things is true: the display changes, or an action must be intercepted before it runs.

## 3. Plan, then approval

Present, without writing anything:
- chosen type, name, host plugin (existing, or new with its reason);
- files to create and existing files to modify (`marketplace.json` for a new plugin);
- planned frontmatter: `disable-model-invocation: true` if the skill is only called by hand (saves context), `model: haiku` if the task is mechanical and read-only;
- what stays manual.

Wait for an explicit "yes" / "go". A refusal or a correction sends you back to the plan.

## 4. Create

Marketplace conventions (all mandatory):
- **No `version` field** in `plugin.json` or `marketplace.json`: each commit is a new version, so a change propagates by itself.
- Every file a skill or mod uses lives **inside the plugin folder**. No outgoing symlinks (loading fails with "path escapes plugin directory"). For a script: put it next to the `SKILL.md` and reference it as "shipped next to this SKILL.md".
- Everything is written in **English**: skill bodies, descriptions, UI strings.
- Skills follow the AIDD layout when they have several steps: `SKILL.md` as the entry point, `actions/` for numbered steps, `references/` for material loaded on demand, `assets/` for templates. The description says **when** to use the skill and **when not to** ("Use when… Not for…").
- A plugin that builds on AIDD declares it as a dependency (`"aidd-dev@aidd-framework"`) and the marketplace lists `aidd-framework` in `allowCrossMarketplaceDependenciesOn`.
- New plugin: `plugins/<name>/.claude-plugin/plugin.json` (`name`, `description`, `author`), then an entry in `marketplace.json` with `"source": "./plugins/<name>"` and its description. Also update an existing plugin's `plugin.json` description if its content changes nature.
- Plugin name prefix: `skillkit-`.

## 5. Validate

```
claude plugin validate "<marketplace root>"
```
(the "No version specified" warning is intended). Fix every error before going further.

## 6. Propagate

```
claude plugin marketplace update skillkit
claude plugin install <plugin>@skillkit      # only for a new plugin
```
Then ask the user to run `/reload-plugins` (Claude cannot run that command).

## 7. Close

List: files created or modified, the plugin installed or updated, what the user must do (`/reload-plugins`, a test call). State explicitly what could **not** be verified (for example a mod not yet loaded).

## Do not

- Create anything before the approval of step 3.
- Copy or rewrite a third-party element: plugins from other marketplaces stay managed where they live.
- Add a mod when a skill or a CLAUDE.md line is enough.
- Invent figures to justify a choice: cite what was measured, or say it was not measured.
