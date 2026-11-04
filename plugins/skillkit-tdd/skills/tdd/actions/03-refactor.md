# Action 03: refactor

Goal: better code and tests in this layer, same behavior.

1. Clean the layer's code (naming, duplication, extraction) **without changing behavior**.
2. Clean the layer's tests too (readability, shared setup), but never their assertions.
3. Run the whole suite after every change. A test that breaks during a refactor means: revert the change, do not adapt the test.
4. Stay inside the layer. A design smell that spans layers is noted in the report for the review, not fixed here.
5. Stop when the code reads clearly; do not start a redesign here (use `aidd-dev:07-refactor` for that).

Report: what changed, suite result. Update the slice status to `refactored` if a plan tracks it.
