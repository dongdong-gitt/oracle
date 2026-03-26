# ORACLE 后端架构文档

## 架构概览

```
┌─────────────────────────────────────────────────────────────┐
│                        前端 (Next.js)                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  localStorage│  │  NextAuth   │  │   useCloudSync      │  │
│  │  (本地缓存)  │  │  (认证)     │  │   (云端同步)        │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      API 路由层                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────┐ │
│  │/api/auth │ │/api/kline│ │/api/read │ │ /api/payments  │ │
│  │ 认证相关 │ │ 八字测算 │ │ 记录管理 │ │   支付相关     │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      数据层                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  PostgreSQL  │  │    Redis     │  │   AWS S3/OSS     │  │
│  │  (主数据库)  │  │   (缓存)     │  │   (文件存储)     │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 数据模型

### 1. User (用户)
- 支持多种登录方式：邮箱、手机号、微信
- 会员等级：FREE / BASIC / PREMIUM / VIP
- 统计字段：测算次数、最后测算时间

### 2. BaziReading (八字测算记录)
- 完整的出生信息（含经纬度，支持真太阳时）
- JSON 存储八字数据、大运、流年
- AI 解读结果、算法评分、K线数据
- 支持收藏、备注

### 3. LiuyaoReading (六爻测算记录)
- 所问之事、起卦方式
- 卦象数据、六爻列表
- AI 解读

### 4. Payment (支付记录)
- 支持会员订阅、单次测算、充值
- 多渠道：微信、支付宝、Stripe
- 完整的支付状态追踪

### 5. AiLog (AI调用日志)
- 成本分析、用量统计
- 支持多模型：DeepSeek、OpenAI 等

## API 路由

### 认证 `/api/auth/*`
- `POST /api/auth/signin` - 登录
- `POST /api/auth/signout` - 登出
- `GET /api/auth/session` - 获取当前会话

### 八字测算 `/api/kline`
- `POST /api/kline` - 生成人生K线
- `GET /api/kline` - 获取使用说明

### 测算记录 `/api/readings/bazi`
- `GET /api/readings/bazi` - 获取用户测算记录列表
- `POST /api/readings/bazi` - 创建测算记录
- `DELETE /api/readings/bazi?id=xxx` - 删除记录

### 单条记录 `/api/readings/bazi/[id]`
- `GET /api/readings/bazi/[id]` - 获取详情
- `PATCH /api/readings/bazi/[id]` - 更新（收藏、备注）

### 用户 `/api/user`
- `GET /api/user` - 获取当前用户信息
- `PATCH /api/user` - 更新用户信息

### 支付 `/api/payments`
- `POST /api/payments/create` - 创建支付订单
- `POST /api/payments/wechat/notify` - 微信支付回调
- `GET /api/payments` - 获取支付记录

## 数据同步策略

### 本地优先 (Local-First)
1. 所有数据先写入 localStorage
2. 登录后自动同步到云端
3. 多设备登录时合并数据

### 同步逻辑
```
用户登录
    │
    ▼
检查云端是否有数据
    │
    ├── 有 → 下载到本地，覆盖 localStorage
    │
    └── 无 → 上传本地数据到云端
    │
    ▼
定时同步（每5分钟）
    │
    ▼
数据变更时即时同步
```

### 冲突解决
- 基于时间戳：取最新修改的数据
- 保留历史：重要数据保留修改历史

## 部署方案

### 方案一：Railway (推荐)
- **优点**：一键部署、自动扩缩容、免费额度
- **组件**：
  - PostgreSQL 数据库
  - Redis 缓存
  - Next.js 应用

### 方案二：Vercel + Railway
- **Vercel**：前端 + API 路由（Edge Function）
- **Railway**：PostgreSQL + Redis

### 方案三：AWS
- **ECS/Fargate**：应用容器
- **RDS**：PostgreSQL
- **ElastiCache**：Redis
- **S3**：文件存储

## 环境变量

```bash
# 数据库
DATABASE_URL="postgresql://..."

# 认证
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="random-secret-key"

# AI
DEEPSEEK_API_KEY="sk-..."

# Redis (可选)
REDIS_URL="redis://..."

# 支付
WECHAT_PAY_MCH_ID="..."
WECHAT_PAY_API_KEY="..."

# 存储
S3_BUCKET="..."
S3_ACCESS_KEY_ID="..."
```

## 开发流程

### 1. 安装依赖
```bash
npm install
```

### 2. 配置环境变量
```bash
cp .env.example .env
# 编辑 .env 填写配置
```

### 3. 初始化数据库
```bash
npx prisma migrate dev
npx prisma generate
```

### 4. 启动开发服务器
```bash
npm run dev
```

### 5. 数据库管理
```bash
# 查看数据库
npx prisma studio

# 创建迁移
npx prisma migrate dev --name add_new_feature

# 重置数据库
npx prisma migrate reset
```

## 安全考虑

1. **认证**：JWT + Session，支持多设备
2. **数据隔离**：用户只能访问自己的数据
3. **API 限流**：防止滥用
4. **敏感信息**：加密存储（手机号、支付信息）
5. **HTTPS**：强制 HTTPS，HSTS

## 性能优化

1. **数据库索引**：常用查询字段加索引
2. **Redis 缓存**：热点数据缓存
3. **CDN**：静态资源加速
4. **分页**：列表接口分页返回
5. **懒加载**：大数据分片加载

## 监控与日志

1. **错误追踪**：Sentry
2. **性能监控**：Vercel Analytics / Datadog
3. **AI 成本**：AiLog 表统计
4. **业务指标**：测算次数、付费转化率
