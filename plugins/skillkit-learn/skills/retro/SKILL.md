---
name: retro
description: End-of-dev retrospective. Reads the session journal, the conversation and the branch history, finds demonstrated lessons (corrections, avoidable friction, approved approaches), and proposes numbered improvements to the skills, project memory or CLAUDE.md involved; applies only what the user approves. Use at the end of a dev, when the user asks what could be improved. Not for recording one fact (use memory), not for reviewing code (use aidd-dev 05-review).
disable-model-invocation: true
---

# /retro

Turn a finished dev into lasting improvements, with evidence. The invocation authorizes the review, **not** the edits.

## Rules

- Every lesson is grounded in an event: a journal line, a quoted exchange, a commit. No evidence, no lesson. Never infer approval from silence, never turn one task-specific choice into a general rule.
- Nothing is written before the user picks numbers. Never push, never merge.
- If nothing qualifies, say "no lasting lesson" and stop.
- No secrets or personal data in anything written.

## Steps

1. [Gather](actions/01-gather.md): journal, conversation, branch history.
2. [Propose](actions/02-propose.md): lessons, destinations, numbered table. Stop and wait.
3. [Apply](actions/03-apply.md): only the approved numbers, then verify.
