---
name: write-e2e-tests
description: Write reliable end-to-end browser tests with Playwright for full user flows (login, checkout, multi-step journeys). Use when adding or changing a flow that spans pages and the real API — and read this before writing E2E, because flaky E2E tests are worse than none. For single-component behavior, use component tests (Vitest + RTL) instead; this is for whole-flow, real-browser testing.
---

# write-e2e-tests

End-to-end tests launch a real browser against the running app + API and verify
complete user journeys. They catch integration bugs component tests can't:
routing, the real API contract, auth redirects, and multi-step flows. They're
also slower and easier to make flaky — so they live in a **separate CI job**
(`.github/workflows/e2e.yml`), not the per-commit verify gate.

## When to write an E2E test (and when not to)

- **Do** write E2E for critical multi-step flows: sign-up/login, checkout, any
  journey where several pages and the API must work together. For an e-commerce
  app, the checkout flow is the single most valuable E2E test.
- **Don't** use E2E to test component logic or every edge case — that's what
  component tests (Vitest + RTL, `*.test.tsx`) are for, and they're 100x faster.
  Keep E2E to a handful of high-value happy paths plus their key failure.
- Rule of thumb: a few E2E tests covering the money paths, many component tests
  covering the details.

## The cardinal rule: no flaky tests

A flaky E2E test (passes/fails randomly) is worse than no test — it trains
everyone to ignore red. Avoid the usual causes:

- **Never use fixed `waitForTimeout`/sleeps.** Wait for *conditions*, not time.
  Playwright auto-waits on web-first assertions — use them.
- **Assert on user-visible state**, then proceed: `await expect(page).toHaveURL(...)`,
  `await expect(locator).toBeVisible()`. These retry until true or time out.
- **Select like a user:** `getByRole`, `getByLabel`, `getByText` — not brittle CSS
  selectors or test-ids unless nothing else works.
- **Each test is independent and self-seeding.** Don't depend on another test
  having run first, or on hidden state. Use the seeded account or create the data
  the test needs.

## Steps

1. **Pick the flow** and the seeded/known data it needs (see
   `apps/api/prisma/seed.ts` — e.g. `admin@example.com` / `Password123!`).
2. **Write it in `apps/web/e2e/<flow>.spec.ts`** following `e2e/auth.spec.ts` as
   the reference.
3. **Drive the UI as a user**: `page.goto`, `getByLabel(...).fill(...)`,
   `getByRole('button', { name: ... }).click()`.
4. **Assert with web-first assertions**: landed on the right URL, the expected
   content is visible. Cover the **failure path** too (e.g. wrong password shows
   an error and stays put), not just success.
5. **Run locally**: `cd apps/web && bun run test:e2e` (it starts the dev server
   for you). Use `bun run test:e2e:ui` to watch/debug. Confirm it passes
   repeatedly — run it 3x; if it isn't stable, fix the test, don't add retries.

## What stays out of the fast gate
E2E is intentionally not in `scripts/verify.sh`. The per-commit/pre-push gate
stays fast and deterministic; E2E runs in its own CI job where slowness is fine.

## Output
A small, stable E2E spec for the flow (happy path + key failure), passing
locally and in the E2E CI job, that drives the UI like a real user and waits on
conditions rather than time.
