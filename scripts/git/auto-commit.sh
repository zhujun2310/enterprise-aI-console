#!/usr/bin/env sh
set -eu

REPO_ROOT="$(CDPATH= cd -- "$(dirname -- "$0")/../.." && pwd)"

cd "$REPO_ROOT"

if [ -z "$(git status --porcelain)" ]; then
  printf '%s\n' "commit: no changes detected, nothing to commit" >&2
  exit 1
fi

printf '%s\n' "commit: staging all tracked, modified and untracked files"
git add -A

if git diff --cached --quiet; then
  printf '%s\n' "commit: no staged changes available after git add -A" >&2
  exit 1
fi

printf '%s\n' "commit: launching commitizen prompt"
exec pnpm exec git-cz "$@"
