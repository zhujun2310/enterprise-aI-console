# Sprint 2：Dashboard（AI Native 业务入口）

> 项目：Enterprise AI Console  
> 模式：AI 驱动开发（Vibe Coding 指令集）  
> Sprint：2  
> 目标：实现企业级后台首页 + AI Native 首页亮点（Widget 化 + 可视化 + 实时 + AI 助手）

---

# 一、强制执行规则（必须遵守）

- 必须严格 TypeScript（strict）
- 不允许 any
- 不允许用 UI mock 替代结构设计（可以用 Server In-Memory 数据源，但必须走真实 API / 真实数据流）
- 不允许跳步骤：先框架与类型 → 再组件 → 再实时 → 再 AI
- Dashboard 不写死：所有模块必须以 Widget 形式落地，可配置显示/隐藏与排序
- 图表必须封装为统一能力层（优先放到 packages/charts 或项目现有图表能力层）
- 数据获取必须走统一 request 能力（优先复用 packages/request 或现有封装）
- 所有 Widget 必须具备 loading / empty / error 三态
- Dashboard 首屏必须可用（Skeleton + 懒加载），不允许首屏大面积白屏

---

# 二、页面布局（必须实现）

目标布局（结构优先，样式可迭代）：

- Header
- Sidebar
- 主区域为可响应式网格布局：
  - 顶部：KPI Cards（可多行）
  - 中部：左侧 Business Overview / Device Status / Realtime Trend
  - 中部：右侧 AI Assistant / Alarm Center

约束：

- 必须支持响应式：桌面 2 列，窄屏自动变 1 列
- Sidebar 与 Header 必须复用现有 Layout（如已有）
- Dashboard 路由必须保持 `/dashboard`，并受 RBAC 控制（至少要求 `dashboard:view`）

---

# 三、目录约定（必须遵守）

Dashboard 代码必须收敛在：

- `apps/admin/src/modules/dashboard/`

建议结构（可按现有工程微调，但必须保持模块化）：

- `apps/admin/src/modules/dashboard/api/`
- `apps/admin/src/modules/dashboard/components/`
- `apps/admin/src/modules/dashboard/composables/`（或 hooks）
- `apps/admin/src/modules/dashboard/store/`
- `apps/admin/src/modules/dashboard/types/`
- `apps/admin/src/modules/dashboard/utils/`
- `apps/admin/src/modules/dashboard/views/Dashboard.tsx`（或 Dashboard.tsx / DashboardPage.tsx，以现有路由约定为准）
- `apps/admin/src/modules/dashboard/index.ts`

图表能力建议统一放到：

- `packages/charts`（如果项目已有图表能力层则优先复用，不重复造轮子）

---

# 四、Vibe Coding 执行阶段（按顺序完成）

> 每一阶段必须输出：新增/修改文件列表 + 验收方式 + 自测结果（页面可见 + 交互可用）

---

## 阶段 2.1：Dashboard 页面框架 + 响应式布局 + Widget 容器

必须实现：

- Dashboard 页面基础布局：Header/Sidebar 下的主内容区域
- WidgetGrid：负责网格布局（列数随断点变化）
- WidgetContainer：统一外壳（标题、操作区、刷新、loading/empty/error）
- WidgetRegistry：Widget 注册表（id → 渲染器、默认配置、权限要求、默认尺寸）
- WidgetConfig（本地版）：支持显示/隐藏、排序（优先 localStorage 持久化，后续可迁移到 server）

必须定义类型（放在 dashboard/types）：

- `WidgetId`
- `WidgetLayout`（位置/跨度/断点）
- `WidgetConfig`（visible、refreshInterval、dataSourceKey 等）
- `WidgetDefinition`（id、title、icon、permissionCode、defaultLayout、render）

验收标准：

- `/dashboard` 页面可打开，布局稳定
- 至少 3 个 Widget 可渲染（可先用占位 Widget，但必须是真实组件与容器机制）
- Widget 显示/隐藏与排序可用，刷新页面后配置仍然保留

---

## 阶段 2.2：KPI 数据卡片（支持数字动画 + 环比/同比 + 点击跳转）

Widget：`kpi`

必须实现：

- KPICard 组件：标题、数值、单位、趋势（环比/同比）
- 数字动画（count up），必须可控：开始值、结束值、持续时间、格式化
- 点击跳转（基于 router navigate），跳转目标先按现有路由落地（没有页面则先落到占位页/列表页，但必须是可访问路由）

KPI 建议字段（至少包含其中 4 个）：

- 在线设备数量
- 今日告警数量
- AI 调用次数
- 今日工单
- 在线用户
- 系统运行时间

验收标准：

- KPI 正常展示与动画正常
- 点击 KPI 可跳转
- loading/empty/error 三态可见且不破版

---

## 阶段 2.3：图表组件封装（统一 Chart 能力层）

目标：

- 抽象统一图表组件接口（Line/Bar/Pie 至少 3 种）
- 允许按需加载（lazy import）以优化首屏
- 统一主题、tooltip、空态、loading

执行指令：

- 优先检查项目是否已有图表库与封装；如无，选择一个图表库并落到 `packages/charts` 进行二次封装
- Dashboard 只能依赖封装后的 Chart 组件，不允许直接在页面里堆图表库配置

