---
name: ddd-review
description: Review the architecture of a .NET backend module in 3 phases: is DDD justified here (arbitrates the domain profile), layer-by-layer review, layer-leak detection. Use to audit a module, validate a profile choice, or check conformance to the hexagonal base plus DDD grading. Not for a single file (use file-review), pure C# language quality (use csharp-quality) or a generic diff review (use aidd-dev 05-review).
argument-hint: module path or name
---

# Skill: ddd-review

Analyze the architecture of the module the user points to. Explain the **principle violated and why it matters**, not only the fix.

## Actions

| #   | Action               | When to use                                                  |
| --- | -------------------- | ------------------------------------------------------------ |
| 01  | `justify-profile`    | Always first: decide if the rich profile is justified        |
| 02  | `review-layers`      | Layer-by-layer checklist, domain to tests                    |
| 03  | `detect-leaks`       | Find logic placed in the wrong layer                         |

Run 01 to 03 in order and end with the final summary of the review format. Read each action file before running it.

## Before starting

1. Read every file of the module.
2. Load the `dotnet-conventions` skill: `references/architecture.md` (base, **always** checked), `references/ddd.md` (grading, checked **per profile**), `references/review-format.md` (output).
3. Resolve the domain profile as described in `dotnet-conventions`. Use the project memory for stack, layer paths and conventions; without it, apply generic conventions and say so once.

## Output

- Phase 1: a clear verdict (see action 01).
- Phase 2: per-layer scores, in this shape:

```
## Architecture review: {MODULE}

### Scores per layer
- Domain         : X/5 - {one-line comment}
- Application    : X/5 - {comment}
- Infrastructure : X/5 - {comment}
- Presentation   : X/5 - {comment}
- Tests          : X/5 - {comment}
```

- Phase 3: findings in the finding block of `references/review-format.md` (without Before / After), then the mandatory final summary (top 3, what works well).

## Pedagogical rule

For each problem, name the DDD / clean architecture principle violated and why it counts:
- **Testability**: can the handler be tested without ORM or HTTP infrastructure?
- **Maintainability**: where do we look when a business rule changes?
- **Evolvability**: can the database schema change without touching the domain?
- **Encapsulation**: can the module change its internals without breaking presentation?

Read-only: report, never fix.
