#!/usr/bin/env node
// Builds a clean template snapshot of the kit into ./template for bundling with
// the CLI. Pure Node — works on Windows, macOS, and Linux (no bash/rsync/robocopy).
// Run from the package dir: `node prepare-template.mjs`.
import { rm, mkdir, cp, rename, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, resolve, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(HERE, '..', '..');
const DEST = join(HERE, 'template');

// Directories/files to never copy into the template. Matched by name at any
// depth (for dirs) or by exact relative path (for the explicit files).
const EXCLUDED_DIR_NAMES = new Set([
  '.git',
  'node_modules',
  '.next',
  'dist',
  '.turbo',
  'coverage',
  'test-results',
  'playwright-report',
  'generated', // apps/api/src/generated
]);

const EXCLUDED_FILE_NAMES = new Set([
  '.env',
  '.env.local',
  '.eslintcache',
]);

const EXCLUDED_EXTENSIONS = new Set(['.tsbuildinfo']);

// The CLI package itself must not be copied into its own template (infinite-ish
// recursion + bloat). Identified by absolute path.
const SELF_DIR = HERE;

async function copyDir(srcDir, destDir) {
  await mkdir(destDir, { recursive: true });
  const entries = await readdir(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = join(srcDir, entry.name);
    const destPath = join(destDir, entry.name);

    // Skip the CLI package itself.
    if (resolve(srcPath) === SELF_DIR) continue;

    if (entry.isDirectory()) {
      if (EXCLUDED_DIR_NAMES.has(entry.name)) continue;
      await copyDir(srcPath, destPath);
    } else if (entry.isFile()) {
      if (EXCLUDED_FILE_NAMES.has(entry.name)) continue;
      if ([...EXCLUDED_EXTENSIONS].some((ext) => entry.name.endsWith(ext)))
        continue;
      await cp(srcPath, destPath);
    }
    // symlinks and other types are skipped intentionally.
  }
}

async function main() {
  // Fresh start.
  await rm(DEST, { recursive: true, force: true });
  await mkdir(DEST, { recursive: true });

  await copyDir(REPO_ROOT, DEST);

  // npm strips .gitignore from published packages — ship it renamed so the CLI
  // can restore it on scaffold.
  const gi = join(DEST, '.gitignore');
  if (existsSync(gi)) await rename(gi, join(DEST, 'gitignore'));

  console.log(`Template prepared at ${DEST}`);
}

main().catch((err) => {
  console.error('prepare-template failed:', err);
  process.exit(1);
});
