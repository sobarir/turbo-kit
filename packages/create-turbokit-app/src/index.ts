#!/usr/bin/env node
import { existsSync } from 'node:fs';
import {
  cp,
  mkdir,
  readFile,
  writeFile,
  readdir,
  rename,
} from 'node:fs/promises';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import prompts from 'prompts';
import pc from 'picocolors';

const __dirname = dirname(fileURLToPath(import.meta.url));
// The template ships alongside the built CLI (../template). It is a clean
// snapshot of turbo-kit with no node_modules, .git, build output, or real env.
const TEMPLATE_DIR = resolve(__dirname, '..', 'template');

// Files in the template that must be renamed on the way out (npm strips
// .gitignore from published packages, so we ship it as gitignore).
const RENAME_ON_COPY: Record<string, string> = {
  gitignore: '.gitignore',
  'npmrc.template': '.npmrc',
};

function genSecret(): string {
  return randomBytes(32).toString('hex');
}

function isValidName(name: string): boolean {
  // npm package name rules, loosely: lowercase, url-safe, no spaces.
  return /^[a-z0-9][a-z0-9._-]*$/.test(name);
}

async function main() {
  console.log();
  console.log(pc.bold(pc.cyan('  create-turbokit-app')));
  console.log(pc.dim('  Full-stack starter: NestJS + Next.js + Turborepo'));
  console.log();

  const argName =
    process.argv[2] && !process.argv[2].startsWith('-')
      ? process.argv[2]
      : undefined;
  // Non-interactive mode for CI/scripts: --yes accepts all defaults,
  // --no-install / --no-git opt out of those steps.
  const flags = process.argv.slice(2);
  const yes = flags.includes('--yes') || flags.includes('-y');
  const noInstall = flags.includes('--no-install');
  const noGit = flags.includes('--no-git');

  const responses = yes
    ? {
        name: argName ?? 'my-turbokit-app',
        installDeps: !noInstall,
        initGit: !noGit,
      }
    : await prompts(
        [
          {
            type: argName ? null : 'text',
            name: 'name',
            message: 'Project name:',
            initial: 'my-turbokit-app',
            validate: (v: string) =>
              isValidName(v) || 'Use lowercase letters, numbers, dashes.',
          },
          {
            type: 'confirm',
            name: 'installDeps',
            message: 'Install dependencies now (bun install)?',
            initial: true,
          },
          {
            type: 'confirm',
            name: 'initGit',
            message: 'Initialize a git repository?',
            initial: true,
          },
        ],
        {
          onCancel: () => {
            console.log(pc.red('\n  Cancelled.'));
            process.exit(1);
          },
        },
      );

  const projectName: string = argName ?? responses.name;
  if (!isValidName(projectName)) {
    console.log(
      pc.red(`\n  Invalid project name "${projectName}".`) +
        ' Use lowercase letters, numbers, dashes.',
    );
    process.exit(1);
  }

  const targetDir = resolve(process.cwd(), projectName);

  if (existsSync(targetDir)) {
    const { overwrite } = await prompts({
      type: 'confirm',
      name: 'overwrite',
      message: `Directory "${projectName}" already exists. Continue anyway?`,
      initial: false,
    });
    if (!overwrite) {
      console.log(pc.red('\n  Aborted.'));
      process.exit(1);
    }
  }

  if (!existsSync(TEMPLATE_DIR)) {
    console.log(
      pc.red('\n  Template not found.') +
        ` Expected at ${TEMPLATE_DIR}. Reinstall create-turbokit-app.`,
    );
    process.exit(1);
  }

  console.log();
  console.log(pc.dim(`  Scaffolding into ${targetDir} ...`));

  // 1. Copy the template.
  await mkdir(targetDir, { recursive: true });
  await cp(TEMPLATE_DIR, targetDir, { recursive: true });

  // 2. Rename files that npm mangles (gitignore -> .gitignore, etc.).
  for (const [from, to] of Object.entries(RENAME_ON_COPY)) {
    const src = join(targetDir, from);
    if (existsSync(src)) await rename(src, join(targetDir, to));
  }

  // 3. Set the project name in the root package.json.
  await patchJson(join(targetDir, 'package.json'), (pkg) => {
    pkg.name = projectName;
    return pkg;
  });

  // 4. Generate real env files with fresh secrets (never ship placeholder
  //    secrets as working defaults).
  await writeEnv(targetDir, projectName);

  // 5. Optionally git init.
  if (responses.initGit) {
    runQuiet('git', ['init', '-q'], targetDir);
    runQuiet('git', ['add', '-A'], targetDir);
    // Commit is best-effort: needs user.name/email configured.
    runQuiet(
      'git',
      ['commit', '-q', '-m', 'chore: initial commit from turbo-kit'],
      targetDir,
    );
  }

  // 6. Optionally install deps.
  if (responses.installDeps) {
    console.log(pc.dim('  Installing dependencies with bun ...'));
    const ok = runInherit('bun', ['install'], targetDir);
    if (!ok) {
      console.log(
        pc.yellow(
          '  bun install did not complete (is Bun installed?). Run it yourself later.',
        ),
      );
    }
  }

  printNextSteps(projectName, responses.installDeps);
}

