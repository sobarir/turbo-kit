---
name: review
description: Review changes before they ship. Use after implementing a feature or before opening a PR to catch convention violations, missing tests, and security issues.
---

# review

Self-review pass over the code you just wrote, against this kit's rules.

## Checklist

**Conventions (see API-CONVENTIONS.md)**
- [ ] New resources follow the module/controller/service/dto shape.
- [ ] Controllers are thin; all logic is in services.
- [ ] Every request body is a validated DTO. No raw `req.body` access.
- [ ] Responses returned as plain values (interceptor wraps them).
- [ ] Errors use NestJS HTTP exceptions, not custom shapes.

**Auth & security**
- [ ] New routes are protected by default, or explicitly `@Public()` with reason.
- [ ] Role-gated routes use `@Roles(...)`.
- [ ] No endpoint returns `passwordHash` or other secrets.
- [ ] No secret or raw token is logged or stored unhashed.

**Data**
- [ ] Schema changes have a generated migration (not `db push`).
- [ ] Multi-step writes use a Prisma transaction.

**Tests**
- [ ] Each new service method has a unit spec (happy path + error branches).
- [ ] Each new endpoint has e2e coverage including the auth path.

**Verify gate**
- [ ] `bun run check` passes (lint + typecheck).
- [ ] `bun test` passes.
- [ ] `bun run test:e2e` passes for DB/endpoint changes.
- [ ] `bun run build` succeeds.

## Reuse & duplication

- Does this introduce a function/component/type that duplicates one that already
  exists? If so, reuse the existing one or extract a shared version.
- Run `bun run dupes` (jscpd) — if it flags new copy-paste, extract the shared
  logic to the right home (`packages/shared`, `apps/web/src/lib`,
  `apps/api/src/common`) and have both callers use it.

## Output
List any failures with the file/line and the fix. If all pass, say so explicitly.
Then hand off to `security-scan` for anything auth- or data-sensitive.
