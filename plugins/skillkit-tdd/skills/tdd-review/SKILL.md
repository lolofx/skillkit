---
name: tdd-review
description: Review a branch built with layered TDD, commit by commit, checking that each commit closes one architecture layer (Domain, Application, API or presentation, Infrastructure) in dependency order, with its tests, and that no commit edits an inner layer or weakens a test. Use before merging a feature built with the tdd skill, or to audit the commit history of a branch. Not for judging the architecture of the final code (use ddd-review or ng-review) or a generic diff review (use aidd-dev 05-review).
argument-hint: commit range, for example main..HEAD
---

# Skill: tdd-review

Read-only review of **how the branch was built**, not only of what it contains. The layered `tdd` skill promises small commits that each close one layer; this review checks the promise and makes the reading order of the branch obvious for a human reviewer.

## Actions

| #   | Action          | When to use                                                                  |
| --- | --------------- | ---------------------------------------------------------------------------- |
| 01  | `map-commits`   | Always first: classify every commit of the range by layer                    |
| 02  | `check-slices`  | One layer per commit, dependency order, tests shipped with the code          |
| 03  | `check-tests`   | No weakened, deleted or skipped test; inner layers untouched by outer slices |

Run 01 to 03 in order, then end with the final summary of the review format. Read each action file before running it.

## Before starting

1. Resolve the range: the argument, otherwise the commits of the current branch not in the default branch (`<default>..HEAD`).
2. Load the project memory (`aidd_docs/memory/`) for the layer paths and the **domain profile** of the module. A layer with no project-specific path falls back to the defaults of `scripts/layer-map.sh`; a project with another layout gives a layers file (`<layer> <regex>` per line).
3. Load the review format of the stack plugin when one is installed (`dotnet-conventions/references/review-format.md` or `angular-conventions/references/review-format.md`). Without one, use the same finding block: `{🔴|🟠|🟡|🟢} **Title** / Location / Problem / Fix`, and the final summary (**Score X/10**, **Top 3 to fix**, **What works well**).

## What a good branch looks like

```
domain          tests + code, one commit
application     tests + code, one commit
api             tests + code, one commit
infrastructure  tests + code (integration), one commit
```

A layer may be absent when the step does not change it, and one layer may take several commits when the slice was split. The order never goes backward: once a commit touches an outer layer, later commits must not edit an inner one without a stated reason (a reopened slice, visible in the commit message).

## Severity

| Level | Typical case                                                                                   |
| ----- | ---------------------------------------------------------------------------------------------- |
| 🔴    | A test weakened, deleted or skipped to get green; production code with no test anywhere in range |
| 🟠    | A commit mixing layers; an outer layer committed before an inner one; an inner layer edited by an outer slice with no reopened RED |
| 🟡    | Production code committed without its tests but covered in a later commit of the same layer; commit message not naming the layer |
| 🟢    | A layer legitimately skipped (state it as a strength), a slice that could be split further     |

Read-only: report, never fix and never rewrite history. The tests and the commits are the author's to change.
