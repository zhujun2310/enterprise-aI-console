# Git 规范

Commit：

采用 Conventional Commit。

推荐使用 `pnpm commit` 发起提交流程，命令会自动执行 `git add -A` 并打开 Commitizen 向导。

如需仅使用向导而不自动暂存，可执行 `pnpm commit:prompt`。

必须带 `scope`，且 scope 需与 Monorepo 模块对应。

例如：

feat(admin): 新增登录守卫

fix(server): 修复 token 解析问题

docs(repo): 更新 README

提交信息 footer 当前仅保留一种写法：

当前阶段统一使用：

Refs: N/A

后续接入正式工单后，仍沿用 `Refs:`，例如：

Refs: EA-123

当前阶段分支名无需包含工单号。

后续若启用工单体系，建议使用：

feature/EA-123-login-guard

Commitizen 会在存在工单号时自动从分支名中提取并预填到提交 footer；当前没有工单号时默认使用 `N/A`。

---

Branch：

main

develop

feature/*

fix/*

禁止直接 push 到 `main`，如需紧急处理必须显式放开本地保护。

---

完成任务：

自动生成：

Commit Message。

更新：

CHANGELOG。
