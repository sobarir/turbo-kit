# create-turbokit-app

Scaffold a new full-stack app from **turbo-kit** (NestJS + Next.js + Turborepo)
with one command.

## Usage

```bash
# interactive
npx create-turbokit-app@latest

# with a name
npx create-turbokit-app@latest my-app

# non-interactive (CI/scripts)
npx create-turbokit-app@latest my-app --yes
```

Also works with `bunx create-turbokit-app`, `pnpm create turbokit-app`, or
`yarn create turbokit-app`.

### Flags

| Flag           | Effect                           |
| -------------- | -------------------------------- |
| `--yes`, `-y`  | Accept all defaults; no prompts. |
| `--no-install` | Skip `bun install`.              |
| `--no-git`     | Skip `git init`.                 |

## What it does

1. Copies the kit into a new directory.
2. Sets your project name in the root `package.json`.
3. Generates **fresh JWT secrets** in `apps/api/.env` (never ships working
   placeholder secrets) and names the dev database after your project.
4. Restores `.gitignore` (npm strips it from published packages).
5. Optionally runs `git init` and `bun install`.

Then:

```bash
cd my-app
bun install                                   # if you skipped it
cd apps/api && docker compose up -d           # local Postgres
bun run db:migrate && bun run db:seed && cd ../..
bun run dev                                    # API :3000, web :3001
```

See the generated project's `README.md`, `SETUP.md`, and `ENVIRONMENT.md`.

## Maintainers — how the template works

The CLI ships a clean snapshot of the kit in `template/`, generated at publish
time by `prepare-template.mjs` (excludes `node_modules`, `.git`, build output,
real `.env` files, and the CLI package itself). `template/` is gitignored and
rebuilt on `prepublishOnly`, so it never drifts from the kit and is never
committed.

To publish: from the repo root the template is the kit itself; `bun run build`
in this package runs `prepare-template.mjs` then compiles the CLI, then
`npm publish`.
