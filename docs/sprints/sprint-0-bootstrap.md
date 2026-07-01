# Sprint 0：工程初始化交付记录

## 目标

Sprint 0 负责把项目从空仓库推进到可运行的企业级 Monorepo 基础工程，覆盖：

- `pnpm workspace` Monorepo 结构
- `apps/admin` React 19 管理后台骨架
- `server` Hono BFF 骨架
- `packages/*` 能力层包骨架
- ESLint / Prettier / Husky / lint-staged / Commitlint
- GitHub Actions CI
- `docs/*` 文档目录初始化

## 已交付内容

### 1. Monorepo 结构

仓库已形成以下一级目录：

- `apps/`
- `packages/`
- `server/`
- `docs/`
- `scripts/`

根目录已包含：

- `package.json`
- `pnpm-workspace.yaml`
- `tsconfig.base.json`
- `.gitignore`
- `tsconfig.json`
- `eslint.config.mjs`
- `prettier.config.cjs`

### 2. Admin 基础后台

`apps/admin` 已完成基础前端应用骨架：

- React 19 + Vite + TypeScript
- UnoCSS 接入
- `Login`、`Dashboard`、`Users`、`403` 等基础页面
- `AdminLayout`、`AppHeader`、`AppSidebar` 布局壳
- 路由入口与受保护页面挂载

### 3. Server 基础能力

`server` 已基于 Hono 搭建：

- `GET /health`
- `GET /version`

同时作为后续 Sprint 的统一 BFF 入口继续扩展。

### 4. Packages 能力层

已创建以下 workspace 包：

- `packages/ai-sdk`
- `packages/auth`
- `packages/request`
- `packages/ui`
- `packages/hooks`
- `packages/utils`
- `packages/types`
- `packages/constants`

每个包都具备基础的：

- `package.json`
- `src/index.ts`
- `README.md`

### 5. 工程化与提交流程

已落地：

- ESLint
- Prettier
- Husky
- lint-staged
- Commitlint
- Commitizen 配置

配套脚本位于：

- `scripts/husky/`
- `scripts/git/`

### 6. CI 与文档目录

已创建：

- `.github/workflows/ci.yml`
- `docs/architecture/README.md`
- `docs/roadmap/README.md`
- `docs/modules/README.md`
- `docs/adr/README.md`
- `docs/performance/README.md`
- `docs/deployment/README.md`
- `docs/interview/README.md`

## 关键文件

- `package.json`
- `pnpm-workspace.yaml`
- `tsconfig.base.json`
- `.github/workflows/ci.yml`
- `apps/admin/package.json`
- `apps/admin/src/App.tsx`
- `apps/admin/src/main.tsx`
- `apps/admin/src/layouts/AdminLayout.tsx`
- `server/package.json`
- `server/src/index.ts`

## 当前可验证结果

从当前仓库状态看，Sprint 0 的基础工程目标已经具备持续开发能力：

- 工作区脚本齐全，可统一执行 `dev / build / lint`
- 前后端目录边界清晰
- 公共包可通过 workspace 方式引用
- 文档目录已建立，后续 Sprint 可按模块继续沉淀

## 范围说明

Sprint 0 的交付重点是“搭架子并跑通基础链路”，不强调业务功能完整度。因此：

- 页面层以骨架和基础路由为主
- `server` 只提供基础服务与后续扩展入口
- `packages/*` 主要是初始化和边界划分，不承载重业务逻辑
