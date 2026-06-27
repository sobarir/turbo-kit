#!/usr/bin/env bash
# The single source of truth for "is the code green?".
# Called by: the pre-push git hook, CI, and the `verify` skill.
# Run from the repo root.
set -euo pipefail

echo "▶ format:check"
bun run format:check

echo "▶ lint (apps)"
bun run lint

echo "▶ lint (packages)"
bunx eslint packages/shared/src

echo "▶ typecheck"
bun run typecheck

echo "▶ test-presence (every service has a spec)"
bash scripts/check-test-presence.sh

echo "▶ test"
bun run test

echo "▶ duplicate-code check"
bunx jscpd || echo "⚠ duplication over threshold — consider extracting shared code (non-blocking)"

echo "▶ build"
bun run build

echo "✅ verify: all gates green"
