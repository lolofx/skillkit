---
name: csharp-quality
description: C# language-quality check, independent of architecture: works on any C# file whatever the pattern or framework. Nullability, async, typing discipline, LINQ/collections, exception mechanics, code hygiene. Use to review the language level of a C# file. Not for DDD/architecture (use ddd-review or file-review) or for a diff review (use aidd-dev 05-review).
argument-hint: file path
---

# Skill: csharp-quality

Review the **language-level** quality of the C# file the user points to. This skill covers only the language; DDD patterns, architecture and error strategy belong to `ddd-review` and `file-review`.

Read the file in full. For each finding, explain **WHY** it is a problem, not only what to change. Output format: `references/review-format.md` of the `dotnet-conventions` skill.

## Nullability

- `string?` / `T?` where the value should never be null: hides a design problem; fix the cause upstream, do not wrap it in null checks.
- Null-forgiving operator (`!`) without a comment saying why null is impossible: an invisible assumption for the next reader.
- Optional chaining (`?.`) where the type should be non-nullable: signals a missing contract, not a missing null check.
- `== null` / `!= null` instead of pattern matching (`is null` / `is not null`): not idiomatic modern C#.

## Async / concurrency

- `async Task` method without `await`: a synchronous method in disguise (warning CS1998).
- `.Result` or `.Wait()` on a `Task` in an async context: potential deadlock, especially under the ASP.NET request context.
- `async` method without a `CancellationToken` parameter: the caller cannot cancel; acceptable only for real fire-and-forget.
- `CancellationToken` received but not forwarded to inner async calls: the token is silently ignored mid-chain.
- `DateTime.Now` instead of `DateTime.UtcNow`: time-zone sensitive; always store and compare in UTC.

## Typing discipline

- `var` abuse where the inferred type is not obvious: less readable for no real gain.
- `object` or `dynamic` when a concrete type is available: loses compiler guarantees.
- Mutable record (`{ get; set; }`) for a type that should be immutable: prefer `{ get; init; }` or a positional record.
- Private field never reassigned after construction but not `readonly`: a missed intent signal.
- Anonymous tuple (`(string, int)`) where a named record or struct would be clearer.
- Magic number or string: extract into a named constant or enum member.
- `string` where an enum would rule out invalid values at compile time.

## LINQ and collections

- `Count() > 0` instead of `Any()`: iterates the whole collection; `Any()` stops at the first element.
- `.ToList().FirstOrDefault()`: materializes the whole collection for one element; call `.FirstOrDefault()` directly.
- `Select()` before `Where()`: always filter before projecting.
- `FirstOrDefault()` result used without a null check: a silent null reference at runtime.
- A LINQ chain where a simple `foreach` would be clearer: LINQ is not always the right tool.

## Exception mechanics

- Empty `catch` block: swallows the exception silently; at the very least log and rethrow.
- `catch (Exception)`: too broad; catch the most specific type possible.
- `throw e` instead of `throw`: resets the stack trace; always rethrow with a bare `throw`.
- `try/catch` around code that cannot throw: noise that misleads about the real risk.

## Code hygiene

- Type or member more visible than needed (`public` where `internal`/`private` suffices): minimal visibility always.
- Concrete class not `sealed` with no planned subclass: `sealed` improves JIT devirtualization and signals intent.
- `static` utility class carrying logic with external dependencies: prefer an injectable service for testability.
- `IDisposable` / `IAsyncDisposable` without `using` / `await using`: resource leak.
- Async method without the `Async` suffix: breaks the BCL convention.
- Synchronous method carrying the `Async` suffix: misleading name.
- Unused `using` directives: noise; remove them.

## Output

Findings in the shared block with `Before` / `After` from the real file, severity 🔴 🟠 🟡 🟢, then the mandatory final summary (score, top 3, what works well). Read-only: report, never fix.
