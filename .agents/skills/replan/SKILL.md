---
name: replan
description: Revise the plan between waves when implementation reveals something the original plan got wrong. Use whenever a wave teaches you that the contract, scope, or approach needs to change — before blindly continuing to the next wave. Incremental development is a spiral, not a straight line.
---

# replan

The step that makes the loop a spiral instead of a line. A plan is a hypothesis.
Implementing a wave is the experiment that tests it. When the experiment
contradicts the plan, **stop and replan** — don't push forward on a plan you now
know is wrong.

## When to trigger

After finishing a wave (and before starting the next), ask: did building this
change what the rest should look like? Trigger `replan` if:

- The contract in `packages/shared` turned out wrong once the API was real.
- A wave was bigger or smaller than estimated, so the remaining split is off.
- You discovered a dependency you didn't see at planning time.
- The user's feedback on a delivered wave changes the target.
- A simpler approach became obvious once you saw the code.

If none of these — the plan still holds — skip this and continue. Replanning
every wave by reflex is its own waste.

## Steps

1. **State what you learned.** One or two sentences: what did implementing the
   last wave reveal that the plan didn't anticipate?

2. **Assess the blast radius.** Does this change just the next wave, or several?
   Does it change the contract (and therefore both apps)?

3. **Revise the waves.** Update the remaining wave list (or `specs/{feature}/tasks.md`
   if a spec exists). Re-order, split, merge, add, or drop tasks as needed.

4. **Tell the user if scope or contract changed.** A contract change or a
   scope change is worth a quick confirmation, not a silent pivot. A small
   internal re-split doesn't need sign-off.

5. **Resume** the loop at `implement-feature` with the revised waves.

## Rules
- Replan *between* waves, not mid-wave — finish and verify the current wave first
  so you're revising from a green, known state.
- Don't use replanning to avoid finishing hard work. It's for genuine new
  information, not for wandering.

## Output
A revised wave list and a one-line note of what changed and why. Then continue.
