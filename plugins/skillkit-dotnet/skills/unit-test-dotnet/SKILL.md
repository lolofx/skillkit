---
name: unit-test-dotnet
description: Write, complete or fix unit tests for .NET backend code, using the test frameworks the project already has (xUnit, Moq and Shouldly by default when none exists). Classifies the code under test (aggregate, value object, handler, validator, mapping), writes tests in the matching pattern, runs them and fixes them until green. Use whenever unit tests, *Tests.cs or coverage of a C# file are mentioned. Not for the RED phase of a strict TDD cycle (use skillkit-tdd), integration tests, or E2E journeys (use aidd-dev 06-test).
argument-hint: source file or class to test
---

# Skill: unit-test-dotnet

Write unit tests for a C# file so they verify **behavior**, then run them until they pass.

## Actions

| #   | Action          | When to use                                                       |
| --- | --------------- | ----------------------------------------------------------------- |
| 01  | `analyze`       | Read the code, detect the frameworks and classify the code type   |
| 02  | `write`         | Write the tests following the pattern of that code type           |
| 03  | `run-and-fix`   | Run, fix failing tests, report                                    |

Run them in order. Read each action file in `actions/` before running it.

## Transversal rules

- Test observable behavior, never implementation details.
- One behavior per test, Arrange / Act / Assert, name = scenario (`Create_WithEmptyName_ReturnsValidationError`).
- Frameworks: use what the project already uses. If there is none, default to xUnit + Moq + Shouldly.
- Production code is never modified to make a test pass. If it looks wrong, report it.
- When called inside a TDD cycle on code that does not exist yet, use `skillkit-tdd` (RED first), not this skill.
- Repositories and HTTP endpoints are out of the unit scope: say so instead of faking tests for them.
