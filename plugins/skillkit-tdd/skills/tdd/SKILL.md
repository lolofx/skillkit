---
name: tdd
description: Run one strict TDD cycle (RED, GREEN, REFACTOR) on a plan step, a fix or a small feature, with the test written before any production code. Use when implementing behavior that touches production code and tests must drive it. Not for planning (use aidd-dev 01-plan), for adding coverage to existing code (use aidd-dev 06-test), or for debugging a failure (use aidd-dev 08-debug).
argument-hint: step or behavior to implement
---

# Skill: tdd

Drive **one step** through a full RED → GREEN → REFACTOR cycle. The rules live in `references/tdd-rules.md`; the actions below are the operating procedure.

## Actions

| #   | Action     | When to use                                                             |
| --- | ---------- | ----------------------------------------------------------------------- |
| 01  | `red`      | Write the smallest failing test and prove it fails for the right reason |
| 02  | `green`    | Write the minimum production code that makes it pass                    |
| 03  | `refactor` | Clean code and tests under a green suite                                |

Run them in order, once per step. Read the action file in `actions/` before running it, not only this table.

## Before starting

1. Identify the step: from the plan produced by `aidd-dev:01-plan` (under `aidd_docs/tasks/`), or restate the target behavior in one sentence for a small fix.
2. Load `references/tdd-rules.md`. Also load the stack guidance if a skillkit stack plugin is installed (`skillkit-dotnet`, `skillkit-angular`), and the project memory (`aidd_docs/memory/`) for conventions and test frameworks.
3. Run the existing suite. It must be **green** before touching anything; if it is not, stop and say so.

## Working with agents

- The RED is written by the `test-writer` agent of this plugin.
- The GREEN and REFACTOR are done by an implementer: `backend-implementer` / `frontend-implementer` when a skillkit stack plugin is installed, otherwise `aidd-dev:executor`.
- **Whoever writes the test does not implement it; whoever implements does not touch the tests.** A test judged wrong is reported, never rewritten on the side.

## Transversal rules

- No production code without a prior red test, even for an "obvious" fix.
- Never change an assertion to make a test pass.
- A test that passes on its first run is suspect: investigate before going on.
- Blocked (missing dependency, ambiguous plan, untestable behavior): stop and ask instead of improvising.

## Output of a cycle

State the step, the test added, the files touched and the suite state (`X/X green`). Then start the next step, or, when the plan is done, suggest `aidd-dev:05-review` and `aidd-vcs:01-commit`. The commit gate (`references/commit-gate.md`) applies at commit time.
