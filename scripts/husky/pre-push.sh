#!/usr/bin/env sh
set -eu

. "$(dirname -- "$0")/common.sh"

branch="$(current_branch)"
if [ -z "$branch" ]; then
  log_warn "detached HEAD detected, fallback to full validation"
  branch="HEAD"
fi

if [ "$branch" != "HEAD" ] && ! is_allowed_branch "$branch"; then
  log_error "unsupported branch '$branch'. Allowed patterns: main, develop, feature/*, fix/*"
  exit 1
fi

if [ "$branch" = "main" ] && [ "${HUSKY_ALLOW_MAIN_PUSH:-0}" != "1" ]; then
  log_error "direct push to main is blocked. Use PR flow or set HUSKY_ALLOW_MAIN_PUSH=1 for emergency cases"
  exit 1
fi

cd "$REPO_ROOT"

changed_file_list="$(mktemp)"
cleanup() {
  rm -f "$changed_file_list"
}
trap cleanup EXIT INT TERM

while IFS=' ' read -r local_ref local_sha remote_ref remote_sha; do
  [ -n "${local_sha:-}" ] || continue

  if is_zero_sha "$local_sha"; then
    continue
  fi

  if is_zero_sha "${remote_sha:-}"; then
    if git rev-parse "${local_sha}^" >/dev/null 2>&1; then
      git diff --name-only "${local_sha}^" "${local_sha}" >> "$changed_file_list"
    else
      git diff-tree --no-commit-id --name-only -r "$local_sha" >> "$changed_file_list"
    fi
    continue
  fi

  git diff --name-only "$remote_sha" "$local_sha" >> "$changed_file_list"
done

if [ ! -s "$changed_file_list" ] && git rev-parse --verify HEAD >/dev/null 2>&1; then
  git diff-tree --no-commit-id --name-only -r HEAD >> "$changed_file_list"
fi

if [ -s "$changed_file_list" ]; then
  deduped_file_list="$(mktemp)"
  awk 'NF && !seen[$0]++' "$changed_file_list" > "$deduped_file_list"
  mv "$deduped_file_list" "$changed_file_list"
fi

docs_only=1
needs_lint=0
full_build=0
run_admin_build=0
run_server_build=0
has_changes=0

while IFS= read -r file; do
  [ -n "$file" ] || continue
  has_changes=1

  case "$file" in
    .ai/* | docs/* | *.md)
      ;;
    .github/workflows/* | .husky/* | scripts/husky/* | package.json | pnpm-lock.yaml | pnpm-workspace.yaml | tsconfig.json | tsconfig.base.json | eslint.config.mjs | prettier.config.cjs | commitlint.config.cjs)
      docs_only=0
      needs_lint=1
      full_build=1
      ;;
    apps/admin/*)
      docs_only=0
      needs_lint=1
      run_admin_build=1
      ;;
    server/*)
      docs_only=0
      needs_lint=1
      run_server_build=1
      ;;
    packages/*)
      docs_only=0
      needs_lint=1
      full_build=1
      ;;
    *)
      docs_only=0
      needs_lint=1
      full_build=1
      ;;
  esac
done < "$changed_file_list"

if [ "$has_changes" -eq 0 ]; then
  log_warn "cannot determine changed files, fallback to full validation"
  docs_only=0
  needs_lint=1
  full_build=1
fi

if [ "$docs_only" -eq 1 ]; then
  log_info "docs-only changes detected, skipping push validation"
  exit 0
fi

if is_protected_branch "$branch"; then
  log_info "protected branch '$branch' detected, enabling full validation"
  needs_lint=1
  full_build=1
fi

if [ "$needs_lint" -eq 1 ]; then
  log_info "running repository lint"
  pnpm lint
fi

if [ "$full_build" -eq 1 ]; then
  log_info "running full workspace build"
  pnpm build
  exit 0
fi

if [ "$run_admin_build" -eq 1 ]; then
  log_info "running admin build"
  pnpm --filter @enterprise-ai-console/admin build
fi

if [ "$run_server_build" -eq 1 ]; then
  log_info "running server build"
  pnpm --filter @enterprise-ai-console/server build
fi