验收标准：

- `packages/charts`（或现有能力层）对外暴露统一组件与类型
- Dashboard 中至少一个 Widget 使用封装后的图表组件渲染

---

## 阶段 2.4：实时数据（先 SSE，后 WebSocket 预留）

目标：

- 支持 Dashboard 数据实时刷新：KPI、告警、设备、趋势

执行指令：

- 先实现 SSE：`/sse/dashboard`（或按现有 server 路由组织）
- 前端实现 `useSSE`（或 composable）统一管理连接、重连、退避、关闭
- 事件必须带类型：`kpi:update` / `alarm:new` / `device:status` / `trend:point`
- WebSocket 只预留接口与抽象层，不强制同 Sprint 完整实现

验收标准：

- 打开 Dashboard 后，数据可在不刷新页面的情况下更新
- SSE 断开可自动重连

---

## 阶段 2.5：AI Assistant Widget（首页固定）

Widget：`ai_assistant`

必须实现：

- 对话 UI：输入框、消息列表、发送中状态、错误提示
- 支持 4 类能力（先做前端入口，后端能力可逐步补齐）：
  - 问答
  - 快速搜索（在 Dashboard 模块内先支持：告警/设备/工单的关键词过滤）
  - 页面导航（解析“打开 XX”，映射到 route）
  - 系统帮助（展示快捷指令与能力说明）

示例指令必须可跑通至少 2 条：

- “今天有哪些告警？”
- “帮我打开设备中心”
- “查询最近 AI 调用”

验收标准：

- AI Assistant Widget 固定在右侧区域（窄屏可下移）
- 能正确发送与渲染消息（无论后端是规则引擎还是 AI API）
- 至少 2 条示例指令有可见结果或可导航效果

---

## 阶段 2.6：AI 今日摘要（自动总结）

Widget：`ai_daily_summary`

必须实现：

- 以结构化卡片展示摘要：新增设备、告警、AI 调用、Workflow 成功率等
- 摘要来源允许两种模式（择一优先实现）：
  - Server 直接返回摘要字段（最稳）
  - Server 返回原始指标，前端按规则生成摘要（必须可复现）

验收标准：

- 每次进入 Dashboard 可生成/拉取当天摘要
- 摘要支持刷新按钮

---

## 阶段 2.7：告警中心（最新告警 + 一键确认）

Widget：`alarm_center`

必须实现字段：

- 告警等级
- 告警来源
- 告警时间
- 标题/描述

必须实现动作：

- 查看详情（抽屉或弹窗）
- 一键确认（调用 API，状态回写）

验收标准：

- 最新告警列表可滚动
- 确认后告警状态立即更新

---

## 阶段 2.8：在线设备统计（环形图/柱状图）

Widget：`device_status`

必须实现：

- 在线/离线/故障/维修中 统计
- 支持 2 种视图：环形图 + 柱状图（允许切换）

验收标准：

- 两种图表渲染正确，数据一致
- empty 状态下有明确提示

---

## 阶段 2.9：快捷入口（自定义排序 + 收藏 + 最近访问）

Widget：`quick_entry`

入口建议（至少 5 个）：

- 设备中心
- AI Copilot
- AI Agent
- Workflow
- 数字大屏
- 系统管理

必须实现：

- 自定义排序（拖拽优先；若暂不引入拖拽库，至少支持上下移动）
- 收藏（pin）
- 最近访问（按访问时间记录，展示最近 5 个）

验收标准：

- 排序与收藏可持久化
- 最近访问正确记录

---

## 阶段 2.10：Widget 配置中心（Dashboard 不写死）

必须实现：

- “配置中心”入口（Dashboard 顶部按钮）
- 配置面板支持：
  - Widget 显示/隐藏
  - Widget 排序
  - 刷新时间配置（per-widget）
  - 数据源配置入口（先预留 dataSourceKey）

验收标准：

- 可视化配置生效且持久化
- 配置变更不需要刷新页面即可生效

---

# 五、可选增强（做完主线后再做）

- 欢迎信息（用户信息、时间、天气、今日一句、最近登录）
- 系统公告（公告/更新日志/版本/通知）
- 待办事项（审批/告警处理/AI 未完成任务/Workflow 失败/Agent 异常）
- 地图（设备分布）
- 最近操作（最近访问、编辑、AI 对话、Workflow）

---

# 六、性能约束（最低要求）

- Widget 懒加载（首屏先渲染容器与骨架）
- 图表按需加载
- 请求缓存（避免重复请求）
- 数据缓存（同一数据源复用）

---

# 七、最终验收标准（DoD）

必须全部通过：

- `pnpm install`
- `pnpm dev (admin)`
- Dashboard 可用（布局稳定、Widget 可配置、KPI/告警/设备/趋势至少 4 类模块可见）
- `pnpm lint` 通过
- `pnpm build` 通过

---

# 八、Sprint 2 完成标志

当以下条件成立：

- Dashboard 成为业务入口：KPI + 告警 + 设备 + 趋势可用
- Widget 机制闭环：注册、容器、配置中心、持久化
- AI Native 亮点可见：AI Assistant + 今日摘要落地

👉 Sprint 2 结束
