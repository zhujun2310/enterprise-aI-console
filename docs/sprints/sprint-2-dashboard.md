# Sprint 2：Dashboard 交付记录

## 目标

Sprint 2 负责把首页从普通后台入口升级为 AI Native 业务入口，目标包括：

- Widget 化 Dashboard 框架
- KPI、设备、告警、趋势等核心业务首页
- Widget 配置与持久化
- 实时数据更新
- AI Assistant 首页亮点
- AI 今日摘要

## 已交付内容

### 1. Dashboard 模块化目录

Dashboard 代码已集中在：

- `apps/admin/src/modules/dashboard/api/`
- `apps/admin/src/modules/dashboard/components/`
- `apps/admin/src/modules/dashboard/composables/`
- `apps/admin/src/modules/dashboard/store/`
- `apps/admin/src/modules/dashboard/types/`
- `apps/admin/src/modules/dashboard/views/Dashboard.tsx`
- `apps/admin/src/modules/dashboard/widgets.tsx`

这意味着 Sprint 2 已按模块边界独立，而不是散落在全局页面中。

### 2. Widget 机制闭环

当前首页已建立完整 Widget 机制：

- `WidgetGrid`：负责响应式栅格布局
- `WidgetContainer`：统一标题、刷新、状态与内容壳层
- `WidgetDefinition`：注册表定义
- `WidgetLayout`：布局与排序
- `WidgetUserConfig`：显示状态与刷新间隔
- `WidgetConfigPanel`：配置中心入口
- `widgetConfig.ts`：本地持久化与排序逻辑

当前支持：

- Widget 显示/隐藏
- 上下移动排序
- 单 Widget 刷新间隔配置
- localStorage 持久化

### 3. KPI 卡片

当前已实现 `KPI Cards` Widget，支持：

- 多个核心指标展示
- 数字动画
- MoM / YoY 趋势展示
- 点击后跳转到业务页面

当前指标包括：

- 在线设备
- 今日告警
- AI 调用
- 今日工单
- 在线用户
- 系统运行时长

### 4. 图表与可视化

当前 Dashboard 已落地图表能力：

- `EChart` 封装组件
- 设备状态图表
- 实时趋势图表

当前可视化能力包括：

- 环形图
- 柱状图
- 趋势折线图

说明：

- 图表封装当前位于 `apps/admin/src/modules/dashboard/components/charts/EChart.tsx`
- 尚未抽离到独立 `packages/charts`，但页面侧已经通过统一封装消费，而不是直接散落图表配置

### 5. 实时数据能力

Sprint 2 已实现基于 SSE 的实时更新方案。

服务端接口：

- `GET /dashboard/snapshot`
- `GET /dashboard/ai/daily-summary`
- `GET /sse/dashboard`

前端能力：

- `useSse` 统一连接管理
- Dashboard 首次快照拉取
- SSE 实时事件更新
- 页面聚焦和可见性恢复后的被动刷新

当前事件类型包括：

- `kpi:update`
- `device:status`
- `alarm:new`
- `alarm:update`
- `trend:point`

### 6. AI Assistant Widget

首页右侧已实现规则驱动版 `AI Assistant`：

- 消息列表
- 输入框
- 发送态
- 预置示例指令

当前可处理的能力包括：

- 告警摘要问答
- AI 调用查询
- 趋势摘要
- 页面导航
- 帮助指令

典型可运行示例：

- `今天有哪些告警？`
- `帮我打开设备中心`
- `查询最近 AI 调用`
- `帮助`

### 7. AI 今日摘要

`AI 今日摘要` Widget 已实现：

- 当日新增设备
- 当日新增告警
- AI 调用量
- Workflow 成功率
- 刷新入口

数据来源当前由 server 侧摘要接口返回。

### 8. 告警中心 Widget

首页已具备轻量告警中心能力：

- 最新告警列表
- 告警等级展示
- 告警来源展示
- 告警时间展示
- 详情弹层
- 一键确认

服务端已提供告警确认接口：

- `POST /dashboard/alarms/:alarmId/ack`

### 9. 在线设备统计 Widget

设备状态 Widget 已实现：

- 在线
- 离线
- 故障
- 维修中

并支持两种视图切换：

- Pie
- Bar

### 10. 快捷入口 Widget

`Quick Entry` 已沉淀常用业务入口：

- 设备中心
- AI Copilot
- AI Agent
- Workflow
- 数字大屏
- 系统管理

当前支持：

- pin / unpin
- 最近访问记录
- localStorage 持久化

### 11. 其他辅助 Widget

除任务主线外，当前首页还包含：

- `Business Overview`
- `System Status`

用于补充时间、用户、角色、实时连接状态等运行信息。

## 关键文件

- `apps/admin/src/modules/dashboard/views/Dashboard.tsx`
- `apps/admin/src/modules/dashboard/widgets.tsx`
- `apps/admin/src/modules/dashboard/components/WidgetGrid.tsx`
- `apps/admin/src/modules/dashboard/components/WidgetContainer.tsx`
- `apps/admin/src/modules/dashboard/components/WidgetConfigPanel.tsx`
- `apps/admin/src/modules/dashboard/components/charts/EChart.tsx`
- `apps/admin/src/modules/dashboard/composables/useSse.ts`
- `apps/admin/src/modules/dashboard/store/widgetConfig.ts`
- `apps/admin/src/modules/dashboard/api/dashboard.ts`
- `server/src/dashboard.ts`
- `server/src/index.ts`

## 当前可验证结果

从当前仓库状态看，Sprint 2 已达到“可演示、可交互、可实时更新”的首页交付标准：

- `/dashboard` 可正常访问并受 `dashboard:view` 权限控制
- 首页已具备多个可配置 Widget
- Dashboard 数据既支持快照加载，也支持 SSE 实时更新
- AI Assistant 与 AI 今日摘要已作为首页亮点落地

## 范围说明

当前实现与原始目标相比，保留了少量工程化上的简化：

- Widget 排序为“上下移动”，不是拖拽排序
- 图表能力已统一封装，但尚未独立抽离到 `packages/charts`
- AI Assistant 当前为规则驱动版本，不依赖真实大模型

这些都是当前实现中的有意识取舍，不影响 Sprint 2 作为首页模块的交付完整性。
