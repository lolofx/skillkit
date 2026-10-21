---
name: unit-test-angular
description: Write, complete or fix unit tests for Angular code, using the test runner the project already has (Vitest by default for recent Angular, otherwise Jasmine/Karma or Jest). Classifies the code under test (pure function, service, store, component, pipe, directive, guard), writes tests in the matching pattern, runs them and fixes them until green. Use whenever unit tests, *.spec.ts or coverage of an Angular file are mentioned. Not for the RED phase of a strict TDD cycle (use skillkit-tdd), for E2E or browser journeys (use aidd-dev 06-test), or for Storybook.
argument-hint: source file to test
---

# Skill: unit-test-angular

Write unit tests for an Angular file so they verify **behavior**, then run them until they pass.

## Actions

| #   | Action        | When to use                                                     |
| --- | ------------- | --------------------------------------------------------------- |
| 01  | `analyze`     | Read the code, detect the runner and classify the code type     |
| 02  | `write`       | Write the tests following the pattern of that code type         |
| 03  | `run-and-fix` | Run, fix failing tests, report                                  |

Run them in order. Read each action file in `actions/` before running it.

## Transversal rules

- Test observable behavior (what the user sees, what is emitted, what is returned), never private members or implementation details.
- One behavior per test, Arrange / Act / Assert, name = scenario.
- Use the runner and helpers the project already uses. Without any, default to Vitest.
- Prefer `data-testid` hooks over CSS classes or text when querying the DOM, when the project uses them.
- Production code is never modified to make a test pass. If it looks wrong, report it.
- When working on code that does not exist yet inside a TDD cycle, use `skillkit-tdd` (RED first).
