# TDD rules

TDD is the rule, not a recommendation: **no production code without a prior red test, no commit without a green suite.**

## The cycle

Each plan step is one complete cycle.

- **RED**: one test, the smallest useful one, failing for the right reason (see `actions/01-red.md`).
- **GREEN**: the minimum code, then the whole suite (see `actions/02-green.md`).
- **REFACTOR**: clean code and tests under protection (see `actions/03-refactor.md`).

## Non-negotiable rules

- Never modify a test to make it pass. If a test looks wrong, say so explicitly: fixing it is a decision, not a workaround.
- Never write production code without a prior red test, including for "a small obvious fix".
- When working with agents, separate the roles: the author of the test does not implement it; the implementer does not touch the tests.
- A test checks an observable **behavior**, not an implementation (no assertion on internals that would break on the first refactor).
- One behavior per test, Arrange / Act / Assert, a name that describes the scenario.
- A test that passes on its first run is suspect.

## What to unit test

| Target                                                             | Unit tests                                         |
| ------------------------------------------------------------------ | -------------------------------------------------- |
| Business rules (aggregates, value objects, entities)               | Priority: happy path and failure cases             |
| Command / query handlers                                           | With mocked ports: orchestration, mapping, errors  |
| Validators                                                         | Valid cases plus each rejection rule               |
| Components and services with logic                                 | Behavior through the public surface                |
| Repositories, HTTP endpoints, anything crossing a process boundary | Out of the unit suite: separate integration tests  |

- Add architecture tests when a layering rule must stay enforced (for example no ORM reference in the domain).
- Keep integration tests (database, external services) apart from the fast unit suite.
