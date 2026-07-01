# ADR

Architecture decision records.

## ADR 是什么

ADR（Architecture Decision Record）用于记录关键的架构决策，回答：

- 我们做了什么选择？
- 为什么这么选？
- 有哪些备选方案？
- 选择带来了什么后果（收益/代价）？

相比把决策写在聊天记录或 PR 描述里，ADR 更适合长期沉淀与复盘。

## 什么时候写 ADR

当出现以下情况之一，就建议写 ADR：

- 引入新的基础设施或关键依赖（例如图表库、状态管理、鉴权方式）
- 选择某种通信或数据流方案（例如 SSE vs WebSocket）
- 制定跨模块的约束（例如 Widget 机制、权限边界、Mock 策略）

## ADR 文件命名

建议使用：

`NNNN-title.md`

例如：

- `0001-tech-stack.md`
- `0002-realtime-sse.md`
- `0003-mock-data-strategy.md`

## ADR 模板

```md
# ADR NNNN: <Title>

## Status

Accepted | Proposed | Deprecated

## Context

要解决的问题、背景与约束。

## Decision

最终做出的选择。

## Alternatives

备选方案与取舍。

## Consequences

该选择带来的后果：正面/负面/风险与缓解手段。
```

## 当前 ADR 列表

- `0001` 技术栈与 Monorepo 选择
- `0002` Dashboard 实时方案选择（SSE）
- `0003` 业务模块 Mock 数据策略（先闭环后接真接口）
