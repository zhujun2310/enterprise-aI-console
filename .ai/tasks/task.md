# Enterprise AI Console 开发任务规划（Epic → Sprint → Task）

> 项目定位：企业级 AI 前端平台（GitHub Showcase + 高级前端面试）
>
> 开发模式：Epic → Sprint → Task → Commit
>
> 开发方式：Vibe Coding（Cursor / Claude Code / Gemini CLI）
>
> 项目目标：完整展示前端架构、工程化、AI 应用落地、可视化、低代码、企业级后台能力。
>
> 唯一执行源：后续功能迭代统一以本文件为准，`.ai/tasks/sprint.md` 仅保留索引说明，不再维护独立规划。

---

# 开发原则

## AI 开发原则

- 每次只开发一个 Task
- 每次只关注一个模块
- Task 必须独立完成
- 每个 Task 完成必须可以运行
- 每个 Task 完成必须提交 Git Commit
- Sprint 完成必须更新 README
- Epic 完成必须更新文档
- 所有代码必须符合 `.ai/core/architecture-principles.md`

---

# Epic 1：基础平台（Foundation）

> 目标：完成企业级基础工程能力建设。

## Sprint 0：项目初始化

### Task 0.1 初始化 Monorepo

- [x] Git 仓库
- [x] pnpm Workspace
- [x] 根 package.json
- [x] TypeScript 配置（tsconfig）
- [x] .gitignore

### Task 0.2 创建 Admin

- [x] React
- [x] Vite
- [x] TypeScript
- [x] UnoCSS
- [x] React Router

### Task 0.3 创建基础 Layout

- [x] Header
- [x] Sidebar
- [x] 主布局（MainLayout）
- [x] 路由出口（RouterView）

### Task 0.4 创建 Server

- [x] Hono
- [x] Health API
- [x] Version API

### Task 0.5 初始化 Packages

- [x] ai-sdk
- [x] auth
- [x] request
- [x] ui
- [x] hooks
- [x] utils
- [x] types
- [x] constants

### Task 0.6 工程化

- [x] ESLint
- [x] Prettier
- [x] Husky
- [x] Commitlint
- [x] lint-staged

### Task 0.7 GitHub Actions

- [x] 构建（Build）
- [x] Lint（Lint）
- [x] CI 流程（CI Workflow）

### Task 0.8 初始化文档

- [x] README
- [x] 架构（Architecture）
- [x] 路线图（Roadmap）

---

## Sprint 1：认证与权限

### Task 1.1 登录

- [x] 登录页（Login）
- [x] 登出（Logout）
- [ ] 记住我（Remember Me）

### Task 1.2 Token

- [x] 存储（Storage）
- [ ] 刷新（Refresh）
- [x] 过期（Expire）

### Task 1.3 用户信息

- [x] 用户状态（User Store）
- [x] Header 用户信息（Header User）
- [ ] 头像（Avatar）

### Task 1.4 RBAC

- [x] 用户（User）
- [x] 角色（Role）
- [x] 权限（Permission）

### Task 1.5 Router Guard

- [x] 路由守卫（Route Guard）
- [ ] 动态路由（Dynamic Route）

### Task 1.6 Menu

- [x] 动态菜单（Dynamic Menu）
- [x] 权限菜单（Permission Menu）

### Task 1.7 Directive

- [ ] v-permission
- [x] hasPermission()

### Task 1.8 Auth API

- [x] 登录 API（Login API）
- [x] 用户 API（User API）
- [x] JWT 中间件（JWT Middleware）

---

## Sprint 2：Dashboard

### Task 2.1 Dashboard 页面框架

- [x] Dashboard 页面框架（Header / Sidebar / Content）
- [x] 响应式布局（栅格断点）
- [x] Widget 容器（布局区域 + Widget Registry）
- [ ] 基础 Widget：欢迎信息（用户信息 / 当前时间 / 最近登录）
- [ ] 基础 Widget：系统公告（公告 / 更新日志 / 系统通知）
- [ ] 基础 Widget：最近操作（最近访问 / 最近编辑 / 最近 AI 对话 / 最近 Workflow）

### Task 2.2 KPI 卡片

