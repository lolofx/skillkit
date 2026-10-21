# Action 01: red

Goal: a single failing test that captures the next increment of the step.

1. Write **one** test, the smallest that moves the step forward. Name it after the scenario (for example `Create_WithEmptyName_ReturnsValidationError`, or `rejects an empty name`). Structure: Arrange / Act / Assert, one behavior per test.
2. Test observable behavior, never implementation details that would break on a refactor.
3. Run it, and check that it fails for the **right reason**:
   - valid: a false assertion, or a missing member or type (in a compiled language, a compile error on the not-yet-existing production type is a valid RED);
   - invalid: a setup error, a typo, a broken fixture. Fix the test and rerun.
4. A test that passes immediately means the behavior already exists or the test checks nothing. Report it instead of continuing.
5. Do **not** write or stub production code in this action.

Report: test file(s), the failing output, the reason in one sentence. Update the plan's step status to `red` if a plan tracks it.
