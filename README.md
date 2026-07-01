# Enterprise AI Console

Enterprise AI Console 是一个面向企业 AI 场景的 Monorepo 项目，当前已完成基础工程与 `Sprint 3` 设备中心模块，可继续在此基础上扩展认证、RBAC、AI Agent、拓扑和行业业务能力。

## 已完成内容

- `pnpm workspace` Monorepo 结构
- `apps/admin` React 19 + Vite + TypeScript + `react-router-dom` + UnoCSS
- `apps/admin` 采用 `AuthProvider + useAuthStore()` 管理认证与 RBAC 状态
- `apps/admin` 采用路由门禁与条件渲染实现页面级、菜单级、按钮级权限控制
- `server` Hono 服务，提供 `GET /health` 与 `GET /version`
- `packages/*` 基础公共包骨架
- ESLint、Prettier、Husky、lint-staged、Commitlint
- GitHub Actions CI
- `docs/*` 文档目录初始化
- `Sprint 3` 设备中心主链路：设备列表、设备详情、实时监控、告警中心、运维中心

## 目录结构

```text
enterprise-ai-console
├── .github/
│   └── workflows/
├── .husky/
├── apps/
│   └── admin/
├── docs/
│   ├── adr/
│   ├── architecture/
│   ├── deployment/
│   ├── interview/
│   ├── modules/
│   ├── performance/
│   └── roadmap/
├── packages/
│   ├── ai-sdk/
│   ├── auth/
│   ├── constants/
│   ├── hooks/
│   ├── request/
│   ├── types/
│   ├── ui/
│   └── utils/
├── scripts/
├── server/
├── CHANGELOG.md
├── commitlint.config.cjs
├── eslint.config.mjs
├── package.json
├── pnpm-workspace.yaml
├── prettier.config.cjs
├── tsconfig.base.json
└── tsconfig.json
```

## 启动方式

```bash
pnpm install
pnpm dev
```

默认启动后：

- Admin: `http://localhost:5173`
- Server: `http://localhost:3000`

## 常用命令

```bash
pnpm dev
pnpm lint
pnpm build
pnpm format
pnpm commit
```

其中：

- `pnpm commit`：自动执行 `git add -A`，然后打开 Commitizen 向导
- `pnpm commit:prompt`：仅打开 Commitizen 向导，不自动暂存文件
- 当前阶段提交 footer 仅保留 `Refs:`，暂无工单号时统一使用 `Refs: N/A`

## 应用说明

### Admin

基础后台应用包含：

- 登录页 `Login`
- 仪表盘页 `Dashboard`
- 用户管理页 `Users`
- `403 Forbidden` 权限兜底页
- `Header / Sidebar / Main` 布局
- 基于 `react-router-dom` 的公开路由、受保护路由和权限路由
- 基于 `AuthProvider + useAuthStore()` 的认证、会话恢复和权限派生
- 基于 `filterMenus()` 的菜单过滤
- 基于 `hasPermission()` 的按钮级条件渲染
- `Device Center` 模块：
- 设备列表，支持搜索、筛选、排序、分页、固定列与详情/监控/日志跳转
- 设备详情，展示基础信息、属性信息、状态信息、最近告警与最近操作
- 实时监控，支持趋势图、仪表盘、链路指标、历史曲线与 Mock 自动刷新
- 告警中心，支持等级/状态筛选、详情查看与确认/忽略/已处理流转
- 运维中心，支持区域/类型/标签分组、操作日志查询与批量操作

### Server

基础 BFF 服务包含：

- `GET /health`
- `GET /version`

## 文档索引

- `docs/architecture`
- `docs/roadmap`
- `docs/modules`
- `docs/adr`
- `docs/performance`
- `docs/deployment`
- `docs/interview`
