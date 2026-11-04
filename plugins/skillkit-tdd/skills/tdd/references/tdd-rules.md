# TDD rules

TDD is the rule, not a recommendation: **no production code without a prior red test, no commit without a green suite.** And it is applied **layer by layer**, never on a whole feature at once.

## The cycle

Each plan step is cut into layer slices (`actions/00-slice.md`), in dependency order: Domain, Application, API / presentation, Infrastructure (`layers.md`). Each slice is one complete cycle and one commit.

- **RED**: the failing tests of the layer, failing for the right reason (see `actions/01-red.md`).
- **GREEN**: the minimum code in that layer, then the whole suite (see `actions/02-green.md`).
- **REFACTOR**: clean code and tests under protection (see `actions/03-refactor.md`).
- **COMMIT**: the layer is closed by its own commit (see `actions/04-commit.md`).

## Non-negotiable rules

- Never modify a test to make it pass. If a test looks wrong, say so explicitly: fixing it is a decision, not a workaround.
- Never write production code without a prior red test, including for "a small obvious fix".
- Never start a layer before the previous one is green and committed.
- A slice never edits an inner layer. A need discovered in an inner layer reopens that slice with a new RED.
- When working with agents, separate the roles: the author of the test does not implement it; the implementer does not touch the tests.
- A test checks an observable **behavior**, not an implementation (no assertion on internals that would break on the first refactor).
- One behavior per test, Arrange / Act / Assert, a name that describes the scenario.
- A test that passes on its first run is suspect.

## What to test, per layer

| Layer              | Tests                                                                  | Kind                          |
| ------------------ | ---------------------------------------------------------------------- | ----------------------------- |
| Domain             | Invariants and business rules (aggregates, value objects, entities), happy path and failure cases | Unit, no mocks |
| Application        | Handlers and validators with the ports faked: orchestration, mapping, errors | Unit, ports faked        |
| API / presentation | Endpoints or components with the application layer faked: routing, status codes, serialization, rendering | Unit or light integration |
| Infrastructure     | Repositories and external clients against the real technology          | Integration                   |

- Infrastructure is tested with integration tests, written in its own slice, after the layers that define the ports. They are kept apart from the fast unit suite, but the Infrastructure slice is not green until they pass.
- Add architecture tests when a layering rule must stay enforced (for example no ORM reference in the domain). They belong to the Domain slice.
