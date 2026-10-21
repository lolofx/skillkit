# Action 01: analyze

1. Read the source file in full, and its direct collaborators (ports, value objects, errors) as needed.
2. Detect the test setup of the solution: find the test project (`*Tests.csproj`), its packages (xUnit / NUnit / MSTest, Moq / NSubstitute, Shouldly / FluentAssertions) and an existing test next to similar code. Match their style and helpers. Without any test project, propose xUnit + Moq + Shouldly and say so.
3. Classify the code under test. See `references/code-types.md` for the pattern of each:
   - aggregate / entity
   - value object
   - application handler (command or query)
   - validator
   - domain service
   - mapping extension / DTO conversion
   - out of unit scope (repository, endpoint): stop and say so
4. List the behaviors to cover (happy path, each failure path, each branch), as short scenario names, before writing any code. Show the list to the user when it exceeds about ten tests.
