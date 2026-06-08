# FutureX Backend API

> 后端服务目录 | 待开发

## 目录结构

```
backend/
├── README.md
├── src/
│   ├── routes/
│   │   ├── auth.ts            # 认证路由
│   │   ├── users.ts           # 用户路由
│   │   ├── markets.ts         # 市场路由
│   │   ├── orders.ts          # 下注路由
│   │   ├── settlements.ts     # 结算路由
│   │   ├── withdrawals.ts     # 提现路由
│   │   ├── referrals.ts       # 返佣路由
│   │   ├── finance.ts         # 财务路由
│   │   └── admin.ts           # 后台管理路由
│   ├── middleware/
│   │   ├── auth.ts            # JWT 验证
│   │   └── rbac.ts            # 角色权限
│   ├── services/
│   │   ├── market.service.ts
│   │   ├── order.service.ts
│   │   ├── settlement.service.ts
│   │   ├── withdrawal.service.ts
│   │   └── referral.service.ts
│   ├── db/
│   │   └── prisma.ts          # Prisma Client
│   └── utils/
│       ├── chain.ts           # 链上交互工具
│       └── oracle.ts          # 预言机集成
├── prisma/
│   └── schema.prisma          # 数据库 Schema
├── package.json
└── tsconfig.json
```

## 技术栈

- **运行时**: Node.js 24 LTS
- **框架**: Hono (轻量高性能) 或 Next.js API Routes
- **数据库**: Supabase (PostgreSQL)
- **ORM**: Prisma
- **缓存**: Redis (Upstash)
- **认证**: JWT + 钱包签名验证
- **部署**: Vercel Functions (Fluid Compute)

## API 端点总览

### 认证 (3)
```
POST /api/auth/nonce        → 生成签名随机数
POST /api/auth/login         → 钱包签名登录
GET  /api/auth/me            → 当前用户信息
```

### 市场 (5)
```
GET    /api/markets          → 市场列表 (公开)
GET    /api/markets/:id      → 市场详情 (公开)
POST   /api/markets          → 创建市场 (用户)
PUT    /api/markets/:id      → 更新市场 (管理员)
DELETE /api/markets/:id      → 删除市场 (管理员)
```

### 审核 (3)
```
GET   /api/admin/reviews           → 审核列表
POST  /api/admin/reviews/:id/approve → 通过
POST  /api/admin/reviews/:id/reject  → 拒绝
```

### 下注 (2)
```
POST /api/orders/place       → 下注
POST /api/orders/:id/cancel  → 取消
```

### 结算 (2)
```
GET   /api/admin/settlements              → 结算列表
POST  /api/admin/settlements/:id/settle   → 执行结算
```

### 提现 (5)
```
POST  /api/withdrawals/request        → 申请提现
GET   /api/withdrawals                → 我的提现记录
GET   /api/admin/withdrawals          → 所有提现
POST  /api/admin/withdrawals/:id/approve → 通过
POST  /api/admin/withdrawals/:id/reject  → 拒绝
```

### 返佣 (3)
```
GET  /api/referrals/my-team       → 我的团队
GET  /api/admin/referrals         → 所有邀请
POST /api/admin/referrals         → 添加关系
```

### 财务 (2)
```
GET /api/admin/finance/stats    → 财务总览
GET /api/admin/treasury         → 资金池数据
```

### 后台 (3)
```
GET  /api/admin/dashboard       → 仪表盘
GET  /api/admin/users           → 用户列表
PUT  /api/admin/settings        → 系统配置
```

**合计: 28 个 API 端点 (不含批量/导出)**

## 关键设计决策

1. **无状态认证**: JWT token，由钱包签名生成，无需 session
2. **Supabase RLS**: 数据库层安全策略，防止越权访问
3. **幂等性**: 所有写操作支持 idempotency key
4. **分页**: 游标分页 (cursor-based) 用于大列表
5. **速率限制**: Redis 实现，每用户 100 req/min
6. **日志**: 结构化 JSON 日志，输出到 Vercel Logs
