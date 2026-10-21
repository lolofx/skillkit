# .NET guidelines

Complements `standards.md` (global), `architecture.md` (base) and `ddd.md` (grading).

## 1. Version and language

- Align with the .NET version the project targets; use the modern C# features compatible with it.
- **Nullable reference types enabled**: no `!` to silence the compiler, handle nullability explicitly.
- `record` for immutable data carriers (commands, queries, DTOs, value objects).
- `var` when the type is obvious when reading, an explicit type otherwise.
- Naming: `PascalCase` (types, methods, properties), `camelCase` (variables, parameters), `_camelCase` (private fields), `I` prefix for interfaces.

## 2. Encapsulation and visibility

- **Minimal visibility by default**: `internal sealed` for handlers, validators and repositories; `public` only for what is the module's contract (commands, queries, DTOs, ports).
- The test project reaches internals through `InternalsVisibleTo`.
- No static "toolbox" class (`XxxHelper`, `XxxUtils`): prefer targeted extension methods or injected services.

## 3. Dependency injection

- Constructor DI everywhere. Never `new` on a heavy dependency, never a service locator.
- Explicit, justified lifetimes: `Scoped` by default for anything touching the database, `Singleton` only for stateless.
- The domain layer depends on no DI container.

## 4. Asynchrony

- `async`/`await` end to end for any I/O, never `.Result` or `.Wait()` (deadlocks).
- A `CancellationToken` crosses the whole chain: endpoint, handler, repository.
- `Async` suffix according to the project's convention.

## 5. HTTP API

- Dedicated input/output DTOs, never an ORM entity or an exposed aggregate.
- Input validation at the boundary (validators), consistent HTTP codes: 2xx success, 4xx caller error (validation, not found, conflict), 5xx bug/outage.
- Business errors travel as `Result<T>` (or the project's convention), converted by the error mapper; no `try/catch` in endpoints.
- Documented responses (OpenAPI): the success shape and the error shapes.

## 6. Persistence (EF Core or equivalent)

- Explicit configuration of tables, columns and indexes (no implicit convention for what matters).
- Read-only queries: `AsNoTracking()`.
- Writes persisted explicitly with the `CancellationToken`.
- Rich profile (`ddd.md`): ORM entity is not the aggregate, conversion through mapping extensions.

## 7. Tests

- Frameworks and mocking library: the ones the project already uses (see the `unit-test-dotnet` skill).
- Workflow: strict TDD (`skillkit-tdd`).
- Targets and exclusions: the "what to unit test" table of the TDD rules.
- `dotnet test` must pass **entirely** before any commit.
