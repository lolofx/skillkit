# Action 02: check-slices

Goal: verify the commit history follows the layered TDD contract. Use the table of action 01 and `git show --stat <sha>` for the details.

## Checks

- [ ] **One layer per commit.** A row with two layers (for example `application,domain`) is a finding, unless the extra layer is only a trivial rename forced by the main change (say so).
- [ ] **Dependency order.** Layers appear in the order Domain, Application, API / presentation, Infrastructure. An outer layer committed before the inner layer it depends on is a finding.
- [ ] **No backward edit.** After a commit touches layer N, a later commit touching a layer inside N must be a reopened slice: the message says so and the commit starts with new tests. Otherwise it is a patch from the outside.
- [ ] **Tests ship with the code.** Each commit that adds production code in a layer includes tests of that layer (`test` in the table). Production code with `notest` is acceptable only if the next commit of the same layer adds its tests; flag it, and flag it as major if no test of that behavior exists in the whole range.
- [ ] **Right kind of test per layer** (`tdd/references/layers.md`): Domain without mocks, Application with faked ports, API / presentation with the application layer faked, Infrastructure as integration tests. A business assertion in an API test, or a mock in a Domain test, points to logic in the wrong layer.
- [ ] **Commit message names the layer and the use case.**
- [ ] **Skipped layers are legitimate.** A step that obviously needs persistence but has no Infrastructure commit is a finding.

## How to look

- `git log --reverse --stat <range>` for the shape of each commit.
- `git show <sha> -- <test paths>` to confirm which tests came with which code.
- Do not run or change anything on the branch.

Report: one finding block per violation, with the sha as `Location`.
