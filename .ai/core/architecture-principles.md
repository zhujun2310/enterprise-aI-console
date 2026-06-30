# 架构原则（Architecture Principles）

> 版本：v1.0  
> 项目：Enterprise AI Console  
> 类型：架构级约束（最高优先级）  
> 生效范围：全仓库（apps / packages / server / docs）

---

# 一、总原则（Core Principles）

## 1. 企业级优先（Enterprise First）

本项目以“真实企业系统”为标准，而不是 Demo。

所有设计必须满足：

- 可扩展（支持多业务模块）
- 可维护（支持长期迭代）
- 可协作（支持多人开发）
- 可演进（支持架构升级）
- 可治理（支持规范约束）

禁止：

- Demo 式单文件实现
- 临时拼接式代码
- 无结构业务逻辑
- 只为展示效果的 hack 写法

---

## 2. 分层清晰（Clear Layering）

系统必须严格分层：

- UI 层（apps）
- 业务能力层（packages）
- 服务层（server）
- 文档层（docs）

任何跨层访问都必须禁止或受控。

---

## 3. 高内聚低耦合（High Cohesion, Low Coupling）

模块内部强内聚，模块之间弱耦合。

禁止：

- UI 直接调用数据库
- UI 直接调用 AI API
- 组件内写复杂业务逻辑
- 跨模块深度依赖内部实现

必须通过：

- packages（能力抽象）
- server（BFF 聚合）
- SDK（统一接口）

---

## 4. AI Native First（AI 原生优先）

AI 是系统核心能力，不是附加功能。

所有 AI 能力必须：

- 统一封装在 ai-sdk
- 支持多模型（OpenAI / Claude / 本地模型）
- 支持流式输出（SSE）
- 支持工具调用（Tool / Function Calling）
- 支持结构化输出（JSON Schema）

禁止：

- 页面直接调用 OpenAI API
- 业务代码散落 AI 请求逻辑
- 无统一 prompt 管理

---

# 二、分层架构规范

## 1. UI 层（apps）

职责：

- 页面渲染
- 交互逻辑
- 状态展示
- UI 组合

禁止：

- 业务计算
- AI 调用
- 数据库访问
- 复杂数据处理

UI 层只做：

> 展示 + 触发行为

---

## 2. 能力层（packages）

这是系统能力中台。

必须包含：

- ai-sdk
- auth
- request
- ui
- hooks
- utils
- types
- constants

原则：

> 所有可复用能力必须沉淀在 packages

禁止：

- packages 依赖 apps
- packages 写业务逻辑
- packages 直接访问 server 数据库

---

## 3. 服务层（server / BFF）

职责：

- 接口聚合
- AI 请求代理
- SSE 流式转发
- 鉴权校验
- Tool 调度
- 外部 API 聚合

禁止：

- UI 逻辑
- 页面状态管理

server 只做：

> 数据与能力的中转层

---

## 4. 文档层（docs）

职责：

- 架构说明
- ADR（架构决策记录）
- 模块说明
- 性能分析
- AI 设计说明

原则：

> 文档必须与代码同步演进（Documentation as Code）

---

# 三、AI 架构规范

## 1. AI 单入口原则

所有 AI 调用必须通过：

packages/ai-sdk

禁止：

- 直接调用 OpenAI API
- 在组件中调用模型
- server 分散写 prompt

---

## 2. AI 分层结构

AI 能力分为三层：

### 基础能力层

- chat
- stream
- completion

### 工具能力层

- tool calling
- function calling
- 外部 API 调用

### 应用能力层

- AI Copilot
- AI Agent
- AI Form Generator
- AI Topology Generator

---

## 3. AI 输出约束

AI 输出必须结构化：

允许：

- JSON
- Markdown
- Schema 数据

禁止：

- 直接操作 DOM
- 直接操作 UI
- 不可解析文本

---

## 4. AI 状态必须可追踪

必须支持：

- sessionId
- message history
- streaming 状态
- abort 中断能力

---

# 四、模块边界规范

## Dashboard

职责：

- 数据展示
- 图表分析
- 实时监控

禁止：

- AI 逻辑
- 写入业务数据

---

## Device Center

职责：

- 设备管理
- 状态查看

禁止：

- AI 推理逻辑
- UI 内业务处理

---

## AI Copilot

职责：

- 自然语言入口
- 意图识别
- Tool 调度

禁止：

- 直接操作数据库

---

## Topology Editor

职责：

- 图结构编辑
- 节点管理

AI 用途：

- 初始生成
- 布局优化

---

## RBAC

必须独立模块：

- 用户
- 角色
- 权限

支持：

- 路由门禁组件
- 按钮级权限门禁
- 菜单按权限过滤

---

# 五、依赖规则

## 正确方向

apps → packages  
apps → server  
server → packages

## 禁止方向

packages → apps  
server → apps  
ui → business logic  
ai-sdk → UI

---

# 六、状态管理规范

## React 状态使用范围

仅前端壳层状态：

- sidebar
- theme
- layout
- 登录状态

推荐形态：

- `AuthProvider` 承载认证上下文
- `useAuthStore()` 作为统一读取入口
- `useMemo()` 派生角色、权限、菜单

## 业务状态

禁止直接堆叠在页面局部状态：

- AI 会话
- 拓扑数据
- 设备数据

必须通过：

- SDK
- service layer
- hooks / context

禁止：

- 在多个页面重复维护用户、权限、菜单副本
- 在组件树深处绕过统一 auth 上下文直接拼装权限状态

---

# 七、性能规范

## Dashboard

- 支持大数据
- 避免全量刷新

## Topology

- 支持 1000+ 节点
- 必要时 WebWorker

## AI Streaming

- SSE 支持
- 可中断
- 增量渲染

---

# 八、工程规范

## TypeScript

- strict 模式
- 禁止 any

## React

- 函数组件
- hooks 优先
- 单一职责
- 路由守卫集中定义
- 权限判断统一走 `hasPermission()`

## 命名

- 组件：PascalCase
- 工具：camelCase
- hooks：useXXX
- provider / store：`stores/*.tsx`

---

# 九、目录扩展规范

新增模块必须判断：

- 是否复用
- 是否跨业务
- 是否独立

归属规则：

- packages：能力
- apps：业务
- server：服务
- docs：文档

---

# 十、架构红线

禁止：

- UI 写业务逻辑
- 直接调用 AI API
- 跨 package 强依赖
- server 操作 UI
- 无结构扩展
- 无类型代码

---

# 十一、架构演进

v1 Monorepo + Admin + Server  
v2 AI SDK 独立化  
v3 Agent 平台化  
v4 多模型支持  
v5 插件系统  
v6 企业级 AI OS

---

# 十二、最终目标

本项目目标不是 Demo，而是：

一个可扩展、可演进、可复用的企业级 AI 前端基础设施。
