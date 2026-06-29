# Scripts

This directory stores automation scripts for the workspace.

## Git

- `scripts/git/auto-commit.sh`: stages all changes and launches the Commitizen prompt

## Husky

- `scripts/husky/pre-commit.sh`: runs staged-file quality checks
- `scripts/husky/prepare-commit-msg.sh`: injects a commit template for interactive commits
- `scripts/husky/commit-msg.sh`: validates Conventional Commit messages with scoped modules
- `scripts/husky/validate-ticket-ref.sh`: enforces ticket reference or explicit waiver in commit footer
- `scripts/husky/pre-push.sh`: applies branch-aware and change-aware push validation
- `scripts/husky/common.sh`: stores shared Git and logging helpers for hook scripts
