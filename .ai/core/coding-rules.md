# 编码规范

所有代码遵循：

## TypeScript

开启 strict。

禁止 any。

优先使用 interface。

必须补充类型。

---

## React

函数组件优先。

使用 Hooks 组织状态与副作用。

组件职责单一。

认证与权限状态优先使用 `AuthProvider + useAuthStore()`。

页面内局部交互使用 `useState / useMemo / useCallback / useEffect`。

菜单、权限、角色优先使用派生数据，不维护重复状态。

路由守卫统一放在 `src/router/index.tsx`。

按钮权限统一使用条件渲染或 `PermissionGate` 模式。

禁止 class component。

---

## 文件命名

组件：

PascalCase

工具：

camelCase

Hooks：

useXXX.ts

Provider / Store：

`stores/*.tsx`

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
