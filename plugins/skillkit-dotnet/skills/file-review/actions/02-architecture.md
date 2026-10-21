# Action 02: architecture (base, always)

Check against `architecture.md`:

- **Handler too big**: does it do more than one thing? Orchestrate OR transform, not both.
- **Business logic in a handler**: a complex business rule lives in the domain, not inline in the handler.
- **Infrastructure dependency in the domain**: no ORM, no HTTP client, no framework.
- **Command/Query not a `public record`**: unreachable from the entry layer.
- **Repository containing business rules**: it persists and reads; it does not filter by business rule or validate inputs.
- **Endpoint injecting more than the mediator + cancellation token**: everything goes through the mediator.
- **Domain event without a registered handler**: a dispatched event silently ignored.
