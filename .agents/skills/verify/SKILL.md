---
name: verify
description: Run the full quality gate and fix anything red. Use after every wave of implementation, before committing, and before declaring any feature done. This is the non-negotiable, mechanically-enforced checkpoint in the incremental loop.
---

# verify

The quality gate of the incremental loop. Implementation is not "done" until this
passes. Run it after each wave — catching a break early is cheap.

This gate is **enforced mechanically**, not just by instruction:
- `scripts/verify.sh` is the single definition of "green".
- The **pre-push git hook** runs it automatically before code leaves the machine.
- **CI** runs the same steps on every PR.

So the gate isn't a suggestion you might skip — it's wired into git and CI. This
skill is how you run it deliberately during development, before you hit those.

## The gate

From the repo root:

```bash
bun run verify       # runs scripts/verify.sh: format, lint, typecheck, test, build
```

For database or endpoint changes also run the API e2e suite:

```bash
cd apps/api && bun run test:e2e   # needs the test DB up
```

## Rules

- **Red gate = not done.** If any step fails, fix it and re-run the whole gate.
  Never move to the next wave or report success with a failing check.
- **Don't suppress to pass.** Fixing the code is the job. No `eslint-disable`,
  `@ts-ignore`, skipped test, or `--no-verify` push to force green without a
  documented, justified reason.
- **Coverage is a floor.** CI enforces a minimum coverage threshold, but a high
  number with tautological tests is still worthless — see the `write-tests`
  skill. Meaningful behavior tests matter more than the percentage.
- **Reproduce, then fix.** For a failing test, understand why before changing
  code. Don't edit the test to match broken behavior.
- **Prisma client missing?** If tests fail with
  `Cannot find module '../generated/prisma/client'`, run
  `cd apps/api && bunx prisma generate` first (see SETUP.md).

## Output
Either "gate green" — or a list of what failed and what you changed to fix it,
then a re-run confirming green.
