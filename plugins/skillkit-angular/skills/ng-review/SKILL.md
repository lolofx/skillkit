---
name: ng-review
description: Pedagogical review of one Angular (v17+) file along 4 axes: migration to modern patterns, architecture and responsibilities, performance, TypeScript quality. Use to review a single component, service or template while explaining the WHY of every finding. Not for a diff before a PR (use aidd-dev 05-review) or for explaining a pattern (use ng-explain).
argument-hint: file path
---

# Skill: ng-review

Review the file the user points to. Read it in full first. Explain **WHY** each finding is a problem, not only how to fix it.

## Actions

| #   | Action         | When to use                                                       |
| --- | -------------- | ----------------------------------------------------------------- |
| 01  | `migration`    | Detect obsolete patterns and the modern replacement               |
| 02  | `architecture` | Responsibilities (SRP), smart vs presentational, store usage      |
| 03  | `performance`  | Tracking, deferral, images, bundle                                |
| 04  | `typescript`   | Typing quality                                                    |

Run all four in order. Read each action file before running it.

## Before starting

1. Load the `angular-conventions` skill (`references/angular.md`, `references/review-format.md`).
2. Take the stack and conventions from the project memory (`aidd_docs/memory/`) and the Angular version from `package.json`; adapt each finding to them. Without a project memory, apply the standard Angular good practices and say so once.

## Output

Findings in the block of `references/review-format.md`, then its mandatory final summary (score, top 3, what works well).

## Pedagogical rule

Do not just show "the right code". For the important patterns (signals, `OnPush`, `inject()`, `@defer`), briefly explain the underlying mechanism. The goal: the developer understands **WHY**, not only **WHAT** to change.

Read-only: report, never fix.
