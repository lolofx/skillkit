# Action 04: commit

Goal: one commit that closes the layer, so the next layer starts from a clean, green base.

1. Run the **full suite** one last time, at this moment. It must be green (`references/commit-gate.md`). For the Infrastructure layer this includes the integration tests.
2. Check the diff contains **only this layer** (tests and production code). A file from another layer in the diff means the slice leaked: split it or revert the stray change.
3. Update what the slice impacts: the plan's status tracking and any doc touched by the change.
4. Commit with `aidd-vcs:01-commit` (or a conventional commit by hand). The message names the layer and the use case, for example `feat(orders): reject empty order name - domain`, `feat(orders): create order handler - application`.
5. Do not push or open a pull request here unless asked.

Report: the commit hash and title, the suite result. Then go back to `01-red` for the next slice, or finish with the output described in `SKILL.md`.
