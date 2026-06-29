# Sprint 1：RBAC 权限系统（工业级 AI 执行流）

> 项目：Enterprise AI Console
> 模式：AI 驱动开发（Cursor / AI Agent）
> Sprint：1
> 目标：构建企业级 RBAC 权限体系（用户 / 角色 / 权限 / 菜单 / 路由 / 按钮 / API 全链路控制）

---

# 一、强制执行规则（必须遵守）

本 Sprint 属于核心基础能力建设，具有以下强约束：

- 必须严格 TypeScript（strict）
- 不允许 any
- 不允许 mock 替代结构设计
- 不允许权限逻辑散落在 UI 层
- 不允许跳步骤
- 不允许未定义类型
- 不允许绕过 auth 模块
- 所有权限必须可扩展、可组合
- 所有 API 必须纳入统一鉴权体系

---

# 二、RBAC 系统目标

实现完整企业级权限体系：

- 用户（User）
- 角色（Role）
- 权限（Permission）
- 菜单（Menu）
- 路由权限控制（Router Guard）
- 按钮级权限控制（Directive）
- API 权限控制（Server Middleware）

形成完整闭环：

> 登录 → Token → 用户信息 → 权限 → 路由 → 菜单 → UI → API

---

# 三、系统架构原则

## 1. 权限集中管理原则

所有权限逻辑必须集中在：

- `packages/auth`
- `server/auth`

禁止散落在页面或组件内部。

---

## 2. 三层权限模型

权限系统必须分为三层：

### 路由层

控制页面访问权限。

### UI 层（Directive）

控制按钮 / 元素显示。

### API 层（Server）

控制接口访问。

---

## 3. 最小权限原则

默认用户无权限：

- 必须显式授权
- 角色绑定权限集合
- 权限可组合但不可隐式继承

---

# 四、阶段 01：Auth 核心模块（packages/auth）

## 目标

构建 RBAC 核心数据模型与能力。

---

## 必须实现模型

### User

```ts
export interface User {
  id: string;
  username: string;
  avatar?: string;
  roles: Role[];
}
```

### Role

```ts
export interface Role {
  id: string;
  name: string;
  permissions: Permission[];
}
```

### Permission

```ts
export interface Permission {
  id: string;
  name: string;
  description: string;
}
```

## 必须实现能力

### 认证能力

- `login(username, password)`
- `logout()`
- `getUserInfo()`

### Token 机制

- JWT（模拟实现即可）
- `localStorage` 持久化
- 支持刷新预留结构

### 验收标准

- 登录返回 token
- token 可持久化
- 可获取用户信息

---

# 五、阶段 02：Auth Store（Pinia）

## 路径

`apps/admin/src/store/auth`

## 必须实现状态

- `user`
- `token`
- `roles`
- `permissions`

## 必须实现方法

- `login()`
- `logout()`
- `setUser()`
- `hasPermission(code)`

## 验收标准

- 登录后全局可访问状态
- 权限判断函数可用

---

# 六、阶段 03：Router 权限系统

## 路径

`apps/admin/src/router`

## 必须实现

### 路由结构

- `/login`（公开）
- `/dashboard`（受控）

### 路由守卫

- 未登录 → 跳 `login`
- 无权限 → 拦截访问

### 动态路由

根据权限动态生成菜单路由。

## 验收标准

- 未登录无法访问 `dashboard`
- 登录后自动注入路由

---

# 七、阶段 04：菜单系统（Menu System）

## 数据结构

```ts
export interface Menu {
  id: string;
  name: string;
  path: string;
  icon?: string;
  children?: Menu[];
  permissionCode?: string;
}
```

## 必须实现

- 动态菜单生成
- 权限过滤菜单
- 支持嵌套结构

## 验收标准

- 不同角色菜单不同
- 无权限菜单不可见

---

# 八、阶段 05：按钮级权限（Directive）

## Vue Directive

## 实现

```vue
v-permission="'user:create'"
```

## 功能要求

- 无权限隐藏按钮
- 支持多个权限组合判断

## 验收标准

- 无权限按钮不显示
- 权限变更实时生效

---

# 九、阶段 06：Server RBAC（BFF）

## 路径

`server/auth`

## 必须实现 Middleware

- JWT 校验
- Permission 校验

## API

- `POST /auth/login`
- `POST /auth/logout`
- `GET /user/info`

## 权限控制

- 无 token → `401`
- 无权限 → `403`

## 验收标准

- API 权限生效
- 前后端权限一致

---

# 十、阶段 07：权限初始化数据

## 用户

- `admin`（全权限）
- `viewer`（只读）

## 角色

- `admin`
- `viewer`

## 权限

- `dashboard:view`
- `user:create`
- `user:edit`
- `user:delete`

## 验收标准

- `admin` 全部可访问
- `viewer` 只读

---

# 十一、阶段 08：权限工具函数（核心能力）

## 必须实现统一入口

- `hasPermission()`
- `hasRole()`
- `filterMenus()`

所有权限判断必须通过该层。

## 验收标准

- 不允许散落权限判断逻辑

---

# 十二、阶段 09：系统整合（关键闭环）

## 必须完成完整链路

- Login
- Token
- Store
- Router
- Menu
- Directive
- API

形成完整 RBAC 闭环系统。

---

# 十三、最终验收标准（DoD）

必须全部通过：

- `pnpm install`
- `pnpm dev (admin)`
- login 成功
- router 权限生效
- menu 动态变化
- button 权限生效
- API 鉴权生效
- `pnpm lint` 通过
- `pnpm build` 通过

---

# 十四、Sprint 1 完成标志

当以下条件成立：

- RBAC 完整闭环运行
- 前后端权限一致
- 权限系统可扩展
- 可支持后续 AI Agent 接入

👉 Sprint 1 结束
