#!/usr/bin/env sh
set -eu

. "$(dirname -- "$0")/common.sh"

if [ "$#" -lt 1 ]; then
  log_error "commit message file path is required"
  exit 1
fi

commit_msg_file="$1"
commit_source="${2:-}"

case "$commit_source" in
  merge | squash | commit)
    exit 0
    ;;
esac

if [ ! -f "$commit_msg_file" ]; then
  log_error "commit message file '$commit_msg_file' does not exist"
  exit 1
fi

if [ -s "$commit_msg_file" ]; then
  exit 0
fi

template_file="$REPO_ROOT/.gitmessage.txt"
if [ ! -f "$template_file" ]; then
  log_warn "commit template file '.gitmessage.txt' is missing"
  exit 0
fi

log_info "injecting commit template"
cat "$template_file" > "$commit_msg_file"
