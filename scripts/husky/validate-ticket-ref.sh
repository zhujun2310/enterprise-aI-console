#!/usr/bin/env sh
set -eu

if [ "$#" -ne 1 ]; then
  printf '%s\n' "husky: error: commit message file path is required for ticket validation" >&2
  exit 1
fi

commit_msg_file="$1"

if ! grep -Eq '^Refs: ([A-Z][A-Z0-9]+-[0-9]+|N/A)$' "$commit_msg_file"; then
  printf '%s\n' "husky: error: commit message must include 'Refs: N/A' for the current phase, or a future ticket like 'Refs: EA-123'" >&2
  exit 1
fi
