#!/usr/bin/env bash
# test-presence gate: every API service (*.service.ts) must have a matching
# *.service.spec.ts. This makes "the agent skipped writing tests" a mechanical
# failure rather than something only a human review would catch.
#
# It checks PRESENCE, not quality — a shallow test still passes this. Quality is
# guarded separately by the coverage floor (bunfig.toml) and the write-tests
# skill. Presence is the part that's cleanly mechanizable, so we enforce it here.
#
# Exceptions: infrastructure with no business logic to unit-test. Add a path to
# TEST_EXEMPT below (with a reason) if it genuinely needs no spec.
set -euo pipefail

cd "$(dirname "$0")/.." # repo root

# Services that legitimately need no unit test (infrastructure/wiring only).
TEST_EXEMPT=(
  "apps/api/src/prisma/prisma.service.ts" # thin PrismaClient lifecycle wrapper
)

is_exempt() {
  local file="$1"
  for ex in "${TEST_EXEMPT[@]}"; do
    [ "$file" = "$ex" ] && return 0
  done
  return 1
}

missing=()
while IFS= read -r svc; do
  is_exempt "$svc" && continue
  spec="${svc%.ts}.spec.ts"
  [ -f "$spec" ] || missing+=("$svc")
done < <(find apps/api/src -name "*.service.ts" ! -name "*.spec.ts" | sort)

if [ ${#missing[@]} -gt 0 ]; then
  echo "✗ test-presence: these services have no matching .spec.ts:"
  for m in "${missing[@]}"; do
    echo "    $m  →  expected ${m%.ts}.spec.ts"
  done
  echo ""
  echo "  Write a test (see the write-tests skill), or — only if it's pure"
  echo "  infrastructure with no logic — add it to TEST_EXEMPT in scripts/check-test-presence.sh."
  exit 1
fi

echo "✓ test-presence: every service has a spec"
