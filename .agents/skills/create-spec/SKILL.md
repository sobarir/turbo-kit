---
name: create-spec
description: Turn a planning conversation into a structured spec folder for a large or multi-session feature. Use when a feature spans many files/modules, needs parallel work, or won't fit in one session.
---

# create-spec

Convert an agreed plan into `specs/{feature}/` so implementation can run in
reviewable waves. Use this only for large features; small changes skip it.

Comes after `plan-feature` (which clarifies scope) and uses `split-work` to
shape the waves. See WORKFLOW.md for the full loop.

## When to use
- Feature spans many modules or files
- Multiple agents/sub-agents should work in parallel
- Implementation likely exceeds one session
- You want a written record + resumable progress

## Steps

1. **Confirm the plan.** Make sure goal, scope, constraints, and success
   criteria are explicit. Ask questions before writing anything.

2. **Create the folder** `specs/{feature}/` with:
   - `requirements.md` — goal, user stories, success criteria, out-of-scope.
   - `tasks.md` — numbered tasks grouped into dependency **waves** (tasks in a
     wave can run in parallel; later waves depend on earlier ones).
   - `manual-actions.md` — steps a human must do (e.g. set an env var, create a
     payment-provider account, run a migration on prod).

3. **Express tasks in NestJS terms.** Each task names the module/controller/
   service/DTO it touches and its test. Example:
   > Wave 2, Task 4: Add `BillingService.createSubscription`. Inject Prisma +
   > AiService. DTO: `CreateSubscriptionDto`. Tests: unit (mock Prisma) + e2e
   > for `POST /api/billing/subscriptions`.

4. **Map dependencies.** A wave starts only when the prior wave's review gate
   passes (`bun run check && bun test` green).

5. **Stop.** Do not implement yet. Hand off to the `implement-feature` skill.

## Output
A `specs/{feature}/` folder the user can review before any code is written.
