# Action 01: analyze

1. Read the source file in full, and its direct collaborators (injected services, child components, models).
2. Detect the test setup: runner (`vitest`, `jest`, Karma/Jasmine) in `package.json`, `angular.json` test target, an existing `*.spec.ts` next to similar code. Match its style, utilities and mocking approach.
3. Classify the code under test (patterns in `references/code-types.md`): pure function / utility, service, store, component (smart or presentational), pipe, directive, functional guard or resolver, interceptor.
4. List the behaviors to cover as short scenario names before writing code: happy path, each failure path, each input/output, loading and error states. Show the list to the user when it exceeds about ten tests.
