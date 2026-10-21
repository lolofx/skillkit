# Action 03: language

Check:

- Nullable type (`string?`, `T?`) where the value should never be null: hides a design problem.
- Null-forgiving operator (`!`) without a justifying comment.
- `var` abuse where the type is not obvious.
- `async` methods not propagating the cancellation token.
- `async` method without `await`: a synchronous method in disguise.
- Blocking call (`.Result`, `.Wait()`) on an async operation: potential deadlock.
- Local time (`DateTime.Now`) instead of UTC (`DateTime.UtcNow`).
- ID generated in the repository instead of the domain factory: the ID belongs to the domain.
- Mutable record (`{ get; set; }`) for a DTO or value object that should be immutable: prefer `{ get; init; }` or a positional record.
- Value object without invariant validation at construction.

For a full language-level pass, hand over to the `csharp-quality` skill.
