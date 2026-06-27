---
name: plan-feature
description: The entry point for any non-trivial feature. Use BEFORE writing code to clarify scope, ask questions, and decide whether the work needs a full spec or can go straight to implementation. Trigger when the user describes something to build ("add billing", "build a comments system") rather than a one-line fix.
---

# plan-feature

This is step 1 of the incremental development loop:
**plan → split → implement → verify → ship.** Never skip straight to code on a
feature of any size. A few minutes of planning prevents a session of rework.

## Steps

1. **Restate the goal in one sentence.** Confirm you understood what the user
   wants. If you can't state it crisply, you don't understand it yet — ask.

2. **Clarify before assuming.** Ask the user about anything ambiguous —
   one focused round of questions, not twenty. Cover:
   - Scope: what's in, what's explicitly out (for now).
   - Data: what models/fields change (this is a monorepo — contract types live
     in `packages/shared`).
   - Auth: who can do this? public, authenticated, admin-only?
   - UI: does this need frontend, backend, or both?
   - Success criteria: how do we know it's done and working?
   If the user gave a detailed brief already, don't re-ask — proceed.

3. **Check current docs.** For any framework API you'll touch (Next.js, NestJS,
   Prisma, Tailwind, shadcn), pull current docs via **Context7** so you plan
   against the real API, not memory. See the version policy in DEPENDENCIES.md.

4. **Survey what already exists.** Before planning new code, check what the
   codebase already has that this feature can reuse — existing types in
   `packages/shared`, helpers in `apps/web/src/lib` or `apps/api/src/common`,
   shadcn components, and services. Plan to extend/reuse them, not duplicate them.

5. **Size the work and pick a path:**
   - **Small** (one module/endpoint, a few files, one session): skip the spec.
     State a short inline plan and move to implementation.
   - **Large** (many files, spans both apps, multiple sessions, risky, or needs
     parallel work): hand off to the `create-spec` skill to write
     `specs/{feature}/`.

5. **Get explicit confirmation** of the plan before any code is written. State
   the goal, scope, the API/web split, and success criteria. Wait for the user
   to confirm.

## Output
A confirmed plan. Then either go straight to implementation (small) or invoke
`create-spec` (large). Do not write feature code until the plan is confirmed.
