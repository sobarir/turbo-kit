---
name: implement-feature
description: Read a spec folder and implement it wave by wave with review gates. Use after create-spec has produced specs/{feature}/.
---

# implement-feature

Execute a spec produced by `create-spec`, one dependency wave at a time, running
the verify gate between waves. Step 3 of the loop (see WORKFLOW.md). Use the
`verify` skill for each wave's gate and `ship` to finalize.

## Steps

1. **Load the spec.** Read `specs/{feature}/requirements.md` and `tasks.md`.
   Restate the plan and the wave order back to the user.

2. **Surface manual actions early.** If `manual-actions.md` has steps that block
   a wave (env vars, external accounts, prod migrations), tell the user now.

3. **For each wave, in order:**
   a. Scaffold any new resources with `bunx nest g resource <name>`.
   b. Implement each task per `API-CONVENTIONS.md` — DTOs validated, logic in
      services, controllers thin, auth respected.
   c. Use sub-agents to implement independent tasks in the same wave in
      parallel where it helps; then reconcile.
   d. Write tests for every task using the `write-tests` skill (behavior, not
      tautologies; unit + e2e as appropriate).
   e. **Review gate:** run the `verify` skill (`bun run check`, `bun test`, and
      for DB/endpoint changes `bun run test:e2e`). If red, fix before continuing.
   f. **Commit the wave** as one atomic conventional commit (`commit` skill).
   g. **Update `specs/{feature}/tasks.md`** — tick every task this wave completed,
      and confirm the checklist now matches what was actually committed in step f.
      The checklist is the user's "where are we" record across sessions, so it
      must stay honest. Commit the update too.
   h. **Replan if needed** (`replan` skill) — did this wave change the plan for
      the rest? Revise the remaining waves before continuing.

4. **Final pass.** Hand off to the `ship` skill: final full gate, review,
   summary, and manual actions.

## Rules
- Never skip a review gate to move faster.
- Never start a wave whose dependencies haven't passed.
- Keep `tasks.md` updated so progress is resumable across sessions.
