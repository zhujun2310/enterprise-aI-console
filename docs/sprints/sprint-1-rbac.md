# Sprint 1：RBAC 权限系统交付记录

## 目标

Sprint 1 负责建立项目的权限闭环，目标覆盖：

- 用户、角色、权限模型
- 登录与 Token 持久化
- `AuthProvider + useAuthStore()` 前端状态管理
- 路由权限控制
- 菜单权限过滤
- 按钮级权限控制
- Server API 鉴权与权限校验

形成链路：

`登录 -> Token -> 用户信息 -> 权限 -> 路由 -> 菜单 -> UI -> API`

## 已交付内容

### 1. Auth 核心模型

`packages/auth` 已提供统一的 RBAC 模型与工具函数：

- `User`
- `Role`
- `Permission`
- `Menu`
- `login()`
- `logout()`
- `getUserInfo()`
- `hasPermission()`
- `hasRole()`
- `filterMenus()`

当前内置了两类角色：

- `admin`
- `viewer`

当前内置权限包括：

- `dashboard:view`
- `user:create`
- `user:edit`
- `user:delete`

### 2. Token 与会话恢复

前端通过 `localStorage` 持久化：

- access token
- refresh token 预留字段

当前 token 机制为本地模拟实现，满足：

- 登录返回 token
- 页面刷新后可恢复登录态
- token 过期后无法继续读取用户信息

### 3. 前端认证状态

`apps/admin/src/stores/auth.tsx` 已实现：

- `AuthProvider`
- `useAuthStore()`
- `hydrate()`
- `login()`
- `logout()`
- `refreshCurrentUser()`
- `hasPermission()`

派生状态已统一收敛为：

- `user`
- `token`
- `roles`
- `permissions`
- `permissionIds`
- `menus`
- `isAuthenticated`

### 4. 路由与页面权限

`apps/admin/src/router/index.tsx` 已实现三类路由门禁：

- `RequireAuth`
- `PublicOnlyRoute`
- `PermissionRoute`

当前行为：

- 未登录访问受保护页面会跳转到 `/login`
- 已登录访问登录页会回跳到默认业务页
- 无权限访问页面会进入 `/403`

### 5. 菜单与按钮权限

菜单源由 `packages/auth` 中的 `defaultMenus` 提供，并通过 `filterMenus()` 进行过滤。

当前已具备：

- 菜单按权限过滤
- 页面级权限门禁
- 按钮级条件渲染能力

其中 `Users` 页面可作为按钮和页面权限的主要落地点。

### 6. Server 侧 RBAC

`server/src/auth/` 已实现服务端鉴权中间件：

- `requireAuth`
- `requirePermission()`

当前接口规则：

- 无 token 返回 `401`
- 无权限返回 `403`

已接入的典型接口包括：

- `POST /auth/login`
- `POST /auth/logout`
- `GET /user/info`
- `GET /users`
- `POST /users`
- `PATCH /users/:userId/roles`
- `DELETE /users/:userId`

### 7. 用户管理闭环

在当前实现中，RBAC 不仅是静态展示，还具备基础管理动作：

- 获取用户与角色列表
- 创建用户
- 修改用户角色
- 删除用户

这使 Sprint 1 已具备“权限模型 + 权限执行”的最小闭环。

## 关键文件

- `packages/auth/src/index.ts`
- `apps/admin/src/stores/auth.tsx`
- `apps/admin/src/router/index.tsx`
- `apps/admin/src/api/auth.ts`
- `server/src/auth/middleware.ts`
- `server/src/auth/service.ts`
- `server/src/index.ts`
- `apps/admin/src/views/Login.tsx`
- `apps/admin/src/views/Users.tsx`

## 当前可验证结果

从当前仓库状态看，Sprint 1 已完成核心 RBAC 主链路：

- `admin` 与 `viewer` 具备不同权限范围
- 登录后可以恢复认证状态
- 菜单和页面访问受权限控制
- 受保护 API 具备前后端一致的鉴权逻辑

## 范围说明

当前 RBAC 为可运行的工程版实现，但仍保留一些刻意简化：

- JWT 为模拟编码结构，不是完整生产级签名体系
- refresh token 已预留，但未实现完整刷新流程
- 用户、角色、权限数据当前以内存数据源为主

这些不影响 Sprint 1 的交付目标，但属于后续可继续增强的部分。
