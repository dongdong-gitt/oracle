## 快速定位（面向 AI 编码助手）

目标：尽快上手维护和扩展 Oracle 项目。下面列出此仓库的关键结构、常见约定、以及常用命令与可直接参考的代码片段路径。

- 项目类型：Next.js (App Router，Next 14) + Prisma (PostgreSQL) + NextAuth。目录入口：`src/app`（前端 + API 路由）和 `src/server`（服务层函数）。
- Dev / build 命令（在 PowerShell 中可直接运行）：`npm run dev` （开发），`npm run build`（会先 `prisma generate` 然后 `next build`）。更多 npm 脚本见 `package.json`（包括 `db:migrate`, `db:studio`, `db:seed`）。

## 大局观 / 架构要点

- 前端：`src/app`（app router）负责页面、hooks、components。常见 hook：`src/app/hooks/useCloudSync.ts`（local-first 数据同步逻辑，示例请求 `/api/readings/bazi`）。
- 后端 API：所有 API 路由都放在 `src/app/api/**`（或 `src/app/api/v1/**`），遵循 REST 风格（如 `/api/readings/bazi`, `/api/payments/*`）。
- 服务层：通用业务逻辑集中在 `src/server/services/*`（如 `ai.service.ts`, `order.service.ts`），但也有数据库 helper 在 `src/app/lib/db.ts`（导出 `prisma`、`userDb`、`baziDb`、`paymentDb` 等）。优先查这些文件来理解业务逻辑与 DB 访问模式。
- 数据库：Prisma 管理数据模型，schema 在 `prisma/schema.prisma`。Prisma client 在运行时通过 `src/app/lib/db.ts` 创建并导出（注意在非生产时将实例缓存到 globalThis）。
- 认证：使用 `next-auth`（Credentials provider），实现文件 `src/app/api/auth/[...nextauth]/route.ts`，一次性验证码由 `src/server/auth/code.ts` 验证（`verifyOneTimeCode`）。JWT/session 回调把 `membership`、`role` 等字段注入 session。
- AI 集成：主要使用 DeepSeek（环境变量 `DEEPSEEK_API_KEY`）。AI 调用封装示例：`src/server/services/ai.service.ts` 与多个 API 路由（`src/app/api/*/route.ts`）会在没有 api key 时使用本地 fallback 文本并写入 `aiLog`（Prisma 表 `AiLog`）。

## 项目约定与模式（可直接举例引用）

- Prisma 使用模式：在代码中通过 `import { prisma } from '@/app/lib/db'` 访问。请优先使用该共享 instance，避免重复创建 PrismaClient（文件已实现 global 缓存）。示例文件：`src/app/lib/db.ts`。
- 本地优先同步：客户端会把数据存在 localStorage 的 `oracle_user_data`，并通过 `useCloudSync` 在登录后/定时将其 POST 到 `/api/readings/bazi`。合并策略当前简单：若云端有数据则以云端为准（见 `src/app/hooks/useCloudSync.ts`）。
- AI 调用与容错：如果 `process.env.DEEPSEEK_API_KEY` 缺失或调用失败，代码会返回 fallback（见 `src/server/services/ai.service.ts` 中的 buildFallback），并记录一条 `aiLog`。因此在编辑 AI 相关逻辑时，保持 fallback 结构及 aiLog 行为一致。
- 支付与事务：支付确认会用 Prisma 事务更新 `payment` 与 `user`（示例：`src/app/api/payments/confirm/route.ts` 与 `src/server/services/order.service.ts`）。修改支付相关代码时保留事务以避免数据不一致。

## 开发与常用命令（可复制运行）

在仓库根目录（Windows PowerShell）：

```powershell
npm install
# 启动 dev server
npm run dev
# 编译/生产构建（会先生成 Prisma client）
npm run build
# Prisma 常用操作
npm run db:generate
npm run db:migrate
npm run db:studio
npm run db:seed
```

注意：`build` 脚本包含 `prisma generate && next build`，CI 里也显式运行 `npx prisma generate`（见 `.github/workflows/deploy.yml`）。如果修改 Prisma schema，先运行 `npx prisma migrate dev` 并 `prisma generate`。

## 重要环境变量（参考 `.env.example` 与 `docs/backend-architecture.md`）

- `DATABASE_URL`（Postgres）
- `NEXTAUTH_URL`, `NEXTAUTH_SECRET`（NextAuth）
- `DEEPSEEK_API_KEY`（AI 提供者；缺失时代码会 fallback）
- `REDIS_URL`（可选）
- `WECHAT_PAY_*`（支付）

编辑或新建 env 时参照 `./.env.example`。

## 调试技巧与常见陷阱

- 切勿在多处直接 new PrismaClient：统一使用 `src/app/lib/db.ts` 导出的 `prisma`。否则在开发模式下会出现过多连接警告。
- NextAuth session 回调会把额外字段注入 token/session（`membership`, `role`）。修改回调时注意保持字段名的一致性，前端依赖这些字段来控制 UI/权限。
- AI 路由对输入与输出格式有严格要求（很多地方期待 JSON 而非 Markdown）。当改动 AI prompt 或解析逻辑时保留原有的 JSON 协议或同时提供兼容层。
- 本地-first 同步的合并策略尚未复杂化（`useCloudSync` 中有 TODO）。增加合并逻辑前，请查阅 `src/app/hooks/useCloudSync.ts` 以避免覆盖用户数据。

## 参考文件（快捷链接）

- 架构与环境：`docs/backend-architecture.md`
- Prisma client + helper：`src/app/lib/db.ts`
- AI 服务：`src/server/services/ai.service.ts` 和 `src/app/api/*/route.ts`（如 `kline`, `bazi/analyze`）
- 认证：`src/app/api/auth/[...nextauth]/route.ts`、`src/server/auth/code.ts`
- 本地同步：`src/app/hooks/useCloudSync.ts`
- API 路由总览：`src/app/api`（含 `v1` 子路由）

如果这些说明里有不清楚或缺失的点，请指出具体部分（例如“需要更多 AI prompt 的样例”或“希望补充 CI 流程说明”），我会把文件调优后再提交一版。