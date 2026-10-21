# Action 02: write

1. Create or extend the test file, mirroring the source path in the test project (`{Module}/UseCases/Create{X}/Create{X}HandlerTests.cs`).
2. Follow the pattern of the code type (`references/code-types.md`).
3. One test per scenario from action 01. Arrange / Act / Assert, separated by blank lines, no comments restating the code.
4. Build the object under test through a small factory method or constructor in the test class; share setup only when it stays readable.
5. Mock only the **ports** the code depends on. Never mock the object under test or pure value types.
6. Verify interactions (`Verify`) only when the call itself is the behavior (a save, a published event); otherwise assert on the result.
7. Handlers are usually `internal sealed`: reach them through `InternalsVisibleTo`; do not make production types public for tests.
8. Cancellation tokens: pass `CancellationToken.None` unless a test is about cancellation.
