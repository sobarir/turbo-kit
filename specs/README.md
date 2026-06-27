# specs/

One folder per large feature, written by the `create-spec` skill:

```
specs/<feature>/
  requirements.md   # goal, scope, success criteria, out-of-scope
  tasks.md          # waves + tasks with [ ]/[x] checkboxes — the progress record
  manual-actions.md # steps only a human can do (env vars, external accounts, prod migrations)
```

**Commit this folder.** `tasks.md` is your cross-session "where are we" record;
ask the agent "where are we now?" to get a reconciled status (see the `status`
skill). Each wave is also one atomic git commit, so `git log` is the ground-truth
backstop if a checklist drifts.
