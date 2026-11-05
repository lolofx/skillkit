# Roadmap

Remaining work, in rough priority order.

## Before a public release

- [x] `LICENSE` added (MIT).
- [ ] Test the full dependency chain in a real Claude Code session: add the AIDD marketplace, install `skillkit-dotnet`, check that `aidd-dev` and `skillkit-tdd` are pulled in and load.
- [ ] Run the mod test suites (`skillkit-bodyguard`, `skillkit-gauge`, `skillkit-ctx`) with the Claude Code mod test runner; they were ported and adapted but not run after the port.
- [ ] Try the TDD hooks on pwsh 7 and with RTK enabled (the `.ps1` variants were smoke-tested on Windows PowerShell 5.1, the `.sh` variants on Linux).

## Content

- [ ] `plugins-report` in `skillkit-tools` (list installed plugins and their weight), rewritten without machine-specific paths.
- [ ] Angular: `angular-lint` and `storybook-stories` skills, driven by the project's own configuration.
- [ ] Backend: logging conventions in `dotnet-conventions` (structured logs, correlation).
- [ ] Optional plugin for reference corpora (DDD, hexagonal, .NET articles) that downloads or points to sources instead of redistributing them.

- [ ] `tdd-review`: bats-style smoke test for `skills/tdd-review/scripts/layer-map.sh` in CI (fixture repo with layered and mixed commits).
- [ ] Optional hook: deny a layered-TDD commit that touches several layers, using the layer paths of the project memory.

## Repo hygiene

- [ ] `CHANGELOG.md` per plugin.
- [x] CI (`.github/workflows/ci.yml`): `claude plugin validate` + `scripts/check-repo.sh` (repo conventions).
- [ ] Run the mod tests in CI (needs the Claude Code mod test runner).
- [ ] Plugin-level tests for the hooks (a bash smoke test for the `.sh` variants and a PowerShell one for the `.ps1` variants).
- [ ] Other agents later (Copilot, Codex): out of scope for now, Claude Code only.
