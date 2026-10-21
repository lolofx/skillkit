# Action 03: run-and-fix

1. Run the new spec first (the project's test command with a file filter), then the whole suite.
2. A failing test: decide whether the **test** or the **production code** is wrong.
   - Test wrong (bad arrangement, missing change detection, wrong expectation): fix the test.
   - Production code looks wrong: do **not** edit it and do not bend the assertion. Report it with the failing output.
3. Repeat until the new tests pass and no existing test broke. Stop after three unsuccessful attempts on the same test and report what blocks it.
4. Report: the spec files, the number of tests, the suite result (`X/X green`), the behaviors left uncovered and why, and any suspected production bug.
