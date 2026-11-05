# Review output format

Shared by `file-review`, `csharp-quality`, `ddd-review` and the `backend-reviewer` agent.

## One block per finding

```
{🔴|🟠|🟡|🟢} **{Short title}**
Location: `{file:line, or class / method}`
Problem: {what is wrong and why it matters}
Fix: {concrete, actionable suggestion}
Before: {exact excerpt from the reviewed file}
After: {corrected version, adapted to THIS file}
```

`Before` / `After` are for file-level reviews; the module-level `ddd-review` uses the block without them.

## Severity levels

| Level | Label      | When to use                                                                    |
| ----- | ---------- | ------------------------------------------------------------------------------ |
| 🔴    | Critical   | Must fix: correctness bug, security, data loss or deadlock / resource leak risk |
| 🟠    | Major      | Should fix: significant design or maintainability problem                      |
| 🟡    | Minor      | Low impact: naming, style, small structural improvement                        |
| 🟢    | Suggestion | Optional: modernization idea or future lead                                    |

## Rules

- One block per finding: never group unrelated problems.
- `Location` may be omitted when the problem is structural (no single line).
- `Fix` is actionable, never "consider improving".
- `Before` / `After` quote the real file, never invented examples.
- Explain **why** a finding is a problem, not only how to fix it.

## Mandatory final summary

```
---
**Score: {X}/10**

**Top 3 to fix:**
1. {most impactful finding, one line}
2. {second, one line}
3. {third, one line}

**What works well:**
- {a real strength, never omitted, even for a weak file}
```

- The score reflects overall health, not the number of findings.
- The top 3 repeats findings already listed: no new problem in the summary.
- "What works well" is mandatory; failing a strength, note what is at least correct.
- A module-level review (`ddd-review`) replaces the score by per-layer scores `X/5`.
