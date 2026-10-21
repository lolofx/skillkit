# Action 03: refactor

Goal: better code and tests, same behavior.

1. Clean the code (naming, duplication, extraction) **without changing behavior**.
2. Clean the tests too (readability, shared setup), but never their assertions.
3. Run the whole suite after every change. A test that breaks during a refactor means: revert the change, do not adapt the test.
4. Stop when the code reads clearly; do not start a redesign here (use `aidd-dev:07-refactor` for that).

Report: what changed, suite result. Update the plan's step status to `refactored` if a plan tracks it.
