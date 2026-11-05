# Global standards

Base reference for any code produced by a developer or an agent.

## 1. Style

- **Readable** code: clarity beats clever concision.
- Explicit English names: `CalculateInvoiceTotal`, `CustomerRepository`. No opaque abbreviations (`CalcInvTot`), no generic names (`Manager`, `Helper`, `Utils`).
- One **main responsibility** per class/component.
- A method fits on a screen; beyond that, extract.
- No comment that paraphrases the code. A comment explains a non-obvious **why**, never a what.
- Follow the language's idiom and the surrounding code: comment density, naming, existing style.

## 2. Error handling

- **Never** an exception swallowed without handling or logging.
- Two families:
  - **Expected business failure** (validation, conflict, not found): explicit return value (`Result<T>` or the project's equivalent).
  - **Bug or technical failure** (impossible state, infrastructure down): exception.
- Specific exceptions rather than generic ones when the caller must tell cases apart.
- Every logged error carries its context: business identifiers (customer id, order id...), the operation in progress, the technical message.

## 3. Logs

- No sensitive data in logs (password, token, banking or personal data).
- Consistent levels: `Debug` (dev diagnostics), `Info` (normal business event), `Warn` (abnormal but handled), `Error` (failure needing attention).
- Logs serve to **diagnose in production**: use-case entry/exit, errors, non-standard paths. Short messages, structured context.

## 4. Naming

- Types, methods, properties: the language's convention (`PascalCase` in C#).
- The name states the **business intent**, not the technique: `ConfirmOrder()`, not `UpdateStatus(2)`.
- Booleans named as assertions: `IsActive`, `HasPendingInvoice`.

## 5. Tests

- Strict TDD (`skillkit-tdd`).
- A test checks a **business behavior**, not an implementation. No "cosmetic" test that duplicates the code under test.
- Stable, readable, independent tests (no implicit execution order).
- Arrange / Act / Assert.

## 6. Review and commits

- Any significant change goes through a review (pull request or equivalent).
- Before any commit: **green tests actually run** plus up-to-date documentation.
- Review focus: readability, respect of the conventions, consistency with `architecture.md`, performance and security impact.

## 7. AI-generated code

- AI is an assistant, not an authority: all generated code is read and understood before being committed.
- Generated code respects these conventions and the project memory.
- Never commit code you do not understand.
