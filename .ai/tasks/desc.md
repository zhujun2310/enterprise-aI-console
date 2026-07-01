# Sprint 2：Dashboard 功能规划

> Dashboard 不只是一个首页，而是整个平台的业务入口。
>
> 目标：既体现企业级后台能力，又体现 AI Native 平台特色，同时能够覆盖你过去能源 IoT、数字化大屏、AI Agent 等项目经验。

---

# 一、页面布局

```
┌──────────────────────────────────────────────────────────────┐
│ Header                                                       │
├──────────────┬───────────────────────────────────────────────┤
│              │                                               │
│              │ KPI Cards                                     │
│              │                                               │
│ Sidebar      ├──────────────────────────┬────────────────────┤
│              │                          │                    │
│              │ Business Overview        │ AI Assistant       │
│              │                          │                    │
│              ├──────────────────────────┼────────────────────┤
│              │                          │                    │
│              │ Device Status            │ Alarm Center       │
│              │                          │                    │
│              ├──────────────────────────┴────────────────────┤
│              │                                               │
│              │ Realtime Trend                               │
│              │                                               │
└──────────────┴───────────────────────────────────────────────┘
```

---

# 二、功能模块

## 2.1 欢迎信息

- 用户信息
- 当前时间
- 天气（可选）
- 今日一句
- 最近登录时间

---

## 2.2 KPI 数据卡片

展示核心业务指标。

建议：

- 在线设备数量
- 今日告警数量
- AI 调用次数
- 今日工单
- 在线用户
- 系统运行时间

支持：

- 数字动画
- 环比增长
- 同比增长
- 点击跳转

---

## 2.3 快捷入口

例如：

- 设备中心
- AI Copilot
- AI Agent
- Workflow
- 数字大屏
- 拓扑编辑器
- 系统管理

支持：

- 自定义排序
- 收藏
- 最近访问

---

## 2.4 系统公告

展示：

- 公告
- 更新日志
- 最新版本
- 系统通知

---

## 2.5 待办事项

例如：

- 待审批
- 告警处理
- AI 未完成任务
- Workflow 执行失败
- Agent 异常

支持：

- 快速处理
- 一键跳转

---

## 2.6 在线设备统计

展示：

- 在线
- 离线
- 故障
- 维修中

图表：

- 环形图
- 柱状图

---

## 2.7 告警中心

展示：

- 最新告警
- 告警等级
- 告警来源
- 告警时间

支持：

- 查看详情
- 一键确认

---

## 2.8 实时趋势

展示：

- 能耗趋势
- AI 调用趋势
- 在线设备趋势
- 告警趋势

支持：

- 实时刷新
- WebSocket
- SSE

---

## 2.9 地图（可选）

展示：

- 设备分布
- 城市分布
- 在线状态

支持：

- 中国地图
- 世界地图

---

## 2.10 最近操作

展示：

- 最近访问页面
- 最近编辑
- 最近 AI 对话
- 最近 Workflow

---

# 三、AI Dashboard（项目亮点）

这是整个 Dashboard 最重要的亮点，也是区别于普通后台系统的核心。

---

## 3.1 AI Assistant

首页固定 AI 助手。

支持：

- 问答
- 快速搜索
- 页面导航
- 系统帮助

例如：

> 今天有哪些告警？

> 帮我打开设备中心

> 查询最近 AI 调用

---

## 3.2 AI 今日摘要

AI 自动总结：

例如：

今天：

- 新增设备 12 台
- 新增告警 3 条
- AI 调用 258 次
- Workflow 执行成功率 98%

---

## 3.3 AI 推荐

根据用户行为推荐：

例如：

推荐查看：

- 今日告警
- 新设备
- AI Workflow

---

## 3.4 AI 快捷命令

例如：

- 创建 Agent
- 创建 Workflow
- 新建设备
- 新建 Dashboard
- 新建表单

---

## 3.5 AI Prompt 收藏

展示：

用户常用 Prompt：

- 总结今天数据
- 查询设备
- 分析告警
- 生成报表

---

# 四、数据可视化

建议封装统一图表组件。

包括：

- Line
- Bar
- Pie
- Radar
- Gauge
- Liquid
- Sankey
- Heatmap

统一：

packages/charts

---

# 五、实时数据

支持：

- SSE
- WebSocket

实时更新：

- KPI
- Chart
- Alarm
- Device

---

# 六、Widget 系统

Dashboard 不写死。

采用 Widget。

例如：

Dashboard

├── KPI Widget

├── Chart Widget

├── Alarm Widget

├── AI Widget

├── Todo Widget

├── Device Widget

├── News Widget

---

支持：

- 拖拽排序
- 显示隐藏
- 配置刷新时间
- 配置数据源

---

# 七、性能优化

支持：

- Widget 懒加载
- 图表按需加载
- 请求缓存
- 数据缓存
- 虚拟滚动
- KeepAlive
- Suspense

---

# 八、技术实现

建议目录：

apps/admin/src/modules/dashboard/

```
dashboard/
├── api/
├── components/
│   ├── KPI/
│   ├── Widget/
│   ├── Charts/
│   ├── Alarm/
│   ├── Device/
│   ├── AI/
│   └── Todo/
├── composables/
├── store/
├── types/
├── utils/
├── views/
│   └── Dashboard.vue
└── index.ts
```

---

# 九、开发任务

## Task 2.1

- Dashboard 页面框架
- 响应式布局
- Widget 容器

---

## Task 2.2

- KPI 卡片
- 数据动画

---

## Task 2.3

- 图表组件
- 图表封装

---

## Task 2.4

- 实时数据
- SSE
- WebSocket

---

## Task 2.5

- AI Assistant Widget

---

## Task 2.6

- AI 今日摘要

---

## Task 2.7

- 告警中心

---

## Task 2.8

- 在线设备

---

## Task 2.9

- 快捷入口

---

## Task 2.10

- Widget 配置中心

---
