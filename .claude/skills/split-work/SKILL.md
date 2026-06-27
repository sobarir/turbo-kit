---
name: split-work
description: Break an approved plan or spec into incremental, parallelizable chunks ("waves") that each fit in context and can be verified independently. Use after plan-feature or create-spec, when the work is too big to implement in one pass. Also use when an agent's context is filling up and the remaining work needs to be partitioned.
---

# split-work

Step 2 of the loop. Turns a plan into ordered **waves** of small tasks. The point
is incremental delivery: each wave is implemented, verified, and committed before
the next begins, so the codebase is never broken for long and progress is
resumable across sessions.

## Principles

- **Vertical slices.** Build one feature end-to-end (contract → API → UI) before
  the next. Don't build all-backend then all-frontend.

- **A wave is a set of tasks that can be done in parallel** because they don't
  depend on each other. Tasks in wave N may depend on wave N-1's output.
- **Each task fits in context** — roughly one module, one component, or one
  endpoint plus its test. If a task is too big to hold in your head, split it.
- **Each wave ends at a green gate** (`bun run check && bun test`). A wave that
  can't be verified is too big or wrongly scoped.
- **Shared-first ordering.** In this monorepo, contract types in
  `packages/shared` almost always belong in wave 1, because both the API and web
  depend on them.

## Steps

1. **List every task** the plan implies. Be concrete: name the file/module and
   its test. "Add billing" is not a task; "Add `BillingService.createSubscription`
   + unit test" is.

2. **Map dependencies.** Which tasks need another task done first? Draw the
   ordering. Independent tasks go in the same wave.

3. **Group into waves.** A typical shape for a full-stack feature:
   - **Wave 1 — Contract & data:** shared types, Prisma schema + migration.
   - **Wave 2 — API:** DTOs, service logic, controller, guards, tests.
   - **Wave 3 — Web:** API client method, UI (shadcn components), route guard, tests.
   - **Wave 4 — Polish:** edge cases, error states, docs.

4. **Mark parallelizable tasks.** Within a wave, note which can run as sub-agents
   in parallel (e.g. two independent API endpoints) and which must be sequential.

5. **Record it.** If a spec exists, write the waves into `specs/{feature}/tasks.md`.
   Otherwise keep the wave list in your working plan and report it to the user.

## Output
An ordered list of waves, each a small set of verifiable tasks with dependencies
noted. Hand off to `implement-feature` (spec) or implement wave-by-wave directly.
