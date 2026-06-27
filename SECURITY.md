# SECURITY.md

This kit gives you a reasonable security baseline (argon2-hashed passwords,
hashed + rotating refresh tokens, auth-by-default routes, input validation via
DTOs). **A baseline is not an audit.** Before shipping anything that touches
authentication, payments, or user data, review it against this checklist — and
for anything high-stakes, get a human security review. The `security-scan` skill
helps, but does not replace human judgment.

## Before shipping auth / payment / user-data code

**Auth & sessions**

- Passwords hashed with a strong algorithm (argon2/bcrypt), never stored or
  logged in plaintext.
- Tokens: short-lived access tokens; refresh tokens hashed at rest and rotated on
  use; logout/revocation works.
- Every sensitive route is actually protected (not just intended to be) — verify
  with a test that an unauthenticated request gets 401.
- Authorization, not just authentication: a logged-in user can't act on another
  user's data (check ownership, not just "is logged in").

**Input & output**

- All input validated and typed at the boundary (DTOs); reject unexpected fields.
- No secret fields (`passwordHash`, tokens) ever returned in a response.
- Output that reaches a browser is safe from injection/XSS.
- Queries are parameterized (the ORM does this — don't hand-build SQL strings).

**Secrets & config**

- No secrets in the repo, in logs, or in client-side code. All via env vars.
- `.env` files are gitignored; `env.example` lists keys with placeholder values.
- Different secrets per environment; rotate if one may have leaked.

**Payments (if applicable)**

- Card data never touches your server — use a hosted/provider checkout.
- Verify payment via a signed server-side webhook before granting value; verify
  the webhook signature.
- Treat amounts as integer minor units; never trust a price sent from the client.

**Transport & headers**

- HTTPS in production; secure cookie flags where cookies are used.
- Sensible CORS (don't reflect arbitrary origins); basic security headers set.

**Dependencies & operations**

- No known-vulnerable dependencies (run an audit); keep them current
  (see DEPENDENCIES.md).
- Rate limiting on auth and other abusable endpoints (this is operational work
  outside the kit's defaults — add it before production).
- Errors don't leak stack traces or internal details to clients — enforced by the
  global exception filter (full detail logged server-side with a request id; the
  client gets only a safe message). Covered by a filter test.

## Reporting

For a real product, add a way to report vulnerabilities (a security contact or
policy) and a process for handling them.
