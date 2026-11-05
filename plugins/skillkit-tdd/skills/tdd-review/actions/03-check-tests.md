# Action 03: check-tests

Goal: make sure the tests were not bent to fit the code. Production code that gets rewritten is normal; tests that get rewritten need a reason.

## Checks

- [ ] **No weakened assertion.** For every test file modified in a commit later than the one that created it, read the diff (`git log -p --follow <test file>`): an assertion removed, loosened (exact value to "not null"), or replaced by a broader matcher is a finding.
- [ ] **No deleted test** without a replacement covering the same behavior.
- [ ] **No skipped or disabled test** introduced in the range (`[Fact(Skip=...)]`, `[Ignore]`, `xit`, `xdescribe`, `it.skip`, `test.skip`, `fit`, `fdescribe`). Search the added lines: `git log -p <range> | grep -E '^\+.*(Skip|Ignore|xit|xdescribe|\.skip|fit\(|fdescribe)'`.
- [ ] **Tests cover the behaviors named in the commit messages and the plan slices.** A behavior announced but untested is a finding.
- [ ] **Suspicious first run.** A test added with trivially passing content (no assertion, `Assert.True(true)`, `expect(true)`) is a finding.
- [ ] **Run the suite** at the head of the range if the stack allows it, to back the "green" claim; report the result as evidence. A red suite at the head is a critical finding.

## Final summary

End with the mandatory summary of the review format. Add one line to **What works well** per layer that was cleanly closed (tests, code, single-layer commit): this is what the layered process is for, and it tells the author what to keep.
