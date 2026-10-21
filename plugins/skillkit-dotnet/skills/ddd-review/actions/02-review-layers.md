# Action 02: review-layers

Goal: a layer-by-layer score with the failed checks as evidence. Adapt names and paths to the project (see project memory); the generic structure is `architecture.md` section 3.

## Domain layer

**Base (always):**
- [ ] Zero infrastructure import (no ORM, HTTP client, framework)
- [ ] `I{X}Repository` is a `public` interface on the domain side, with no ORM dependency
- [ ] Business rules are testable without any infrastructure

**Grading (rich profile only):**
- [ ] Aggregates `sealed` with a `private` or `protected` constructor
- [ ] Factory `public static {X}Aggregate Create(...)` validating invariants (exception if invalid)
- [ ] `Reconstitute(...)` rebuilds from persistence without re-validating
- [ ] Mutation methods with business validation return `Result<T>` (expected failure is not a bug)
- [ ] No public setter: state changes through named business methods
- [ ] IDs generated in the factory, not by the database
- [ ] Value objects validate their invariants at construction
- [ ] Domain events implement the project's interface, dispatched through the aggregate

## Application layer

- [ ] One handler = one precise business action (one Command or Query)
- [ ] Commands and Queries are `public record`s implementing the project's interfaces
- [ ] Handlers and validators are `internal sealed`
- [ ] The test project reaches internals (for example `InternalsVisibleTo`)
- [ ] No HTTP concern in handlers
- [ ] No inline business logic: delegation to the domain's methods
- [ ] Handlers return `Result<T>`, every failure explicit, no `throw` (rich profile)
- [ ] Validators use the project's library, `internal sealed`
- [ ] DTO <-> domain mapping delegated to an extension, not inline in the handler

## Infrastructure layer

- [ ] Repository is `internal sealed` and implements the domain interface
- [ ] ORM entities distinct from domain objects (rich profile)
- [ ] Table / column configuration follows the project's conventions, explicit indexes
- [ ] Mapping extensions Aggregate <-> ORM entity <-> DTO (rich profile)
- [ ] No business logic in the repository: persistence and reads only
- [ ] Read-only queries are no-tracking
- [ ] Writes persisted explicitly with the cancellation token
- [ ] Repository registered in the DI container with the right lifetime

## Presentation layer

- [ ] Module registration organizes endpoints into route groups
- [ ] Each route group in its own class
- [ ] Endpoints inject only the mediator + cancellation token (+ parameters)
- [ ] Zero business logic: dispatch then `.Match(...)` only
- [ ] Zero `try/catch`: errors flow through `Result<T>` to the error mapper
- [ ] Authorization declared explicitly on each group
- [ ] OpenAPI response types documented (success + errors)
- [ ] Module registration auto-discovered, not wired by hand

## Tests

- [ ] Aggregate factory tests: happy path + invalid inputs (exception expected)
- [ ] Value object tests: happy path + invariant violations
- [ ] Mutation method tests: success (`result.IsSuccess`) + failure cases
- [ ] Handler tests: repository calls verified (mock) + DTO mapping + error cases
- [ ] Arrange / Act / Assert structure
- [ ] Repositories out of the unit scope (integration)
- [ ] Endpoints out of the unit scope (pure dispatch)
- [ ] Architecture tests when relevant (for example no ORM import in the domain)

Score each layer `X/5` with a one-line comment. Skip the "grading" items for a simple profile, and report over-engineering instead (an aggregate on a CRUD).
