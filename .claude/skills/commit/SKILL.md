---
name: commit
description: Commit a completed, verified wave as one atomic, conventional commit. Use after each wave passes the verify gate, before starting the next. Keeps history bisectable and revertible — the foundation of safe incremental development.
---

# commit

Incremental development depends on clean git history: each wave is one atomic,
revertible commit with a message that explains *why*. This makes `git bisect`
work, makes reverting a bad wave a one-liner, and makes the changelog write
itself.

The repo enforces parts of this mechanically — a pre-commit hook formats and
lints staged files, a commit-msg hook requires Conventional Commits, and a
pre-push hook runs the full verify gate. This skill is how you work *with* those
gates instead of fighting them.

## When to commit

After a wave is implemented **and** the verify gate is green. One wave = one
commit. Don't batch multiple waves into a giant commit; don't commit half a wave.

## Steps

1. **Confirm the wave is green.** The pre-push hook will run `verify` anyway, but
   don't rely on it to catch a mess — run `bun run verify` yourself first.

2. **Stage only what belongs to this wave.** `git add` the specific files. Don't
   sweep in unrelated changes — atomic means one logical change per commit.

3. **Write a Conventional Commit message.** Format:
   ```
   <type>(<scope>): <subject>

   <body: what changed and why, not how>
   ```
   - **type**: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `ci`.
   - **scope**: one of `api`, `web`, `shared`, `config`, `deps`, `ci`, `docs`,
     `skills` (enforced by commitlint).
   - **subject**: imperative, lowercase, no period. "add billing service", not
     "Added billing service."
   - Example: `feat(api): add subscription creation endpoint`

4. **Let the hooks run.** pre-commit formats/lints staged files; commit-msg
   validates the message. If a hook rejects the commit, fix the cause — do not
   bypass with `--no-verify` except in a genuine emergency, and say so if you do.

5. **One commit per wave.** Then continue to the next wave (or `replan`).

## Rules
- Atomic: one logical change per commit. A reviewer should understand it from the
  diff alone.
- Never bypass hooks to push broken or unformatted code.
- The commit message explains *why* the change exists; the diff shows *how*.

## Output
One clean, conventional, verified commit per wave — a history you can bisect,
revert, and turn into a changelog.