- [x] KPI Cards（在线设备 / 今日告警 / AI 调用次数 / 今日工单 / 在线用户 / 系统运行时间）
- [x] 数字动画（CountUp）
- [x] 环比 / 同比增长展示
- [x] 点击跳转（路由导航）

### Task 2.3 图表组件与趋势

- [x] 统一图表组件封装（Line / Bar / Pie）
- [x] Realtime Trend：能耗 / AI 调用 / 在线设备 / 告警趋势
- [x] 图表状态：Loading / Empty / Error
- [ ] 图表按需加载（Lazy import）

### Task 2.4 实时数据

- [x] SSE（订阅 / 断线重连）
- [ ] WebSocket（订阅 / 心跳 / 断线重连）
- [x] Dashboard 数据实时更新：KPI / Chart / Alarm / Device

### Task 2.5 AI Assistant Widget

- [x] 首页固定 AI 助手面板（Q&A）
- [x] 快速搜索（页面 / 功能）
- [x] 页面导航（打开模块指令）
- [x] 系统帮助与快捷命令（占位）

### Task 2.6 AI 今日摘要

- [x] AI 自动总结今日数据（新增设备 / 新增告警 / AI 调用 / Workflow 成功率）
- [x] 摘要卡片展示与刷新
- [ ] AI 推荐（根据行为推荐：告警 / 新设备 / Workflow）
- [ ] AI Prompt 收藏（常用 Prompt 列表）

### Task 2.7 告警中心

- [x] 最新告警列表（等级 / 来源 / 时间）
- [x] 查看详情（跳转或抽屉）
- [x] 一键确认

### Task 2.8 在线设备统计

- [x] 在线 / 离线 / 故障 / 维修中统计
- [x] 环形图 / 柱状图展示
- [ ] 点击跳转（设备中心）

### Task 2.9 快捷入口

- [ ] 快捷入口：设备中心 / AI Copilot / AI Agent / Workflow / 数字大屏 / 拓扑编辑器 / 系统管理
- [x] 收藏 / 最近访问
- [ ] 自定义排序

### Task 2.10 Widget 配置中心

- [ ] Widget 拖拽排序
- [x] 显示 / 隐藏
- [x] 刷新时间配置
- [ ] 数据源配置（占位）

---

# Epic 2：IoT 与可视化平台

> 目标：体现大型企业项目经验。

## Sprint 3：设备中心

### Task 3.1 设备列表

- [x] 表格（Table）
- [x] 搜索（Search）
- [x] 筛选（Filter）

### Task 3.2 设备详情

- [x] 基础信息（Basic）
- [x] 属性（Property）
- [x] 状态（Status）

### Task 3.3 实时监控

- [x] 监控（Monitor）
- [x] 图表（Chart）
- [x] 历史（History）

### Task 3.4 告警中心

- [x] 告警列表（Alarm List）
- [x] 告警详情（Alarm Detail）
- [x] 告警等级（Alarm Level）

### Task 3.5 设备运维

- [x] 分组（Group）
- [x] 操作日志（Operation Log）
- [x] 批量操作（Batch Action）

---

## Sprint 4：数字化大屏

### Task 4.1 大屏框架

- [ ] 布局（Layout）
- [ ] Header
- [ ] 全屏（FullScreen）

### Task 4.2 图表组件

- [ ] ECharts
- [ ] 地图（Map）
- [ ] 仪表盘（Gauge）

### Task 4.3 实时刷新

- [ ] 数据流（Stream）
- [ ] 自动刷新（Auto Refresh）

### Task 4.4 大屏配置

- [ ] Widget（Widget）
- [ ] 布局（Layout）
- [ ] 主题（Theme）

### Task 4.5 模板与联动

- [ ] 模板（Template）
- [ ] 轮播（Carousel）
- [ ] 数据联动（Data Linkage）

---

## Sprint 5：拓扑编辑器

### Task 5.1 Graph

- [ ] 画布（Canvas）
- [ ] 节点（Node）
- [ ] 连线（Edge）

### Task 5.2 Editor

- [ ] 拖拽（Drag）
- [ ] 连线（Connect）
- [ ] 删除（Delete）

### Task 5.3 AI Topology

- [ ] 生成（Generate）
- [ ] 布局（Layout）
- [ ] 导入（Import）
- [ ] 导出（Export）

