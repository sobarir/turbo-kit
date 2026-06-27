#!/usr/bin/env bash
# Builds a clean template snapshot of the kit into ./template for bundling with
# the CLI. Run from the package dir. Excludes everything that must not ship.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$HERE/../.." && pwd)"
DEST="$HERE/template"

rm -rf "$DEST"
mkdir -p "$DEST"

# Use tar with excludes to copy a clean snapshot (portable; no rsync needed).
tar -C "$REPO_ROOT" \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='dist' \
  --exclude='.turbo' \
  --exclude='coverage' \
  --exclude='*.tsbuildinfo' \
  --exclude='.eslintcache' \
  --exclude='apps/api/.env' \
  --exclude='apps/web/.env.local' \
  --exclude='apps/api/src/generated' \
  --exclude='packages/create-turbokit-app' \
  --exclude='test-results' \
  --exclude='playwright-report' \
  -cf - . | tar -C "$DEST" -xf -

# npm strips .gitignore from published packages — ship it renamed.
[ -f "$DEST/.gitignore" ] && mv "$DEST/.gitignore" "$DEST/gitignore" || true

echo "Template prepared at $DEST"
