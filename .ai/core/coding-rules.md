# 编码规范

所有代码遵循：

## TypeScript

开启 strict。

禁止 any。

优先使用 interface。

必须补充类型。

---

## Vue

Composition API。

<script setup>。

组件职责单一。

状态统一交给 Pinia。

禁止 Options API。

---

## 文件命名

组件：

PascalCase

工具：

camelCase

Hooks：

useXXX.ts

Store：

xxx.store.ts

---

## Import

统一使用 alias。

禁止 ../../../../

统一：

@/

@packages/

---

## 注释

只解释为什么。

不要解释代码。

---

## AI

业务不得直接调用模型。

统一：

packages/ai-sdk

调用。

---

## 每完成一个模块

生成：

README

测试

类型

导出
