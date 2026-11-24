---
name: note
description: Log a correction, a friction or a validated approach from the current session into the session journal, with the user's own words as evidence. Use when the user corrects you, rejects an approach, or explicitly approves a non-obvious one, so the end-of-dev retro has evidence. Not for facts to remember (use the memory mechanism) and not for editing skills or rules (that is the retro's job).
---

# Note

Append one line to the session journal. Nothing else: no rule is written, no skill edited.

## When

- The user **corrects** you or rejects an approach.
- The user **explicitly approves** a non-obvious choice ("yes, keep it that way").
- A step caused **avoidable friction** (a skill instruction was ambiguous, a convention was missing).

Never from silence, and never for a typo or a cosmetic preference.

## How

Run from the project root (create the folder if needed; `.skillkit/` is git-ignored by its own `.gitignore`):

```bash
mkdir -p .skillkit/journal && [ -f .skillkit/.gitignore ] || printf '*\n' > .skillkit/.gitignore
jq -cn --arg ts "$(date -u +%Y-%m-%dT%H:%M:%SZ)" --arg kind "<correction|approval|friction>" \
  --arg what "<what happened, one sentence>" --arg quote "<the user's words, short>" \
  --arg skill "<skill or file involved, or empty>" \
  '{ts:$ts,type:"note",kind:$kind,what:$what,quote:$quote,skill:$skill}' \
  >> ".skillkit/journal/${CLAUDE_SESSION_ID:-manual}.jsonl"
```

Then say "noted" and continue the task. Do not quote secrets or personal data.
