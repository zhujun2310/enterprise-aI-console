# Interview

项目讲解与面试材料（用于快速、稳定地讲清“做了什么、为什么这么做、结果如何”）。

## 一句话介绍

Enterprise AI Console 是一个企业级后台管理项目，采用 Monorepo 组织，具备 RBAC 权限闭环、AI Native Dashboard（Widget + 实时 + 可视化 + AI Assistant）以及 IoT 设备中心主链路（列表-详情-监控-告警-运维），用于体现工程化与业务架构能力。

## Demo 顺序（建议）

### 1) 登录与权限

- 用 `admin` 登录（全权限）
- 观察菜单项与可访问路由
- 切换为 `viewer` 登录（只读权限），对比可见菜单和受限页面

要点：

- 前端路由门禁 + 服务端 API 鉴权双重生效（401/403）
- 菜单与按钮按权限过滤

### 2) Dashboard（AI Native 首页）

- 打开 `/dashboard`
- 展示 Widget 机制：配置中心 -> 显示/隐藏、排序、刷新间隔
- 展示实时：Realtime 状态显示，数据会更新（SSE）
- 展示告警中心：查看详情、Ack
- 展示 AI Assistant：输入示例指令（告警摘要、导航、AI 调用）
- 展示 AI 今日摘要：刷新摘要卡片

要点：

- 先快照后 SSE，保证“可用 + 实时”
- Widget 容器统一三态与统一交互

### 3) 设备中心（IoT 主链路）

- 设备列表：搜索/筛选/分页/排序/固定列
- 设备详情：基础信息、属性、状态、最近告警、最近操作
- 实时监控：趋势图/仪表盘/历史曲线/Mock 刷新
- 告警中心：筛选与状态流转
- 运维中心：分组统计、操作日志查询、批量操作

要点：

- 业务闭环完整，且模块化收敛清晰
- Mock 数据层具备分页、筛选、状态回写与批量动作，便于后续接真实接口

## 常见问题与回答要点

### Q1：为什么用 Monorepo？

- 模块与能力层边界清晰（apps/server/packages）
- 公共能力（auth/types/utils）可复用、可版本化
- 统一 lint/build 约束，便于 CI

### Q2：RBAC 怎么保证“前后端一致”？

- 前端：路由门禁 + 菜单过滤 + 按钮条件渲染
- 后端：`requireAuth` + `requirePermission` 统一中间件

### Q3：实时数据为什么选 SSE？

- 实现成本低、易部署、穿透代理更简单
- 满足 Dashboard 的单向推送需求
- WebSocket 作为后续增强可扩展

### Q4：AI Assistant 为什么是规则版？

- 先把“入口形态、交互闭环、导航与摘要能力”做成稳定的产品框架
- 便于后续替换为真实大模型/Agent，而不重写 UI 与数据流

## 关键文件（用于讲解时跳转）

- RBAC：`packages/auth`、`apps/admin/src/stores/auth.tsx`、`server/src/auth/*`
- Dashboard：`apps/admin/src/modules/dashboard/views/Dashboard.tsx`、`server/src/dashboard.ts`
- Device Center：`apps/admin/src/modules/device/*`
