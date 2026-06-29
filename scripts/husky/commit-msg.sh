#!/usr/bin/env sh
set -eu

. "$(dirname -- "$0")/common.sh"

if [ "$#" -ne 1 ]; then
  log_error "commit message file path is required"
  exit 1
fi

log_info "validating commit message"
cd "$REPO_ROOT"
pnpm commitlint --edit "$1"
sh ./scripts/husky/validate-ticket-ref.sh "$1"
