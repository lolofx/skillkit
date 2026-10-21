---
name: file-review
description: Pedagogical review of one backend file along 4 axes: DDD/CQRS patterns (per domain profile), architecture and responsibilities, language quality, error handling. Use to review a single .NET file while explaining the WHY of every finding. Not for a whole module (use ddd-review), a diff before a PR (use aidd-dev 05-review) or deep C# language checks only (use csharp-quality).
argument-hint: file path
---

# Skill: file-review

Review the file the user points to. Read it in full first. Explain **WHY** each finding is a problem, not only how to fix it.

## Actions

| #   | Action         | When to use                                                  |
| --- | -------------- | ------------------------------------------------------------ |
| 01  | `patterns`     | DDD / CQRS conventions (rich profile only)                   |
| 02  | `architecture` | Base: responsibilities and dependencies (always)             |
| 03  | `language`     | Language-level quality (always)                              |
| 04  | `errors`       | Error handling and result-to-HTTP mapping (always)           |

Run 02 to 04 always; run 01 only when the module's profile is rich. Read each action file before running it.

## Before starting

1. Load the `dotnet-conventions` skill (`references/architecture.md`, `references/ddd.md`, `references/review-format.md`).
2. Resolve the domain profile as described there, and take the stack, conventions and paths from the project memory. Without it, apply generic conventions and say so once.
3. **Grading**: axis 01 only applies in full to a rich-profile module. For a simple profile, check the base only (02-04) and flag over-engineering (an aggregate on a CRUD).

## Output

Findings in the block of `references/review-format.md`, then its mandatory final summary (score, top 3, what works well).

## Pedagogical rule

Do not just show "the right code". For the important patterns (`Result<T>`, `sealed` aggregates, `internal sealed` handlers, domain events), briefly explain the underlying mechanism. The goal: the developer understands the **WHY**, not only the **WHAT**.

Read-only: report, never fix.
