# Review output format

Shared by `ng-review` and the `frontend-reviewer` agent.

## One block per finding

```
{🔴|🟠|🟡|🟢} **{Short title}**
Location: `{file:line, or component section / template}`
Problem: {what is wrong and why it matters}
Fix: {concrete, actionable suggestion}
Before: {exact excerpt from the reviewed file}
After: {corrected version, adapted to THIS file}
Docs: {angular.dev link if relevant, otherwise omit}
```

## Severity levels

| Level | Label      | When to use                                                       |
| ----- | ---------- | ----------------------------------------------------------------- |
| 🔴    | Critical   | Must fix: correctness bug, memory leak, security issue            |
| 🟠    | Major      | Should fix: significant performance or architecture problem       |
| 🟡    | Minor      | Low impact: naming, style, small improvement                      |
| 🟢    | Suggestion | Optional: modernization idea or future lead                       |

## Rules

- One block per finding: never group unrelated problems.
- `Location` may be omitted when the problem is structural.
- `Fix` is actionable, never "consider improving" or "think about refactoring".
- `Before` / `After` quote the real file, never invented examples.
- `Docs` only when the angular.dev reference directly supports the fix.
- Explain **why**, not only what to change.

## Mandatory final summary

```
---
**Score: {X}/10**

**Top 3 to fix:**
1. {most impactful finding, one line}
2. {second, one line}
3. {third, one line}

**What works well:**
- {a real strength, never skipped, even for weak files}
```

- The score reflects overall health, not only the number of problems.
- The top 3 must already appear as findings above: no new problem here.
- "What works well" is mandatory; if the file has no real strength, note what is at least correct.
