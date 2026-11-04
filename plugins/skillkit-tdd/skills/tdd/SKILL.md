---
name: tdd
description: Run strict TDD on a plan step, a fix or a small feature, layer by layer following the clean / hexagonal dependency order (Domain, Application, API or presentation, Infrastructure), with RED, GREEN, REFACTOR and one commit per layer. Use when implementing behavior that touches production code and tests must drive it. Not for planning (use aidd-dev 01-plan), for adding coverage to existing code (use aidd-dev 06-test), or for debugging a failure (use aidd-dev 08-debug).
argument-hint: step or behavior to implement
---

# Skill: tdd

Drive a step **layer by layer**, from the center of the architecture outward. Each layer is a complete, closed TDD cycle ending in its own commit:

```
Domain  ->  Application  ->  API / presentation  ->  Infrastructure
 RED > GREEN > REFACTOR > commit   (repeated for each layer)
```

Why: one RED for the whole feature gives tests that cannot compile, an unreadable diff and design mistakes discovered at the end. One layer at a time gives small commits, a review that follows the dependency rule, and an error located in the layer where it was introduced.

The rules live in `references/tdd-rules.md`, the layer order and what each layer tests in `references/layers.md`; the actions below are the operating procedure.

## Actions

| #   | Action     | When to use                                                                      |
| --- | ---------- | -------------------------------------------------------------------------------- |
| 00  | `slice`    | Once per step: split it into layer slices, in dependency order                   |
| 01  | `red`      | Per layer: write the failing tests of this layer only, prove they fail properly |
| 02  | `green`    | Per layer: minimum code in this layer only until the whole suite is green        |
| 03  | `refactor` | Per layer: clean code and tests under a green suite                              |
| 04  | `commit`   | Per layer: gate check, then one commit for this layer                            |

Run `00` once, then `01` to `04` for each slice, in order. Read the action file in `actions/` before running it, not only this table.

## Before starting

1. Identify the step: from the plan produced by `aidd-dev:01-plan` (under `aidd_docs/tasks/`), or restate the target behavior in one sentence for a small fix.
2. Load `references/tdd-rules.md` and `references/layers.md`. Also load the stack guidance if a skillkit stack plugin is installed (`skillkit-dotnet`, `skillkit-angular`), and the project memory (`aidd_docs/memory/`) for conventions, test frameworks and the **domain profile** of the module.
3. Run the existing suite. It must be **green** before touching anything; if it is not, stop and say so.

## Working with agents

- The RED of each layer is written by the `test-writer` agent of this plugin.
- The GREEN and REFACTOR are done by an implementer: `backend-implementer` / `frontend-implementer` when a skillkit stack plugin is installed, otherwise `aidd-dev:executor`.
- **Whoever writes the test does not implement it; whoever implements does not touch the tests.** A test judged wrong is reported, never rewritten on the side.
- Give each agent the **layer** it works on. It must not read or write outside it, except to read the inner layers it depends on.

## Transversal rules

- **One layer at a time, inside out.** Never start a layer while the previous one is not green and committed.
- **A layer slice never edits an inner layer.** If the Application layer needs a new domain member, stop: the need goes back to the Domain slice (reopen it, new RED), it is not patched from the outside.
- No production code without a prior red test, even for an "obvious" fix.
- Never change an assertion to make a test pass.
- A test that passes on its first run is suspect: investigate before going on.
- A layer with nothing to test or build for this step (for example no persistence change) is skipped explicitly, and the skip is stated in the report.
- Blocked (missing dependency, ambiguous plan, untestable behavior): stop and ask instead of improvising.

## Output of a layer

State the step, the layer, the tests added, the files touched, the suite state (`X/X green`) and the commit. Then start the next layer. When all layers are done, suggest `aidd-dev:05-review` on the whole branch: the layered commits are what makes that review easy to follow.
