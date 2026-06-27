# WORKFLOW.md — Incremental Development Loop

This kit ships a complete agentic workflow for building features incrementally —
designed so the parts that _can_ be enforced mechanically are, and only judgment
is left to instructions.

## The loop

```
 plan-feature → split-work → ┌─ implement-feature ─┐ → ship
                             │   per wave:          │
       (create-spec for      │   write-tests        │
        large features)      │   verify  ◄── gate   │
                             │   commit             │
                             │   replan? ───────────┘
                             └──────────────────────┘
                                       │
                              review / security-scan
```

Each wave: implement → **write real tests** → **verify (gate)** → **commit** →
**replan if the wave changed the plan** → next wave. Then `ship`.

## The skills

| Skill                      | Step         | What it does                                                                       |
| -------------------------- | ------------ | ---------------------------------------------------------------------------------- |
| `plan-feature`             | Plan         | Clarify scope, ask questions, pull current docs (Context7), decide spec-vs-direct. |
| `create-spec`              | Plan (large) | Write `specs/{feature}/` with requirements, waves, manual actions.                 |
| `split-work`               | Split        | Break the plan into ordered, parallelizable waves that each fit context.           |
| `implement-feature`        | Build        | Build wave by wave, coordinating sub-agents, with a gate per wave.                 |
| `write-tests`              | Build        | Write behavior tests, not tautologies. Avoid the false-confidence trap.            |
| `verify`                   | Gate         | Run `scripts/verify.sh` — format, lint, typecheck, test, build. Red = not done.    |
| `commit`                   | Build        | One atomic, conventional commit per verified wave.                                 |
| `replan`                   | Build        | Revise the remaining waves when a wave teaches you the plan was wrong.             |
| `review` / `security-scan` | Review       | Convention check; security check for auth/data code.                               |
| `ship`                     | Ship         | Final gate, clean history, manual actions + rollback, PR summary.                  |

## What's enforced mechanically (not just instructed)

Instructions can be skipped; these cannot:

- **Pre-commit hook** (Husky + lint-staged) — formats and lint-fixes staged files
  on every commit. Unformatted/lint-broken code can't be committed.
- **commit-msg hook** (commitlint) — rejects non-Conventional-Commit messages, so
  history stays atomic and machine-readable.
- **Pre-push hook** — runs the full `scripts/verify.sh` gate before code leaves the
  machine. A red gate can't be pushed (short of `--no-verify`).
- **CI** — runs the same gate plus a **coverage floor** and a **test-presence**
  check (every service must have a spec) on every PR, and lints PR commit
  messages. The branch can't merge red.

`scripts/verify.sh` is the single source of truth for "green" — the pre-push hook,
CI, and the `verify` skill all call it, so they can't drift.

## The core principles

**Mechanical over aspirational.** Where a rule can be a git hook or CI check, it
is one. Prose is reserved for judgment (scoping, test design, replanning) that
can't be automated.

**Incremental, verified, committed.** Work ships in small waves. Each wave is
implemented, tested, verified, and committed before the next. The codebase is
never broken for long; every wave is a revertible commit.

**The loop is a spiral.** `replan` is a first-class step. A plan is a hypothesis;
each wave tests it; when a wave disproves it, you revise before continuing.

**Tests must defend behavior.** A green suite of tautological tests is worse than
none — it's false confidence. `write-tests` and the CI coverage floor guard against
it, though no automation fully replaces judgment here.

**Vertical slices.** Build one feature end-to-end (contract → API → UI) before
starting the next — never all-backend-then-all-frontend. This is the default for
all feature work, stated in CLAUDE.md and AGENTS.md so it governs every feature.

**Shared-first in this monorepo.** Contract types in `packages/shared` come first;
both apps depend on them. Typical wave order: shared & schema -> API -> web -> polish.

**Current docs, current versions.** `plan-feature` pulls live docs via Context7;
DEPENDENCIES.md keeps packages current. Code against the real API, not memory.

## Resuming after time away

Progress is durable: every large feature has a `specs/{feature}/` folder with a
`tasks.md` checklist, and every wave is one atomic commit. Coming back later:

> Where are we now?

The agent runs the `status` skill — it reads every spec, reconciles the
checklists against `git log` (so stale checkboxes get caught and corrected), and
reports which features are 100% done, which are in progress and at which wave,
and what to do next. Commit the `specs/` folder so this record travels with the
repo.

## How to drive it (as a user)

1. Open the repo in your coding agent (Claude Code / Cursor / Codex).
2. Describe what you want to build, in plain language.
3. The agent runs `plan-feature` — answer its clarifying questions, confirm the plan.
4. It splits into waves and implements them one at a time: test -> verify -> commit,
   replanning if a wave changes the picture.
5. It ships: final gate, review, PR summary, manual actions and rollback for you.

The hooks and CI enforce the gates whether or not the agent is diligent. The skills
trigger from their descriptions — no slash commands. You can invoke one explicitly,
e.g. "use the replan skill".

## Honest limits

- Skills are instructions; the agent may not follow them perfectly. The **hooks and
  CI** are the real backstop — that's why the gate lives there, not only in prose.
- The coverage floor stops _zero_ meaningful tests, not _bad_ ones. Test quality
  still needs a human eye on the diff.
- `--no-verify` can bypass local hooks. CI cannot be bypassed on protected branches —
  configure branch protection in your repo settings to make CI required.
