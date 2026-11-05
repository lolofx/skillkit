# Test patterns per code type

Examples use xUnit, Moq and Shouldly. Translate to the project's frameworks if they differ.

## Aggregate / entity (rich profile)

- Factory: valid input returns an aggregate with the expected state; each invalid input throws (`Should.Throw<...>`).
- `Reconstitute`: rebuilds the state without re-validating (a state that `Create` would reject is accepted).
- Mutation methods: success path (`result.IsSuccess.ShouldBeTrue()` and the new state) and each business failure (`result.IsFailure`, the error code).
- Domain events: the expected event is raised, with the right payload.
- No mock needed: pure objects.

## Value object

- Valid values construct; each invariant violation is rejected.
- Equality by value: two instances with the same value are equal, different values are not.
- Normalization (trim, casing) when the type does it.

## Application handler (command / query)

- Arrange the mocked ports (`Mock<IOrderRepository>`) to return the data of the scenario.
- Act: `await handler.Handle(command, CancellationToken.None)`.
- Assert: the result (success value or error type) first; then `Verify` the port call only if the write is the behavior (`Times.Once`).
- Cases: happy path, resource not found, validation failure from the domain, port failure if the handler maps it.

## Validator

- A valid command passes.
- One test per rejection rule, asserting the failing property and message/code.
- Use `[Theory]` with `[InlineData]` for boundary values of the same rule.

## Domain service

- Pure logic: arrange inputs, assert outputs. Mock only injected ports.

## Mapping extension / DTO conversion

- Each mapped field, nullable and optional fields, and a round trip when both directions exist.
- Skip trivial property-to-property copies that only duplicate the mapping code; test the conversions that carry a rule (enum mapping, formatting, defaults).

## Out of unit scope

- Repositories: need a database, belong to integration tests.
- HTTP endpoints: pure dispatch, nothing to assert in isolation.
