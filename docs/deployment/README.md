# Deployment

部署说明与运行方式（当前以本地演示与 CI 校验为主）。

## 本地启动

### 1) 安装依赖

```bash
pnpm install
```

### 2) 开发模式（同时启动 Admin + Server）

```bash
pnpm dev
```

默认端口：

- Admin：`http://localhost:5173`
- Server：`http://localhost:3000`

## 环境变量

### Admin

`apps/admin` 支持通过环境变量指定 BFF 地址：

- `VITE_API_BASE_URL`：默认 `http://localhost:3000`

示例（macOS/Linux）：

```bash
VITE_API_BASE_URL=http://localhost:3000 pnpm --filter @enterprise-ai-console/admin dev
```

## 构建与产物

### Admin

```bash
pnpm --filter @enterprise-ai-console/admin build
```

产物默认输出到：

- `apps/admin/dist/`

### Server

```bash
pnpm --filter @enterprise-ai-console/server build
```

## 生产部署建议（可选）

当前架构适合两种简单部署模式：

### 方案 A：Admin 静态资源 + Server 独立运行

- Admin：部署静态站点（Nginx/对象存储/CDN）
- Server：Node 进程运行 Hono 服务
- 通过反向代理把 `/api` 或指定域名映射到 server

### 方案 B：同域部署（推荐降低跨域复杂度）

- Nginx 同域下托管 `apps/admin/dist`
- Nginx 将 API 路径反代到 `server`（例如 `/api/* -> http://127.0.0.1:3000/*`）

## 健康检查

Server 提供：

- `GET /health`
- `GET /version`

用于部署后探活与版本确认。