---

# Epic 3：AI 平台

> 目标：体现 AI Native Application 能力。

## Sprint 6：AI SDK

### Task 6.1 AI Client

- [ ] 对话（Chat）
- [ ] 流式（Stream）

### Task 6.2 多模型

- [ ] OpenAI
- [ ] DeepSeek
- [ ] Qwen
- [ ] Gemini

### Task 6.3 Prompt

- [ ] 构建器（Builder）
- [ ] 模板（Template）
- [ ] 管理（Manager）

### Task 6.4 Tool Calling

- [ ] 注册表（Registry）
- [ ] 执行器（Executor）

### Task 6.5 Function Calling

- [ ] Schema（Schema）
- [ ] 调度器（Dispatcher）

### Task 6.6 Output 与配置

- [ ] 结构化输出（Structured Output）
- [ ] Token 统计（Token Usage）
- [ ] Provider 配置（Provider Config）

---

## Sprint 7：AI Copilot

### Task 7.1 Chat UI

- [ ] 消息（Message）
- [ ] Markdown（Markdown）
- [ ] 代码高亮（Code Highlight）

### Task 7.2 Session

- [ ] 历史（History）
- [ ] 上下文（Context）
- [ ] 搜索（Search）

### Task 7.3 File

- [ ] 上传（Upload）
- [ ] 预览（Preview）

### Task 7.4 Prompt

- [ ] 模板（Template）
- [ ] 收藏（Favorite）

### Task 7.5 引用来源

- [ ] 引用（Citation）
- [ ] 来源面板（Source Panel）

---

## Sprint 8：AI Agent

### Task 8.1 Agent

- [ ] 增删改查（CRUD）
- [ ] 配置（Config）

### Task 8.2 Tool

- [ ] 注册（Registry）
- [ ] 执行（Execute）

### Task 8.3 Memory

- [ ] 会话（Session）
- [ ] 上下文（Context）

### Task 8.4 Workflow

- [ ] 规划（Planning）
- [ ] 执行（Execute）

### Task 8.5 多 Agent 协作

- [ ] 协作（Collaboration）
- [ ] 交接（Handoff）

### Task 8.6 Agent 调试

- [ ] 调试（Debug）
- [ ] 日志（Log）

---

## Sprint 9：AI Workflow

### Task 9.1 Designer

- [ ] 节点（Node）
- [ ] 连线（Edge）

### Task 9.2 Runtime

- [ ] 执行（Execute）
- [ ] 调试（Debug）

### Task 9.3 Template

- [ ] 工作流模板（Workflow Template）

### Task 9.4 Publish

- [ ] 条件（Condition）
- [ ] 发布（Publish）
- [ ] 版本（Version）

---

# Epic 4：低代码平台

> 目标：体现复杂前端能力。

## Sprint 10：AI Form

### Task 10.1 JSON Schema

- [ ] Schema 模型（Schema Model）
- [ ] UI Schema（UI Schema）
- [ ] 校验规则（Validation Rule）

### Task 10.2 Form Renderer

- [ ] 字段渲染（Field Renderer）
- [ ] 布局渲染（Layout Renderer）
- [ ] 规则引擎（Rule Engine）

### Task 10.3 AI Form Generate

- [ ] Prompt 生成（Prompt Generate）
- [ ] Schema 转换（Schema Convert）
- [ ] 草稿输出（Draft Output）

### Task 10.4 Form Preview

- [ ] 桌面预览（Desktop Preview）
- [ ] 移动预览（Mobile Preview）
- [ ] 提交模拟（Submit Mock）

---

## Sprint 11：可视化编辑器

### Task 11.1 Canvas

- [ ] 舞台（Stage）
- [ ] 选择（Selection）
- [ ] 对齐线（Snapline）

### Task 11.2 Drag

- [ ] 拖入添加（Drag Add）
- [ ] 调整尺寸（Resize）
- [ ] 排序（Sort）

### Task 11.3 Layer

- [ ] 层级树（Tree）
- [ ] 锁定（Lock）
- [ ] 可见（Visible）

### Task 11.4 Component Library

- [ ] 基础组件（Basic Widget）
- [ ] 业务组件（Business Widget）
- [ ] 注册（Registration）

### Task 11.5 Animation

