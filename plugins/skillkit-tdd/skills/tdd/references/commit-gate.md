# Commit gate

Before **any** commit, in this order:

1. **Tests run and green**: the full suite, at the moment of the commit, not "they passed earlier".
2. **Documentation up to date**: the plan, its status tracking, and any doc impacted by the change.
3. **Conventions respected**: a quick check against the project memory and the stack guidance.

If one is missing, no commit: fix first.

## What enforces it

The `guard-commit` hook of this plugin denies a `git commit` Bash command when no green test run was recorded in the last 30 minutes. The `track-tests` hook records each test run (`dotnet test`, `node --test`, `ng test`, `npm test`, `vitest`) in `.claude/.last-test-run` as `<UTC timestamp>|PASS` or `|FAIL`.

- The gate only applies to a repo that contains a `.sln`/`.csproj`, `*.test.js`/`*.test.mjs`, `angular.json` or `package.json`.
- It does not apply to a `git commit` typed by hand in a terminal outside Claude Code.
- A test run is only recognised when its output has a pass/fail summary; with an output filter that hides the summary (for example a compact wrapper), the run is recorded as FAIL. Run the plain command before committing.
- A hook must never be bypassed: run the tests instead.
- Requires `jq` for the `.sh` variants (Linux, macOS, WSL); the `.ps1` variants need nothing.
