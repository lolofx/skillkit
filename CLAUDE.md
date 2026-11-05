# CLAUDE.md

This repo is a **Claude Code plugin marketplace** (`skillkit`) built on the AIDD framework. It is not an app and has no build.

## Layout

```
.claude-plugin/marketplace.json     root manifest (plugin list, allowCrossMarketplaceDependenciesOn)
plugins/<plugin>/
  .claude-plugin/plugin.json        name, description, author, dependencies
  skills/<skill>/SKILL.md           + actions/ (numbered steps), references/ (on demand), assets/
  agents/ commands/ hooks/          optional
ROADMAP.md                          remaining work
```

## Conventions (all mandatory)

- **No `version`** in `plugin.json` or `marketplace.json`: each commit is a version. `claude plugin validate .` prints "No version specified"; that is intended.
- **English** everywhere: skills, descriptions, UI strings of mods.
- **AIDD skill style**: `SKILL.md` as entry point, `actions/` for numbered steps, `references/` for material loaded on demand. Description reads "Use when... Not for...".
- **Autonomous and generic**: plugins depend on AIDD (`aidd-dev@aidd-framework`) and on each other, never on an employer's content or on a private path. Project facts (stack, conventions, domain profile) come from the project memory (`aidd_docs/memory/`), not from files shipped here.
- **Stack plugins do not duplicate AIDD** workflow skills (plan, review, commit, debug...). Check `aidd-framework` before adding a skill.
- Everything a skill or mod uses lives **inside its plugin folder**: no outgoing symlinks, no absolute paths. Hook commands use `${CLAUDE_PLUGIN_ROOT}`.
- Plugin names are prefixed `skillkit-`.
- Third-party content (articles, books, other people's skills) is not copied into this repo.

## Checks before committing

```
claude plugin validate .
./scripts/check-repo.sh
```

Both also run in CI (`.github/workflows/ci.yml`).

Hooks have shell variants (`.sh` and `.ps1`); keep `.ps1` files ASCII-only. Mod code is TypeScript/TSX with tests next to it; run them with the Claude Code mod test runner when you change one.

## Mods

A mod is developed in a scratch dir, then copied here. Never keep the dev copy and the installed plugin enabled together: the guard / display would run twice.

## Adding something

Use the `marketplace-add` skill (plugin `skillkit-tools`): it recommends the right element type, proposes a plan, then creates, declares and validates it.

## Development process

Implementation goes through `skillkit-tdd:tdd`, **layer by layer**, never as one RED for a whole feature: Domain, Application, API / presentation, Infrastructure, each closed by RED, GREEN, REFACTOR and its own commit. Changes to a stack plugin's skills or agents must keep that contract (an implementer works in the layer it is given and never edits an inner layer).
