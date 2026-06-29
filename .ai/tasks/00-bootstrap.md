# Sprint 0：工业级 AI 工程初始化执行流（Cursor / AI Agent）

> 项目：Enterprise AI Console  
> 模式：AI 驱动开发（Monorepo + AI Native Architecture）  
> 执行方式：Cursor / Claude Code / Gemini CLI  
> 输出约束：必须可运行、不可省略、不可伪代码

---

# 一、执行总原则（必须遵守）

本 Sprint 所有任务必须满足：

- 不允许跳步骤
- 不允许省略文件
- 不允许 TODO / mock 替代实现
- 所有代码必须可运行
- 所有模块必须 TypeScript（strict）
- 每一步必须可验证（install / dev / build / lint）

---

# 二、执行方式（重要）

本 Sprint 按顺序执行以下阶段：

> ⚠️ 必须严格按顺序执行，不允许并行跳跃

---

# 三、阶段 01：初始化 Workspace（Monorepo 基础）

## 目标

构建企业级 Monorepo 基础结构

## 必须创建

- apps/
- packages/
- server/
- docs/
- scripts/

---

## 根目录文件必须包含：

- package.json（workspace root）
- pnpm-workspace.yaml
- tsconfig.base.json
- .gitignore

---

## 验收标准

必须满足：

- pnpm install 成功
- workspace 正常识别
- 无报错

---

# 四、阶段 02：Admin（Vue3 企业后台）

## 路径

apps/admin

---

## 技术栈

- Vue3
- TypeScript
- Vite
- Pinia
- Vue Router
- UnoCSS

---

## 必须实现结构

### 页面

- Login（空页面）
- Dashboard（空页面）

---

### Layout

- Sidebar
- Header
- Main Layout

---

## 路由结构

- /login
- /dashboard

---

## 验收标准

- pnpm dev 可运行
- 页面可切换
- Layout 正常渲染

---

# 五、阶段 03：Server（BFF）

## 路径

server/

---

## 技术

- Hono
- TypeScript

---

## 必须实现 API

- GET /health → ok
- GET /version → 0.0.1

---

## 验收标准

- server 可启动
- curl 可访问接口

---

# 六、阶段 04：Packages（能力层）

## 创建 packages：

- ai-sdk
- auth
- request
- ui
- hooks
- utils
- types
- constants

---

## 每个 package 必须包含：

- package.json
- src/index.ts
- README.md

---

## 约束

- 不允许业务逻辑
- 只允许能力初始化
- 必须支持 workspace 引用

---

# 七、阶段 05：工程化体系

## 必须配置：

- ESLint（strict）
- Prettier
- Husky
- lint-staged
- Commitlint

---

## 验收标准

- pnpm lint 通过
- commit hook 生效

---

# 八、阶段 06：CI/CD（GitHub Actions）

## 创建：

.github/workflows/ci.yml

---

## CI 流程：

- install
- lint
- build

---

## 验收标准

- push 自动触发 CI
- CI 成功

---

# 九、阶段 07：Docs 初始化

## 创建目录：

- docs/architecture
- docs/roadmap
- docs/modules
- docs/adr
- docs/performance
- docs/deployment
- docs/interview

---

## 每个目录必须包含：

- README.md

---

## 验收标准

- docs 结构完整
- 无空目录遗漏

---

# 十、阶段 08：最终验收（Sprint 0 Finish）

## 必须输出：

- 完整目录树
- 所有新增文件列表
- 启动方式说明
- CI 状态说明

---

## 最终验收标准（DoD）

必须全部通过：

- pnpm install
- pnpm dev (admin)
- pnpm dev (server)
- pnpm lint
- pnpm build
- CI success

---

# 十一、Sprint 0 完成标志

当以下条件满足时：

- Monorepo 正常运行
- Admin 可访问
- Server 可访问
- CI 正常运行
- lint 通过

👉 Sprint 0 结束

进入：

Sprint 1：RBAC 权限系统
