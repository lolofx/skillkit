# Layers

The order follows the dependency rule: each layer only depends on the ones before it.

```
Domain  <-  Application  <-  API / presentation
                         <-  Infrastructure
```

The dependency rule sets the order. Domain and Application come first because everything depends on them. API / presentation comes before Infrastructure so that the use case is exposed and proven against the application layer before any technical detail is chosen; Infrastructure then implements the ports that earlier layers defined.

## What each layer does and how it is tested

| #   | Layer               | Built in this slice                                                          | Tests (RED)                                                                      | Collaborators           |
| --- | ------------------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ----------------------- |
| 1   | Domain              | Entities, value objects, aggregates, domain rules, **port interfaces**       | Pure unit tests: invariants, rules, success and failure cases. No mocks.         | none                    |
| 2   | Application         | Use cases: commands, queries, handlers, validators, DTO mapping              | Unit tests on the handler with **ports mocked or faked**: orchestration, errors  | domain real, ports fake |
| 3   | API / presentation  | HTTP endpoints, controllers, messaging entry points; or Angular components   | Endpoint or component tests with the **application layer faked**: routing, status codes, serialization, rendering, no business logic | application fake |
| 4   | Infrastructure      | Port implementations: repositories, external clients, ORM mapping, migrations | **Integration tests** against the real technology (database, broker, HTTP stub)  | real technology         |

## Rules per layer

- **Domain**: zero technical dependency. If a test needs a mock framework, the logic belongs to the Application layer.
- **Application**: the ports it uses were declared in the Domain slice. Tests replace them with fakes; they never touch a database.
- **API / presentation**: no business rule. If a test asserts a business outcome, the rule is in the wrong layer.
- **Infrastructure**: the contract is the port declared earlier. Write the integration test from the port's behavior (save then load returns the same aggregate), not from the ORM's. These tests are slower: keep them apart from the fast unit suite, but the layer is not green until they pass.

## Frontend (Angular) mapping

The same order applies with the frontend vocabulary. The exact folders come from the project memory.

| Layer               | Angular                                                                              |
| ------------------- | ------------------------------------------------------------------------------------ |
| Domain              | Models, pure functions, validation and business rules, no Angular import             |
| Application         | Facades, stores, signals-based state, use case services, port abstractions (injection tokens) |
| API / presentation  | Components and templates (smart then presentational), routing                        |
| Infrastructure      | HTTP clients and mappers implementing the ports, interceptors, storage adapters      |

On the frontend the presentation layer is often the largest and the one the user sees; keep the order anyway: the state and rules it renders are proven first.

## Choosing the slices of a step

- A step that only changes one layer has one slice. Do not invent the others.
- A step that adds a field end to end has up to four slices; each one is a small commit.
- A module with a **simple** domain profile (CRUD) may have an empty or trivial Domain slice. Say so and move on, do not force DDD (see the stack plugin's DDD guidance).
- Slice names in the plan: `<step>: domain`, `<step>: application`, `<step>: api`, `<step>: infrastructure`.
