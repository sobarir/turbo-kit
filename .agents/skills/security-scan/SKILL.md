---
name: security-scan
description: Scan for common API security issues before shipping. Use whenever a change touches auth, user data, file uploads, external requests, or database queries.
---

# security-scan

A focused security pass for this API kit. Run it on any auth- or data-touching
change. This is not a substitute for a real audit, but it catches the common
mistakes that matter most for a JWT-auth API.

## What to check

**Authentication / authorization**
- Every new route is covered by the global guard or intentionally `@Public()`.
- No `@Public()` route exposes user-specific or admin data.
- Role checks (`@Roles`) are present where privilege matters.
- Object-level authorization: a user can't read/modify another user's records by
  passing a different `:id`. Check ownership in the service.

**Secrets & tokens**
- Passwords hashed with argon2; never compared in plaintext.
- Refresh tokens stored only as hashes; rotated on use.
- No secret, password, or token written to logs.
- All secrets come from validated env (`src/config/env.validation.ts`), never
  hardcoded.

**Input handling**
- Every input is a validated DTO; `whitelist` + `forbidNonWhitelisted` on.
- No raw string interpolation into queries (Prisma parameterizes — don't bypass
  it with unsafe `$queryRawUnsafe`).
- File uploads (if added) validate type/size and never trust the client filename.

**External requests (AI / webhooks)**
- Outbound calls (e.g. AiService) have error handling and don't leak the API key.
- Webhook endpoints verify signatures before trusting the payload.

**Data exposure**
- Endpoints select explicit fields; never return whole user rows with secrets.
- Error responses don't leak stack traces or internal details in production.

## Output
Report each finding as: severity (high/med/low), file/line, and the fix.
If clean, state that explicitly. Re-run after fixes.
