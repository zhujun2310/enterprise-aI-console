# Architecture

系统架构说明与边界约束（面向“可演示的企业级后台 + IoT 模块 + AI Native 首页”）。

## 总览

本仓库采用 `pnpm workspace` Monorepo 结构，按“应用层 / 服务层 / 能力层包 / 文档”组织：

- 前端 Admin：`apps/admin`（React 19 + Vite + TypeScript + react-router-dom + UnoCSS）
- BFF 服务：`server`（Hono + TypeScript）
- 能力层：`packages/*`（auth/request/utils/types/ui/hooks/constants/ai-sdk）
- 文档体系：`docs/*`

核心目标是：用清晰的模块边界，把“权限体系、业务模块、实时能力、可视化、AI 交互入口”组合成可持续演进的工程底座。

## 分层与边界

### 1) 应用层（apps/admin）

职责：

- 页面与交互（Dashboard、Device Center、Users 等）
- 路由与权限门禁（RequireAuth / PermissionRoute）
- 业务模块内的状态与组件组织（按模块目录收敛）

边界：

- 不在页面里散落权限判断算法，统一通过 `useAuthStore().hasPermission()`
- 不直接依赖服务端的内部实现细节，只通过 `apps/admin/src/api/*` 或模块内 `api/*` 访问 BFF

### 2) 服务层（server）

职责：

- 提供 BFF API（登录、用户信息、Dashboard、设备中心 Mock 数据等）
- 统一鉴权（requireAuth / requirePermission）
- 提供实时通道（SSE）

边界：

- 不做前端渲染相关逻辑
- 不暴露敏感信息，不记录 token

### 3) 能力层（packages/*）

职责：

- 提供可复用能力（RBAC 模型、菜单定义、权限工具函数等）
- 提供跨应用可共享的类型/工具/请求封装

边界：

- 不绑定具体业务页面
- 能力层尽量纯函数化，避免引入应用状态

## 关键链路

### 认证与权限链路（RBAC）

链路：

- `apps/admin` 登录 -> `server` `/auth/login` 返回 token
- token 持久化 -> `AuthProvider` hydrate 恢复会话
- `packages/auth` 计算用户权限与菜单 -> 路由/菜单/UI 受控
- `server` 中间件对 API 再次校验（401/403）

### Dashboard（Widget + SSE）

链路：

- 初始加载：`/dashboard/snapshot` 拉取快照
- 实时更新：`/sse/dashboard` 推送事件（kpi/device/alarm/trend）
- 前端 `useSse` 统一管理连接、重连与可见性恢复刷新
- Widget 配置：localStorage 持久化（显示/隐藏、排序、刷新间隔）

### 设备中心（Mock 主链路）

链路：

- 列表 -> 详情 -> 监控 -> 告警 -> 运维（同一模块内统一 Store 与 Mock 数据源）
- Store 负责各页面共享的加载态、错误态、分页与查询条件
- Mock 数据层提供分页、筛选、状态流转与批量操作

## 目录结构（关键片段）

```text
enterprise-ai-console
├── apps/
│   └── admin/
│       └── src/
│           ├── api/
│           ├── modules/
│           │   ├── dashboard/
│           │   └── device/
│           ├── router/
│           ├── stores/
│           └── layouts/
├── packages/
│   ├── auth/
│   ├── request/
│   ├── utils/
│   └── ...
└── server/
    └── src/
        ├── auth/
        ├── dashboard.ts
        └── index.ts
```

## 约束与约定

- 权限校验必须同时存在于“前端路由/UI”和“服务端 API”，避免只靠前端隐藏按钮。
- Dashboard 不写死，Widget 必须可配置并可持久化。
- 实时能力优先 SSE（成本低、易部署），WebSocket 属于后续增强项。

## 推荐阅读顺序

- `Sprint 0`：工程底座（`docs/sprints/sprint-0-bootstrap.md`）
- `Sprint 1`：RBAC（`docs/sprints/sprint-1-rbac.md`）
- `Sprint 2`：Dashboard（`docs/sprints/sprint-2-dashboard.md`）
- `Sprint 3`：设备中心（当前实现已完成，后续补独立模块文档）
