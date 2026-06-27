---
name: status
description: Answer "where are we now?" / "what's the progress?" / "what's left?" by reconciling every spec's tasks.md against the git history and the actual code. Use whenever the user asks about project status, what's done, what's in progress, or where to resume — especially at the start of a session after time away.
---

# status

Produces a trustworthy progress report across all features. The point: a markdown
checkbox can be stale (the agent may have forgotten to tick it), so this skill
**reconciles the plan against ground truth** — git commits and the code — rather
than trusting `tasks.md` alone.

## When to use

Any "where are we" style question: "where are we now?", "what's done?",
"what's still in progress?", "what's left?", "where do I resume?", "what's the
status of checkout?". Also run it automatically at the start of a session when
the user is returning to in-progress work.

## How to determine truth (do this, don't guess)

1. **List the features.** Read every `specs/*/` folder. Each is a feature.

2. **Read each `tasks.md`.** Note the waves and which tasks are checked.

3. **Reconcile against git — this is the key step.** The plan says what was
   intended; git says what actually happened. Check them against each other:
   ```bash
   git log --oneline -30
   git log --oneline -- apps/ packages/   # commits that touched code
   ```
   Each wave should correspond to a commit (atomic conventional commits, e.g.
   `feat(api): add products service`). If `tasks.md` says a task is done but no
   commit implements it — or a commit implements work the checklist still shows
   unchecked — the checklist has drifted. **Trust the code and commits over the
   checkbox**, and note the discrepancy.

4. **Spot-check the code when unsure.** Does the migration exist? Does the
   endpoint exist? Do the tests pass? Ground truth beats both the checklist and
   the commit message.

5. **Fix drift.** If `tasks.md` is out of date, update the checkboxes to match
   reality (and mention you did).

## Report format

Give the user a clear, scannable picture:

```
PROJECT STATUS

✅ Completed features (100%)
  - product-catalog — all 3 waves done (last commit: <hash> <date>)

🔨 In progress
  - cart — Wave 2 of 3 (API)
      done:  schema + shared types (Wave 1)
      doing: cart endpoints — 2 of 3 tasks committed
      next:  CartController tests, then Wave 3 (UI)

📋 Planned, not started
  - checkout — spec written, 0 waves done
  - admin    — spec written, 0 waves done

⚠️  Notes
  - cart/tasks.md showed CartController checked, but no commit implements it —
    corrected the checklist.

▶ To resume: finish cart Wave 2 (CartController + tests).
```

## Rules
- Reconcile against git/code; never report status from `tasks.md` alone.
- Be specific: name the feature, the wave number, the exact next task.
- If you corrected checklist drift, say so explicitly.
- If there are no specs yet, say the project hasn't started feature work and
  point to `plan-feature`.

## Output
A per-feature status report (done / in-progress-with-wave / not-started), any
drift you corrected, and a one-line "to resume, do X."
