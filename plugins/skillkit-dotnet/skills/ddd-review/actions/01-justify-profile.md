# Action 01: justify-profile

Goal: arbitrate the domain profile. This is the tie-breaker when the profile is undeclared or looks wrong.

Assess against the criteria of `ddd.md`:
- How many business rules? (state transitions, validations, calculations)
- Invariants to protect? (a value that must always satisfy a business constraint)
- Business logic reused by several use cases?
- States and transitions? (life cycles, statuses, progression)
- Value objects with their own validity rules?

## Verdict

- ✅ **Rich profile justified**: continue to action 02 with the full checklist.
- ⚠️ **Rich profile excessive**: explain why and propose the simplified structure (CQRS without a rich aggregate, i.e. the simple profile).
- 🔶 **Inconsistency** between declared profile and observed code: report it explicitly (for example "simple" declared but business invariants scattered across handlers).
- ❔ **Undeclared**: state the profile you infer and suggest recording it in the project memory.

State the verdict in plain words (justified / excessive / partially justified / inconsistent with the declaration) with 2-3 lines of justification.
