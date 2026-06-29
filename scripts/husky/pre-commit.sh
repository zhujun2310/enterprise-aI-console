#!/usr/bin/env sh
set -eu

. "$(dirname -- "$0")/common.sh"

log_info "running staged file checks"
cd "$REPO_ROOT"
pnpm lint-staged