- [ ] 入场（Entrance）
- [ ] 过渡（Transition）
- [ ] 时间轴（Timeline）

---

# Epic 5：企业后台能力

> 目标：完善企业级后台系统。

## Sprint 12：系统管理

### Task 12.1 用户

- [ ] 用户列表（User List）
- [ ] 用户创建（User Create）
- [ ] 用户状态（User Status）

### Task 12.2 角色

- [ ] 角色 CRUD（Role CRUD）
- [ ] 权限绑定（Permission Bind）
- [ ] 菜单绑定（Menu Bind）

### Task 12.3 权限

- [ ] 权限树（Permission Tree）
- [ ] 操作权限（Action Permission）
- [ ] 路由权限（Route Permission）

### Task 12.4 菜单

- [ ] 菜单树（Menu Tree）
- [ ] 路由 Meta（Route Meta）
- [ ] 可见性（Visibility）

### Task 12.5 部门

- [ ] 部门树（Department Tree）
- [ ] 成员绑定（Member Bind）
- [ ] 数据范围（Data Scope）

### Task 12.6 字典

- [ ] 字典类型（Dict Type）
- [ ] 字典项（Dict Item）
- [ ] 字典缓存（Dict Cache）

### Task 12.7 参数配置

- [ ] 参数 CRUD（Config CRUD）
- [ ] 参数分组（Config Group）
- [ ] 参数审计（Config Audit）

### Task 12.8 审计日志

- [ ] 审计事件（Audit Event）
- [ ] 审计查询（Audit Query）
- [ ] 审计对比（Audit Diff）

### Task 12.9 登录日志

- [ ] 登录记录（Login Record）
- [ ] 设备 IP（Device IP）
- [ ] 导出（Export）

---

## Sprint 13：文件与通知

### Task 13.1 文件中心

- [ ] 文件上传（File Upload）
- [ ] 文件预览（File Preview）
- [ ] 文件分类（File Category）

### Task 13.2 通知中心

- [ ] 收件箱（Inbox）
- [ ] 模板（Template）
- [ ] 投递（Delivery）

### Task 13.3 日志中心

- [ ] 操作日志（Operation Log）
- [ ] 访问日志（Access Log）
- [ ] 日志检索（Log Search）

### Task 13.4 系统设置

- [ ] 个人信息（Profile）
- [ ] 安全设置（Security）
- [ ] 偏好设置（Preference）

---

# Epic 6：数据层与基础设施

> 目标：完善后端支撑能力。

## Sprint 14：数据库

### Task 14.1 SQLite

- [ ] 连接（Connection）
- [ ] 表结构（Schema）
- [ ] 索引（Index）

### Task 14.2 Drizzle ORM

- [ ] ORM 初始化（ORM Init）
- [ ] 模型映射（Model Mapping）
- [ ] 仓储层（Repository）

### Task 14.3 Migration

- [ ] 生成（Generate）
- [ ] 应用（Apply）
- [ ] 回滚（Rollback）

### Task 14.4 Seed

- [ ] 用户 Seed（User Seed）
- [ ] RBAC Seed（RBAC Seed）
- [ ] 演示 Seed（Demo Seed）

---

## Sprint 15：数据模型

### Task 15.1 User

- [ ] 资料模型（Profile Model）
- [ ] 凭证模型（Credential Model）
- [ ] 状态模型（Status Model）

### Task 15.2 RBAC

- [ ] 角色模型（Role Model）
- [ ] 权限模型（Permission Model）
- [ ] 关系模型（Relation Model）

### Task 15.3 AI Session

- [ ] 会话模型（Session Model）
- [ ] 消息模型（Message Model）
- [ ] 上下文模型（Context Model）

### Task 15.4 Agent

- [ ] Agent 模型（Agent Profile）
- [ ] 工具绑定（Tool Binding）
- [ ] 运行时配置（Runtime Config）

### Task 15.5 Workflow

- [ ] 节点模型（Node Model）
- [ ] 连线模型（Edge Model）
- [ ] 版本模型（Version Model）

### Task 15.6 Dashboard

- [ ] Widget 配置（Widget Config）
- [ ] 布局配置（Layout Config）
- [ ] 筛选配置（Filter Config）

---

## Sprint 16：BFF

