# Action 01: red

Goal: the failing tests of **the current layer**, and only that layer.

1. Write the tests that capture the slice's behaviors (the list from `00-slice`), in the test style of this layer (`references/layers.md`). Each test: one behavior, Arrange / Act / Assert, named after the scenario (for example `Create_WithEmptyName_ReturnsValidationError`, or `rejects an empty name`).
2. Stay inside the layer: inner layers are already green and committed, so use them as they are; outer layers do not exist yet. Collaborators the layer does not own (ports, the application layer for an endpoint) are faked.
3. Test observable behavior, never implementation details that would break on a refactor.
4. Run them, and check that they fail for the **right reason**:
   - valid: a false assertion, or a missing member or type in this layer (in a compiled language, a compile error on a not-yet-existing production type of this layer is a valid RED);
   - invalid: a setup error, a typo, a broken fixture, a reference to something from an outer layer. Fix the test and rerun.
5. A test that passes immediately means the behavior already exists or the test checks nothing. Report it instead of continuing.
6. If the slice holds many behaviors (more than about five) or several concerns, split it: RED, GREEN, REFACTOR for the first group, then loop for the next, before the layer commit.
7. Do **not** write or stub production code in this action.

Report: layer, test file(s), the failing output, the reason in one sentence. Update the slice status to `red` if a plan tracks it.
