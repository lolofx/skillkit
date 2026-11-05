# Action 04: errors

Adapt to the error pattern the project declares (project memory). Otherwise apply the following generically.

Check:

- `null` returned instead of a typed failure result in a handler.
- `.Value` accessed without checking success first: crash on failure.
- Only the first error forwarded when the full list is available.
- A generic failure type where a semantic one exists (`NotFound`, `Validation`, `Business`).
- Error objects without a machine `code` + a human `message`.
- Missing result-to-HTTP mapping in the endpoint.

**Generic error type to HTTP status mapping:**

| Error type | HTTP status | When |
| ---------- | ----------- | ---- |
| Validation | 400 | Invalid input or violated input rule |
| NotFound | 404 | Resource does not exist |
| Business / Conflict | 422 | Business rule violated (valid input, invalid state) |
| Failure | 500 | Unexpected technical error |

**Expected endpoint pattern (names to adapt to the stack):**

```
result = await mediator.Send(command, cancellationToken)
return result.Match(
    success -> HTTP 200 with payload,
    failure -> mapped error response (ProblemDetails or equivalent)
)
```