### Task 16.1 API Gateway

- [ ] 路由代理（Route Proxy）
- [ ] 错误规范化（Error Normalize）
- [ ] 鉴权透传（Auth Forward）

### Task 16.2 Auth Middleware

- [ ] JWT 校验（JWT Verify）
- [ ] 权限守卫（Permission Guard）
- [ ] 会话上下文（Session Context）

### Task 16.3 AI Proxy

- [ ] 模型代理（Model Proxy）
- [ ] 流式代理（Stream Proxy）
- [ ] 成本控制（Cost Control）

### Task 16.4 SSE

- [ ] 事件通道（Event Channel）
- [ ] 重连（Reconnect）
- [ ] 心跳（Heartbeat）

### Task 16.5 Cache

- [ ] Key 策略（Key Strategy）
- [ ] TTL（TTL）
- [ ] 失效策略（Invalidation）

### Task 16.6 API Aggregation

- [ ] Dashboard 聚合（Dashboard Aggregate）
- [ ] 详情聚合（Detail Aggregate）
- [ ] 批量拉取（Batch Fetch）

### Task 16.7 Logging

- [ ] 访问日志（Access Log）
- [ ] 错误日志（Error Log）
- [ ] TraceId（Trace ID）

### Task 16.8 Rate Limit

- [ ] 令牌桶（Token Bucket）
- [ ] 用户粒度（User Scope）
- [ ] IP 粒度（IP Scope）

---

# Epic 7：工程化与交付

> 目标：达到企业级交付标准。

## Sprint 17：测试

### Task 17.1 Unit Test

- [ ] 工具函数（Utils）
- [ ] 状态管理（Store）
- [ ] 认证模块（Auth）

### Task 17.2 Component Test

- [ ] 页面（Page）
- [ ] 布局（Layout）
- [ ] 权限门禁（Permission Gate）

### Task 17.3 E2E

- [ ] 登录流程（Login Flow）
- [ ] 路由守卫（Route Guard）
- [ ] 核心链路（Core Journey）

### Task 17.4 API Test

- [ ] 认证 API（Auth API）
- [ ] 用户 API（User API）
- [ ] 权限 API（Permission API）

### Task 17.5 AI Test

- [ ] SDK 契约（SDK Contract）
- [ ] 流式响应（Stream Response）
- [ ] 工具链路（Tool Flow）

### Task 17.6 Coverage

- [ ] 阈值（Threshold）
- [ ] 报告（Report）
- [ ] CI 门禁（CI Gate）

---

## Sprint 18：部署

### Task 18.1 Docker

- [ ] Admin 镜像（Admin Image）
- [ ] Server 镜像（Server Image）
- [ ] 多阶段构建（Multi Stage）

### Task 18.2 Docker Compose

- [ ] 本地编排（Local Stack）
- [ ] 环境文件（Env File）
- [ ] 数据卷（Volume）

### Task 18.3 Nginx

- [ ] 反向代理（Reverse Proxy）
- [ ] 静态资源（Static Serve）
- [ ] Gzip（Gzip）

### Task 18.4 Deployment

- [ ] 发布流程（Release Flow）
- [ ] 环境拆分（Env Split）
- [ ] 回滚（Rollback）

### Task 18.5 Kubernetes

- [ ] Deployment（Deployment）
- [ ] Service（Service）
- [ ] Ingress（Ingress）

### Task 18.6 Helm

- [ ] Chart（Chart）
- [ ] Values（Values）
- [ ] 环境覆盖（Env Overlay）

### Task 18.7 Env Config

- [ ] 环境策略（Env Strategy）
- [ ] Secret 配置（Secret Config）
- [ ] 运行时注入（Runtime Inject）

### Task 18.8 Script

- [ ] 初始化脚本（Bootstrap）
- [ ] 发布脚本（Release）
- [ ] 健康检查（Health Check）

---

## Sprint 19：文档

### Task 19.1 VitePress

- [ ] 站点初始化（Site Init）
- [ ] 导航与侧边栏（Nav Sidebar）
- [ ] 部署（Deploy）

### Task 19.2 API

- [ ] 认证 API 文档（Auth API Doc）
- [ ] AI API 文档（AI API Doc）
- [ ] 示例（Example）

