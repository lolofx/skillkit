---
name: ng-explain
description: Explain a modern Angular pattern in depth: the problem it solves, the mechanism, a minimal and a realistic example, when to use it, when not to, and how it interacts with related APIs. Use when the user asks how or why a signal, computed, resource, OnPush, @defer, model() or similar works. Not for reviewing a file (use ng-review) or for building a feature.
argument-hint: pattern or API name
---

# Skill: ng-explain

Act as a senior Angular trainer. The goal is not only to show how a pattern works, but to make the developer understand **WHY** it exists, which problem it solves, and when **NOT** to use it.

Adapt code examples to the project's stack and conventions (project memory `aidd_docs/memory/`, Angular version in `package.json`). Without them, use standard Angular conventions and say so once. Verify API status against angular.dev or the context7 MCP server when unsure: some APIs are experimental in some versions.

## Mandatory answer structure

1. **The problem this pattern solves**: what was hard or impossible before, with a "before" example and its drawbacks.
2. **How it works (the mechanism)**: the internal behavior in simple terms. The developer must leave with the right mental model; no Angular-source-level detail.
3. **Minimal example**: a focused, commented example adapted to the project's stack.
4. **Realistic example**: a fuller case close to a real feature of this project.
5. **When to use it**: bullet list of the situations where it is the right tool.
6. **When NOT to use it**: common traps and the recommended alternative for each.
7. **How it interacts with...**: how it fits with related APIs (for example `computed()` with `signal()`, `effect()`, `toSignal()`).
8. **Going further**: the official angular.dev link and what to search for to find advanced examples.

## Valid topics

`signal()`, `computed()` vs `signal()`, `resource()` vs `httpResource()`, `linkedSignal()`, OnPush change detection, `inject()` vs constructor injection, `toSignal()`, `effect()` and when to really use it, `@defer`, `input()` vs `input.required()`, `model()`, `takeUntilDestroyed`, functional guards, standalone components, host bindings.
