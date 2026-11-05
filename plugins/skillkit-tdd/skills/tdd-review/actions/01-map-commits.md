# Action 01: map-commits

Goal: a table of the branch, one row per commit, before judging anything.

1. Run the helper from the plugin: `skills/tdd-review/scripts/layer-map.sh <range> [layers-file]`. It prints, oldest first, `<sha> <layers> <test|notest> <subject>`.
2. If the project's folders do not match the default patterns (a row says `other` for files that clearly belong to a layer), write a layers file from the project memory and rerun. Do not guess a layer by eye for the whole branch.
3. Present the table: sha, layers touched, tests present, subject.
4. Note the files classified `other` and the commits with `none`: they are either out of scope (docs, build files) or a pattern gap to report.

Report: the table and the list of unclassified paths.