### Task 19.3 Architecture

- [ ] Monorepo（Monorepo）
- [ ] 前端（Frontend）
- [ ] BFF（BFF）

### Task 19.4 ADR

- [ ] ADR 模板（ADR Template）
- [ ] ADR 记录（ADR Record）
- [ ] ADR 索引（ADR Index）

### Task 19.5 Interview

- [ ] 亮点（Highlight）
- [ ] 问答（QA）
- [ ] 讲述线（Storyline）

### Task 19.6 Modules

- [ ] Admin 模块（Admin Module）
- [ ] AI 模块（AI Module）
- [ ] IoT 模块（IoT Module）

### Task 19.7 Deployment

- [ ] Docker 指南（Docker Guide）
- [ ] Compose 指南（Compose Guide）
- [ ] Kubernetes 指南（Kubernetes Guide）

### Task 19.8 Development Guide

- [ ] 初始化（Setup）
- [ ] 规范（Convention）
- [ ] 流程（Workflow）

---

## Sprint 20：GitHub Showcase

### Task 20.1 README

- [ ] 概览（Overview）
- [ ] 特性矩阵（Feature Matrix）
- [ ] 快速开始（Quick Start）

### Task 20.2 在线 Demo

- [ ] 预览部署（Preview Deploy）
- [ ] 访问指南（Access Guide）
- [ ] Demo 账号（Demo Account）

### Task 20.3 项目截图

- [ ] Admin 截图（Admin Shot）
- [ ] AI 截图（AI Shot）
- [ ] IoT 截图（IoT Shot）

### Task 20.4 架构图

- [ ] 系统架构图（System Diagram）
- [ ] 前端架构图（Frontend Diagram）
- [ ] 部署架构图（Deployment Diagram）

### Task 20.5 演示视频

- [ ] 脚本（Script）
- [ ] 录制（Recording）
- [ ] 章节（Chapter）

### Task 20.6 面试指南

- [ ] 简历要点（Resume Bullet）
- [ ] 问题清单（Question List）
- [ ] 项目讲述（Project Pitch）

### Task 20.7 Demo Data

- [ ] 种子数据（Seed Data）
- [ ] 场景（Scenario）
- [ ] 重置（Reset）

### Task 20.8 Tech Highlights

- [ ] 架构亮点（Architecture Highlight）
- [ ] 工程化亮点（Engineering Highlight）
- [ ] AI Native 亮点（AI Native Highlight）

### Task 20.9 Star History

- [ ] 徽章（Badge）
- [ ] 图表（Chart）
- [ ] 增长说明（Growth Note）

---

# Epic 8：平台体验与扩展

> 目标：补齐平台级体验能力与扩展能力，增强可维护性与可演示性。

## Sprint 21：性能优化

### Task 21.1 路由性能

- [ ] 路由懒加载（Lazy Route）
- [ ] 预取（Prefetch）

### Task 21.2 渲染性能

- [ ] 虚拟列表（Virtual List）
- [ ] Memo 策略（Memo Strategy）

### Task 21.3 计算与并发

- [ ] Web Worker（Web Worker）
- [ ] 并发 UI（Concurrent UI）

### Task 21.4 资源优化

- [ ] 包分析（Bundle Analyze）
- [ ] 分包（Split Chunk）
- [ ] 缓存策略（Cache Strategy）

---

## Sprint 22：插件系统

### Task 22.1 Plugin SDK

- [ ] 清单（Manifest）
- [ ] 生命周期（Lifecycle）

### Task 22.2 Plugin Runtime

- [ ] 注册表（Registry）
- [ ] 加载器（Loader）

### Task 22.3 Plugin Marketplace

- [ ] 目录（Catalog）
- [ ] 安装（Install）

### Task 22.4 Plugin Permission

- [ ] 权限范围（Scope）
- [ ] 沙箱（Sandbox）

---

## Sprint 23：多租户

### Task 23.1 Tenant

- [ ] 增删改查（CRUD）
- [ ] 切换（Switch）

### Task 23.2 Data Isolation

- [ ] 租户数据（Tenant Data）
- [ ] 租户配置（Tenant Config）

### Task 23.3 Permission Isolation

- [ ] 租户角色（Tenant Role）
- [ ] 租户菜单（Tenant Menu）

