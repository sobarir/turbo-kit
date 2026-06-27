# DEPENDENCIES.md — Version Policy

This kit targets **current** dependency versions. AI agents tend to write
version numbers from training data, which lag reality — so the rule here is:
**never let the model pick a version from memory. Resolve it at install time.**

## The rule

When adding or upgrading a dependency, install with the `latest` tag so the
package manager resolves the real current version from the registry:

```bash
bun add next@latest react@latest
bun add -d typescript@latest
```

Never hand-write a version range into `package.json` from memory. If you must
write one, first check the real latest:

```bash
bun pm view <package> version     # or: npm view <package> version
```

## Checking and upgrading

Two scripts are wired at the repo root:

```bash
bun run deps:check     # list every dependency that's behind latest
bun run deps:upgrade   # bump all to latest in package.json, then install
```

`deps:check` runs `npm-check-updates` across all workspaces and shows what's
behind. `deps:upgrade` rewrites the ranges and reinstalls.

## The important caveat: latest ≠ blind upgrade

"Always latest" is the right default for a **new** project. It is NOT a license
to blind-bump majors in a working app. Major versions carry breaking changes.
This kit was itself migrated across several majors (Next 14→16, React 18→19,
NestJS 10→11, Prisma 5→7, TypeScript 5→6) and each required real code changes,
not just a version bump. For example:

- **Next 16** made request APIs (`cookies()`, `headers()`) async-only and
  Turbopack the default bundler.
- **Prisma 7** requires a driver adapter, moved the datasource URL to
  `prisma.config.ts`, and generates the client to `src/generated/prisma`
  instead of `node_modules`.
- **TypeScript 6** deprecated `baseUrl` (we set `ignoreDeprecations: "6.0"`).

## The upgrade workflow for an existing app

When asked to upgrade a framework major, the agent must:

1. **Check the real current version** (`bun pm view <pkg> version`) — never
   assume from memory.
2. **Read the migration guide** for that major. Web-search it; don't guess at
   breaking changes.
3. **Run the official codemod** where one exists
   (e.g. `bunx @next/codemod@latest upgrade latest`).
4. **Upgrade one major at a time** if jumping several versions
   (e.g. 14 → 15 → 16, not 14 → 16 directly).
5. **Verify**: `bun run check` then `bun run build`, and run the test suite.
6. **Never** declare an upgrade done without a green build.
