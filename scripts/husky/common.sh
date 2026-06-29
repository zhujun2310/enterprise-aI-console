#!/usr/bin/env sh
set -u

REPO_ROOT="$(CDPATH= cd -- "$(dirname -- "$0")/../.." && pwd)"

log_info() {
  printf '%s\n' "husky: $*"
}

log_warn() {
  printf '%s\n' "husky: warning: $*" >&2
}

log_error() {
  printf '%s\n' "husky: error: $*" >&2
}

current_branch() {
  git symbolic-ref --quiet --short HEAD 2>/dev/null || printf ''
}

is_zero_sha() {
  [ -n "${1:-}" ] && [ "$1" = "0000000000000000000000000000000000000000" ]
}

is_allowed_branch() {
  case "${1:-}" in
    main | develop | feature/* | fix/*)
      return 0
      ;;
    *)
      return 1
      ;;
  esac
}

is_protected_branch() {
  case "${1:-}" in
    main | develop)
      return 0
      ;;
    *)
      return 1
      ;;
  esac
}
