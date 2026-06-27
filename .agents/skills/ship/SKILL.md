---
name: ship
description: Finalize a completed feature for delivery. Use as the last step of the incremental loop, after all waves are implemented, verified, and committed — to do a final full verification, summarize what changed, surface manual actions and rollback steps, and prepare a PR description. Trigger when the user says a feature is done or asks to "ship", "wrap up", "open a PR", or "finalize".
---

# ship

The final step: plan → split → implement → verify → commit → **ship**. Turns
finished, verified, committed work into a clean, safe handoff.

## Steps

1. **Final full verification.** Run the complete gate from a clean state, even if
   each wave passed:
   ```bash
   bun run verify
   ```
   For DB/endpoint changes, also `cd apps/api && bun run test:e2e`. Never ship red.

2. **Run the review passes.** Invoke `review` (conventions/quality) and
   `security-scan` if the feature touched auth, user data, file uploads, or
   external requests.

3. **Confirm history is clean.** Each wave should be its own atomic, conventional
   commit (see the `commit` skill). The PR diff should read as a coherent story.
   If commits are messy, offer to tidy them before opening the PR.

4. **Confirm the spec is complete and honest.** If `specs/{feature}/` exists,
   reconcile `tasks.md` against `git log` (use the `status` skill's method): every
   task marked done must have a real commit behind it, and every commit's work
   must be reflected in the checklist. Mark all waves/tasks done, fix any drift,
   and note anything intentionally deferred.

5. **Surface manual actions AND rollback.** List what the user must do that code
   can't, and how to undo it if it goes wrong:
   - Env vars to set; external accounts/secrets to create or rotate.
   - Migrations to run on prod (`bunx prisma migrate deploy`) — and the rollback
     plan if the migration is destructive (backup first; note the down path).
   - Feature-flag or staged-rollout notes if the change is risky.
   - What to watch after deploy (logs, error rates) to know it's healthy.

6. **Write the handoff summary** (PR body / final message):
   - **What changed** — 1-2 sentence feature summary.
   - **Scope** — which apps/packages (api / web / shared) were touched.
   - **Contract changes** — new/changed `packages/shared` types or endpoints.
   - **Migrations** — schema changes and the migration name.
   - **Tests** — what was added and what behavior they defend.
   - **Manual actions & rollback** — from step 5.
   - **Deferred** — anything explicitly left for later.

## Rules
- Never ship with a red gate or a silently-required manual action.
- A destructive migration without a stated rollback is not ready to ship.
- Keep the summary factual and short — it's a handoff, not marketing.

## Output
A green final gate, clean history, review passes done, and a handoff summary with
manual actions and rollback. The feature is ready to merge and deploy.