### Task 23.4 AI Isolation

- [ ] 模型配置（Model Config）
- [ ] Prompt 配置（Prompt Config）

---

## Sprint 24：国际化

### Task 24.1 i18n

- [ ] Locale（Locale）
- [ ] 文案包（Message Bundle）

### Task 24.2 Language Switch

- [ ] 切换（Toggle）
- [ ] 持久化（Persistence）

### Task 24.3 Dynamic Resource

- [ ] 文案懒加载（Lazy Message）
- [ ] 模块语言包（Module Locale）

### Task 24.4 DateTime

- [ ] 日期格式（Date Format）
- [ ] 数字格式（Number Format）

---

## Sprint 25：主题系统

### Task 25.1 Base Theme

- [ ] 浅色（Light）
- [ ] 深色（Dark）

### Task 25.2 Brand Theme

- [ ] 品牌 Token（Brand Token）
- [ ] 自定义主题（Custom Theme）

### Task 25.3 Design Token

- [ ] 颜色（Color）
- [ ] 间距（Space）
- [ ] 圆角（Radius）

### Task 25.4 Theme Runtime

- [ ] 切换（Switch）
- [ ] 持久化（Persistence）

---

## Sprint 26：监控中心

### Task 26.1 Performance Monitor

- [ ] Web Vitals（Web Vitals）
- [ ] 资源耗时（Resource Timing）

### Task 26.2 Error Monitor

- [ ] 前端错误（Frontend Error）
- [ ] API 错误（API Error）

### Task 26.3 Behavior Analytics

- [ ] 用户事件（User Event）
- [ ] 会话回放（Session Replay）

### Task 26.4 AI Observability

- [ ] Token 指标（Token Metrics）
- [ ] Tool 指标（Tool Metrics）

---

# Epic 9：企业能力与行业应用

> 目标：增强企业级能力，补齐面向真实业务场景的 AI 应用落地能力。

## Sprint 27：企业能力

### Task 27.1 审计与审批

- [ ] 审计日志（Audit Log）
- [ ] 审批流（Approval Flow）

### Task 27.2 数据权限

- [ ] 范围（Scope）
- [ ] 策略（Policy）

### Task 27.3 单点登录

- [ ] SSO（SSO）
- [ ] OAuth2（OAuth2）
- [ ] OIDC（OIDC）

---

## Sprint 28：AI 企业应用

### Task 28.1 AI 客服

- [ ] 对话服务（Chat Service）
- [ ] 工单辅助（Ticket Assist）

### Task 28.2 AI 助手

- [ ] 工作台助手（Workspace Assistant）
- [ ] 动作建议（Action Suggestion）

### Task 28.3 AI 知识库

- [ ] RAG（RAG）
- [ ] 文档解析（Document Parse）

### Task 28.4 AI 分析与报告

- [ ] 总结（Summary）
- [ ] 分析（Analysis）
- [ ] 报告（Report）

---

# 项目里程碑（Milestone）

| Milestone | 对应 Epic | 目标                                      |
| --------- | --------- | ----------------------------------------- |
| M1        | Epic 1    | 基础平台完成                              |
| M2        | Epic 2    | IoT 与可视化能力完成                      |
| M3        | Epic 3    | AI 平台完成                               |
| M4        | Epic 4    | 低代码平台完成                            |
| M5        | Epic 5    | 企业后台能力完成                          |
| M6        | Epic 6    | 数据层与 BFF 完成                         |
| M7        | Epic 7    | 工程化交付完成，达到 GitHub Showcase 标准 |
| M8        | Epic 8    | 平台体验与扩展能力完成                    |
| M9        | Epic 9    | 企业能力与行业 AI 应用完成                |

---

# Task 完成标准（Definition of Done）

每个 Task 完成后必须满足：

- [ ] 功能开发完成
- [ ] 类型检查通过
- [ ] ESLint 无错误
- [ ] Build 成功
- [ ] 单元测试通过（适用时）
- [ ] 更新 README
- [ ] 更新 CHANGELOG
- [ ] 更新 Roadmap
- [ ] Git Commit（Conventional Commit）
- [ ] 自检符合 `.ai/core/architecture-principles.md`
- [ ] 可以进入下一个 Task
