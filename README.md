# skillkit

Personal, open-source [Claude Code](https://claude.com/claude-code) plugins for **.NET** and **Angular** development, built **on top of the [AIDD framework](https://github.com/ai-driven-dev/framework)**.

AIDD already provides the generic workflow (plan, implement, review, test, commit, brainstorm, project memory). skillkit does not duplicate it: it adds what AIDD does not do, namely strict TDD discipline, stack conventions and reviews that explain the *why*, and a few Claude Code mods.

## Install

```text
/plugin marketplace add ai-driven-dev/framework
/plugin marketplace add lolofx/skillkit
/plugin install skillkit-dotnet@skillkit
/reload-plugins
```

The AIDD marketplace must be added first: skillkit plugins declare `aidd-dev@aidd-framework` as a dependency, and this marketplace allows that cross-marketplace dependency. Installing a plugin pulls in its dependencies.

## Plugins

| Plugin | What it gives you | Depends on |
| ------ | ----------------- | ---------- |
| `skillkit-tdd` | Skill `tdd` (RED / GREEN / REFACTOR), agent `test-writer`, hooks `guard-commit` + `track-tests` (no commit without a recent green test run) | `aidd-dev` |
| `skillkit-dotnet` | Skills `dotnet-conventions`, `ddd-review`, `file-review`, `csharp-quality`, `unit-test-dotnet`; agents `backend-implementer`, `backend-reviewer` | `aidd-dev`, `skillkit-tdd` |
| `skillkit-angular` | Skills `angular-conventions`, `ng-review`, `ng-explain`, `unit-test-angular`; agents `frontend-implementer`, `frontend-reviewer` | `aidd-dev`, `skillkit-tdd` |
| `skillkit-bodyguard` | Mod: asks for confirmation before `rm -f/-r`, `git push --force`, `git reset --hard`, `DROP TABLE` | none |
| `skillkit-gauge` | Mod: context, 5-hour limit and week above the prompt, colored by urgency; `/gauge` pane | none |
| `skillkit-ctx` | Mod: `/ctx` pane showing what weighs on the context | none |
| `skillkit-tools` | Skills `plugin-audit` (which plugins are active per project) and `marketplace-add` (add elements to this marketplace) | none |

Mods need a Claude Code build that supports them (see the `plugin-authoring` skill). Do not install a mod twice under different names (for example two bodyguards): the guard would run twice.

## How it fits with AIDD

```
aidd-refine:01-brainstorm  ->  aidd-pm:04-spec  ->  aidd-dev:01-plan
        ->  skillkit-tdd:tdd  (per plan step: test-writer RED, implementer GREEN + REFACTOR)
        ->  aidd-dev:05-review  +  skillkit-dotnet:ddd-review / skillkit-angular:ng-review
        ->  aidd-vcs:01-commit  (guard-commit requires a recent green run)
```

- **Project memory**: stack, conventions and the **domain profile** (simple / rich, per module) live in AIDD's project memory (`aidd_docs/memory/`, see `aidd-context:02-project-memory`). skillkit skills read it; they do not ship their own project sheet.
- **Domain profile**: the DDD toolbox is graded. `ddd-review` phase 1 decides whether a rich profile is justified when none is declared.

## Recommended companions (not bundled)

- **[RTK](https://github.com/rtk-ai/rtk)**: compresses command output (60-90% fewer tokens). Install per machine, then `rtk init --global`. A caveat: if RTK hides the summary line of `dotnet test`, `track-tests` records the run as failed. Run the plain test command before committing.
- **[context7](https://github.com/upstash/context7)** MCP server: up-to-date library docs, avoids hallucinated APIs. Needs Node.js. The Angular skills tell the model to verify API status against angular.dev or context7.
- **Reference corpora** (DDD / hexagonal / blog articles): keep them as separate, personal plugins. `dotnet-conventions` mentions that a reference skill such as `clean-ddd-hexagonal` can be consulted, but this repo does not redistribute third-party content.

## Requirements

- Claude Code, with the AIDD marketplace added.
- `jq` for the `.sh` variants of the TDD hooks on Linux, macOS and WSL (Windows PowerShell variants need nothing).
- `claude plugin validate .` passes on this repo; the "No version specified" warning is intended (each commit is a version).

## Contributing

See `CLAUDE.md`. Use the `marketplace-add` skill from `skillkit-tools` to add an element with the repo's conventions.
