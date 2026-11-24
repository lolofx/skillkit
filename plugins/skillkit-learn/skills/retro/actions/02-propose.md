# 2. Propose

## Record, then filter

Record every lesson found in the registry, even those you will not propose yet (it is how recurrence is counted across sessions):

```bash
"${CLAUDE_PLUGIN_ROOT}/skills/retro/scripts/registry.sh" record <slug> <target> "<lesson>" "<evidence>" [explicit]
"${CLAUDE_PLUGIN_ROOT}/skills/retro/scripts/registry.sh" due
```

`explicit` = the user themselves corrected or approved (a `correction` or `approval` note, or their words in the conversation). Reuse an existing slug (see `registry.sh list`) when it is the same lesson: that adds an occurrence.

Propose only what `due` prints: a candidate seen **at least twice**, or an **explicit** one. A single inferred friction stays recorded and is mentioned in one line ("noted, not proposed yet"). Never re-propose a `rejected` lesson. An `INEFFECTIVE` one (applied, then recurred) means the written rule did not work: propose rewording or moving it, not adding another rule.

## Destination

For each lesson to propose find the **destination**, in this order:

1. The **skill, agent or action file** that caused or would have prevented it (from `skill-used` events or the note's `skill` field): read it first.
2. The **project memory** (`aidd_docs/memory/`) for a project fact (stack, convention, domain).
3. The project or user **CLAUDE.md** for a stable process rule.
4. A **new skill** only for a recurring, specific workflow with no home.

Read the applicable instruction files and the candidate target. If the lesson is already covered, drop it. If a target is unreadable, say so instead of claiming it was checked.

Show the user, in their language, before touching anything:

| # | Lesson | Evidence | Target file | Proposed change |
|---|--------|----------|-------------|-----------------|

- Evidence = the journal line, the quote or the commit that supports it.
- Proposed change = the exact sentence (one to three) and where it goes.
- Order by value: repeated failures first, one-off preferences last (or drop them).

Ask which numbers to apply (all, some, none). **Stop and wait.**
