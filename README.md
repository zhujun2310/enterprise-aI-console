# Enterprise AI Console

Enterprise AI Console 是一个面向企业 AI 场景的 Monorepo 初始化项目，当前阶段仅完成基础设施搭建，为后续认证、RBAC、AI Agent、拓扑和模块化业务开发提供统一工程底座。

## 已完成内容

- `pnpm workspace` Monorepo 结构
- `apps/admin` Vue3 + Vite + TypeScript + Pinia + Vue Router + UnoCSS
- `server` Hono 服务，提供 `GET /health` 与 `GET /version`
- `packages/*` 基础公共包骨架
- ESLint、Prettier、Husky、lint-staged、Commitlint
- GitHub Actions CI
- `docs/*` 文档目录初始化

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
├── eslint.config.js
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
- `Header / Sidebar / Main` 布局
- 基于 Vue Router 的页面跳转
- 基于 Pinia 的简单应用状态

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
