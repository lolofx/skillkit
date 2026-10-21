# Action 01: patterns (rich profile)

Detect and explain every deviation from the aggregate / handler / repository conventions:

| Detected | Problem | Expected fix |
| -------- | ------- | ------------ |
| `public` setter on an aggregate or entity | Breaks encapsulation: state can be changed from anywhere | `private` constructor + named business methods (`ChangeStatus()`, `Recalculate()`) |
| `public` constructor on an aggregate | Bypasses the factory: invariants not validated at creation | `public static {X}Aggregate Create(...)` + `private`/`protected` constructor |
| Aggregate not `sealed` | Allows inheritance: complicates encapsulation and tests | Always `sealed` |
| `new {X}Aggregate(...)` directly in a handler | Bypasses the factory: invariants not guaranteed | `{X}Aggregate.Create(...)` |
| `public` on a command/query handler | Exposed outside its layer: breaks encapsulation | `internal sealed` |
| `public` on a validator | Same: validators are implementation details | `internal sealed` |
| Repository interface defined on the infrastructure side | Couples the domain to infrastructure | Interface on the domain side, implementation on the infrastructure side |
| `throw` in a handler | Breaks the `Result<T>` flow: exception not handled uniformly | Return a typed failure (`Result.Failure(Error.NotFound(...))` or equivalent) |
| Handler returning `T` instead of `Result<T>` | Loses the application's uniform error handling | Always return `Result<TResponse>` |
| `try/catch` in an endpoint | Hides errors, breaks the `Result<T>` flow | `.Match(onSuccess, toErrorResponse)` |
| Business logic in an endpoint | Violates SRP: an endpoint only dispatches | Zero logic: `mediator.Send(...)` then `.Match(...)` |
| Entity <-> aggregate mapping in a handler | Layer leak: the handler knows how persistence works | Dedicated mapping extension on the infrastructure side |
| Hard-coded dependency version in a `.csproj` with central package management | Risk of version drift | Let the central file carry the version |
