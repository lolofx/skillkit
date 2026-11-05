---
name: angular-conventions
description: Conventions for modern Angular code (v17+), as references loaded on demand: signals and state, standalone components, OnPush, input/output/model, control-flow template syntax, forms, data fetching, smart vs presentational components, TypeScript quality, and the shared review output format. Use when writing or reviewing Angular code, or when another skillkit-angular skill or agent needs the rules. Not for .NET code (use skillkit-dotnet) or the TDD procedure (use skillkit-tdd).
---

# Skill: angular-conventions

Opinionated rules for an Angular frontend. They are **references**, loaded only when the task needs them.

## References

| File | Load when |
| ---- | --------- |
| `references/angular.md` | Writing or changing Angular TypeScript or HTML. |
| `references/review-format.md` | Producing a review (severity levels, finding block, final summary). |

## Rules of use

- Align with the Angular version the project actually uses (`package.json`, `angular.json`). Some APIs listed as "recent" are still experimental or absent in older versions: check before recommending them, and verify against angular.dev (or the context7 MCP server when available) rather than from memory.
- Project conventions (selectors prefix, folder layout, state library, test ids, i18n) come from the project memory (`aidd_docs/memory/`) and the existing code. They win over these defaults.
- Follow the idiom and density of the surrounding code.
