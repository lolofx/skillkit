---
name: dotnet-conventions
description: Conventions for .NET backend code, as references loaded on demand: hexagonal base (dependency rule, business/use-case slicing), graded DDD (simple vs rich domain profile), C#/.NET rules, global code standards, and the shared review output format. Use when creating, moving or reviewing C# code, choosing a domain profile, or when another skillkit-dotnet skill or agent needs the rules. Not for Angular code (use skillkit-angular) or for the TDD procedure itself (use skillkit-tdd).
---

# Skill: dotnet-conventions

Opinionated rules for a .NET backend. They are **references**, loaded only when the task needs them.

## References

| File | Load when |
| ---- | --------- |
| `references/architecture.md` | Creating, moving or reorganizing backend code (module, use case, project). Mandatory base for any service, whatever the domain profile. |
| `references/ddd.md` | Touching the domain of a module whose profile is "rich", or choosing the profile of a new module. |
| `references/dotnet.md` | Writing or changing C# / .NET code. |
| `references/standards.md` | Writing or changing any code (style, errors, logs, naming). |
| `references/review-format.md` | Producing a review (severity levels, finding block, final summary). |

## Domain profile

The architecture base always applies. The DDD toolbox is **graded** per module:

- **simple**: CRUD / reference data, few rules. Plain entities, thin handlers, no aggregate.
- **rich**: strong domain (invariants, states, calculations). Aggregates, value objects, `Result<T>`, domain events.

Where the profile is declared, in this order:
1. The project memory (`aidd_docs/memory/`): look for a "domain profile" entry, global or per module.
2. Otherwise, the repo's own docs (`CLAUDE.md`, `README`, architecture notes).
3. Otherwise, undeclared: decide with `ddd-review` phase 1, and suggest the user records the verdict in the project memory (one line per module) so it stops being re-derived.

Reviews check the base **always** and the DDD toolbox **only if the profile declares it**, and flag any gap between the declared profile and the observed code.

## Optional depth

For deeper background on DDD, hexagonal, CQRS or testing strategy, a reference skill such as `clean-ddd-hexagonal` can be consulted if the user has one installed. These rules stay the source of truth for this repo's conventions: when the two disagree (for example layer-first versus business-first folders), follow `references/architecture.md`.
