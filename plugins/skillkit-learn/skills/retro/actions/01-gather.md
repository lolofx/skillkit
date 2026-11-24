# 1. Gather

1. Run from the project root:

   ```bash
   "${CLAUDE_PLUGIN_ROOT}/skills/retro/scripts/gather.sh"        # journal of the last 24h
   "${CLAUDE_PLUGIN_ROOT}/skills/retro/scripts/gather.sh" --all  # whole journal
   ```

   It prints the journal summary (skills used, failed tests, repeated failing commands, `note` lines), the lessons of the registry that are `DUE` or `INEFFECTIVE` (see 02), and the branch commits and diffstat.
2. Read the conversation for what the journal cannot see: corrections and approvals you did not `note`, instructions that were ambiguous or missing.
3. Signals worth a lesson:
   - a `correction` or `friction` note;
   - the same command failing or a test going FAIL several times in a row;
   - a skill used, then contradicted or worked around;
   - an approach the user **explicitly** approved and that was not obvious.
