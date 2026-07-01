# ADR 0001: 技术栈与 Monorepo 选择

## Status

Accepted

## Context

项目目标是快速交付一个可演示、可扩展的企业级后台样例，要求同时具备：

- 工程化能力（lint/build/CI/一致的规范）
- 权限系统闭环（前后端一致）
- 可视化与实时能力（Dashboard）
- 可持续扩展的业务模块（设备中心、拓扑等）

因此需要一个能清晰分层、支持能力复用、便于后续扩展的工程组织方式。

## Decision

- 采用 `pnpm workspace` 组织 Monorepo
- 前端 Admin 采用 `React 19 + Vite + TypeScript + react-router-dom + UnoCSS`
- BFF 服务采用 `Hono + TypeScript`
- 将 RBAC 等基础能力下沉到 `packages/*`，应用层通过 workspace 引用

## Alternatives

### 1) 单仓库单应用（不拆 packages）

优点：

- 初期结构简单

缺点：

- 能力复用和边界不清晰
- RBAC、types、utils 等容易散落
- 后续模块扩展成本更高

### 2) Next.js 全栈

优点：

- SSR/全栈一体

缺点：

- 对当前“BFF + SPA”的演示目标来说复杂度更高
- 路由、鉴权、数据流会被框架策略影响较大

## Consequences

正面：

- 目录与职责边界明确（apps/server/packages/docs）
- 复用能力可持续沉淀（auth/types/utils）
- CI 与质量门禁统一

代价：

- 多包管理带来一定复杂度（版本、构建、依赖）
- 需要维护基础脚手架与规范