async function patchJson(
  path: string,
  fn: (json: Record<string, unknown>) => Record<string, unknown>,
) {
  const raw = await readFile(path, 'utf8');
  const json = JSON.parse(raw) as Record<string, unknown>;
  const next = fn(json);
  await writeFile(path, JSON.stringify(next, null, 2) + '\n');
}

async function writeEnv(targetDir: string, projectName: string) {
  // API env: copy example, then fill DB name + fresh JWT secrets.
  const apiExample = join(targetDir, 'apps', 'api', 'env.example');
  if (existsSync(apiExample)) {
    let env = await readFile(apiExample, 'utf8');
    env = env
      .replace(/app_dev/g, `${projectName.replace(/-/g, '_')}_dev`)
      .replace(/JWT_SECRET="[^"]*"/, `JWT_SECRET="${genSecret()}"`)
      .replace(
        /JWT_REFRESH_SECRET="[^"]*"/,
        `JWT_REFRESH_SECRET="${genSecret()}"`,
      );
    await writeFile(join(targetDir, 'apps', 'api', '.env'), env);
  }
  // Web env: copy example as-is.
  const webExample = join(targetDir, 'apps', 'web', 'env.example');
  if (existsSync(webExample)) {
    const env = await readFile(webExample, 'utf8');
    await writeFile(join(targetDir, 'apps', 'web', '.env.local'), env);
  }
}

function runQuiet(cmd: string, args: string[], cwd: string): boolean {
  const r = spawnSync(cmd, args, { cwd, stdio: 'ignore' });
  return r.status === 0;
}

function runInherit(cmd: string, args: string[], cwd: string): boolean {
  const r = spawnSync(cmd, args, { cwd, stdio: 'inherit' });
  return r.status === 0;
}

function printNextSteps(projectName: string, installed: boolean) {
  console.log();
  console.log(pc.green(pc.bold('  ✓ Done!')) + ' Your app is ready.');
  console.log();
  console.log('  Next steps:');
  console.log(pc.cyan(`    cd ${projectName}`));
  if (!installed) console.log(pc.cyan('    bun install'));
  console.log(pc.dim('    # start the database, then migrate + seed:'));
  console.log(pc.cyan('    cd apps/api && docker compose up -d'));
  console.log(pc.cyan('    bun run db:migrate && bun run db:seed && cd ../..'));
  console.log(pc.cyan('    bun run dev') + pc.dim('   # API :3000, web :3001'));
  console.log();
  console.log(
    pc.dim('  Fresh JWT secrets were generated in apps/api/.env. ') +
      pc.dim('See ENVIRONMENT.md.'),
  );
  console.log();
}

main().catch((err) => {
  console.error(pc.red('\n  Unexpected error:'), err);
  process.exit(1);
});
