# 3. Apply

For the approved numbers only:

1. Re-read each target right before editing. Keep unrelated content and the user's own changes.
2. Add the approved text, concise. Do not overwrite a file to create a skill; a new skill is a new folder.
3. If a target is a skillkit plugin file and the repo is not that plugin's repo, do not edit the installed copy under the plugin cache: propose the change as text for a PR on the plugin's repository, or work in its own worktree.
4. Verify: re-read the changed lines, check links and references still resolve.
5. Commit locally only when the project's instructions or the user allow it, one commit per logical change, only the approved changes. Never push.
6. Update the registry: `registry.sh status <slug> applied` for what was written; `registry.sh status <slug> rejected` for a number the user refused (so it is not proposed again). Numbers left undecided stay `candidate`.
7. Report what changed (paths), what was skipped, and what is left for the user.
