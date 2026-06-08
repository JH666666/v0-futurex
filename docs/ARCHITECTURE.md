# FutureX Architecture v1.0

> 预测市场 DApp 系统架构文档  
> 版本：v1.0  
> 日期：2026-06-08  
> 状态：MVP 设计阶段  

---

## 目录

1. [系统概述](#1-系统概述)
2. [第一部分：数据库设计](#2-第一部分数据库设计)
3. [第二部分：API 设计](#3-第二部分api-设计)
4. [第三部分：权限系统](#4-第三部分权限系统)
5. [第四部分：部署架构](#5-第四部分部署架构)

---

## 1. 系统概述

### 1.1 项目定位

FutureX 是一个 Web3 预测市场平台，用户可以对体育赛事、加密货币、AI、政治、金融、娱乐等事件进行预测下注。平台通过预言机自动结算，支持多链部署（Base / BNB Smart Chain）。

### 1.2 核心业务流程

```
用户注册/连接钱包
      │
      ├──→ 创建预测市场 ──→ 管理员审核 ──→ 市场上线
      │                                        │
      └──→ 浏览市场列表 ──→ 选择市场 ──→ 下注（YES/NO）
                                                 │
                                                 ▼
                                          资金冻结 + 订单生成
                                                 │
                                                 ▼
                                          聚合持仓记录
                                                 │
              事件到期 ──→ 预言机推送结果 ──→ 管理员结算
                                                 │
                                    ┌────────────┴────────────┐
                                    ▼                         ▼
                              YES 胜：按份额分红         NO 胜：按份额分红
                              输家资金归平台             输家资金归平台
                                    │                         │
                                    └────────────┬────────────┘
                                                 ▼
                                          用户余额更新
                                          冻结资金释放
                                                 │
                                                 ▼
                                          用户申请提现
                                                 │
                                    ┌────────────┴────────────┐
                                    ▼                         ▼
                              ≤100 USDT 自动到账       >100 USDT 人工审核
                                                 │
                                                 ▼
                                          出款合约打款
```

### 1.3 返佣资金流

```
用户 A 下注 $100
      │
      ▼
平台费 2.5% = $2.50 进入返佣池
      │
      ├──→ A 的 1 级邀请人：30% × $2.50 = $0.75
      ├──→ A 的 2 级邀请人：20% × $2.50 = $0.50
      ├──→ A 的 3 级邀请人：10% × $2.50 = $0.25
      ├──→ A 的 4 级邀请人： 5% × $2.50 = $0.125
      └──→ A 的 5 级邀请人： 5% × $2.50 = $0.125
```

---

## 2. 第一部分：数据库设计

> **当前阶段**：使用 localStorage + Mock Data 模拟，以下为正式数据库 Schema 设计。  
> **目标数据库**：PostgreSQL (Supabase)  
> **ORM**：Prisma

### 2.1 数据表总览

| 表名 | 说明 | 核心索引 |
|------|------|----------|
| `users` | 用户账户 | wallet_address, referral_code |
| `markets` | 预测市场 | category, chain, status, end_date |
| `market_reviews` | 市场审核记录 | market_id, reviewer_id |
| `orders` | 下注订单 | user_id, market_id, created_at |
| `positions` | 持仓聚合 | user_id, market_id, side |
| `settlements` | 结算记录 | market_id, settled_at |
| `withdrawals` | 提现记录 | user_id, status |
| `referrals` | 邀请关系 | inviter_id, user_id |
| `commissions` | 返佣记录 | from_user_id, to_user_id, level |
| `treasury_records` | 资金流记录 | type, chain, created_at |
| `system_settings` | 系统配置 | key (unique) |

---

### 2.2 详细表结构

#### 2.2.1 `users` — 用户账户

| 字段 | 类型 | 主键 | 外键 | 索引 | 默认值 | 说明 |
|------|------|------|------|------|--------|------|
| `id` | UUID | PK | - | ✅ | gen_random_uuid() | 用户唯一标识 |
| `wallet_address` | VARCHAR(42) | - | - | ✅ UNIQUE | - | 钱包地址 |
| `username` | VARCHAR(50) | - | - | ✅ | NULL | 用户名 |
| `handle` | VARCHAR(30) | - | - | ✅ UNIQUE | NULL | 唯一标识符，如 "vitalik.base" |
| `email` | VARCHAR(255) | - | - | - | NULL | 邮箱（可选） |
| `avatar_url` | TEXT | - | - | - | NULL | 头像 URL |
| `referral_code` | VARCHAR(20) | - | - | ✅ UNIQUE | - | 自己的邀请码 |
| `referred_by` | UUID | - | users.id | - | NULL | 邀请人 |
| `role` | ENUM('user','admin','finance','auditor','operator','super_admin') | - | - | - | 'user' | 用户角色 |
| `balance` | DECIMAL(18,2) | - | - | - | 0 | 可用余额 |
| `frozen_balance` | DECIMAL(18,2) | - | - | - | 0 | 冻结金额 |
| `total_earned` | DECIMAL(18,2) | - | - | - | 0 | 累计收益 |
| `total_withdrawn` | DECIMAL(18,2) | - | - | - | 0 | 累计提现 |
| `total_deposited` | DECIMAL(18,2) | - | - | - | 0 | 累计充值 |
| `kyc_status` | ENUM('unverified','pending','verified','rejected') | - | - | - | 'unverified' | KYC 状态 |
| `status` | ENUM('active','banned','pending') | - | - | ✅ | 'active' | 账户状态 |
| `last_login_at` | TIMESTAMP | - | - | - | NULL | 最后登录时间 |
| `created_at` | TIMESTAMP | - | - | ✅ | NOW() | 注册时间 |
| `updated_at` | TIMESTAMP | - | - | - | NOW() | 更新时间 |

```sql
CREATE INDEX idx_users_wallet ON users(wallet_address);
CREATE INDEX idx_users_handle ON users(handle);
CREATE INDEX idx_users_referral_code ON users(referral_code);
```

---

#### 2.2.2 `markets` — 预测市场

| 字段 | 类型 | 主键 | 外键 | 索引 | 默认值 | 说明 |
|------|------|------|------|------|--------|------|
| `id` | UUID | PK | - | ✅ | gen_random_uuid() | 市场唯一标识 |
| `question` | TEXT | - | - | ✅ (GIN) | - | 市场问题 |
| `description` | TEXT | - | - | - | NULL | 详细描述 |
| `category` | ENUM('worldcup','crypto','ai','politics','finance','entertainment') | - | - | ✅ | - | 品类 |
| `chain` | ENUM('base','bsc') | - | - | ✅ | 'base' | 部署链 |
| `yes_price` | INTEGER | - | - | - | 50 | YES 概率（1-99 美分） |
| `volume` | DECIMAL(18,2) | - | - | - | 0 | 总交易量 |
| `liquidity` | DECIMAL(18,2) | - | - | - | 0 | 流动性 |
| `participants` | INTEGER | - | - | - | 0 | 参与人数 |
| `end_date` | DATE | - | - | ✅ | - | 截止日期 |
| `resolution_source` | TEXT | - | - | - | - | 结算来源描述 |
| `resolution_contract` | VARCHAR(42) | - | - | - | NULL | 预言机合约地址 |
| `outcome` | ENUM('YES','NO') | - | - | - | NULL | 结算结果 |
| `status` | ENUM('active','settled','disputed','cancelled') | - | - | ✅ | 'active' | 市场状态 |
| `featured` | BOOLEAN | - | - | ✅ | false | 是否精选 |
| `featured_until` | DATE | - | - | - | NULL | 精选截止日期 |
| `creator_id` | UUID | - | users.id | ✅ | - | 创建者 |
| `created_at` | TIMESTAMP | - | - | ✅ | NOW() | 创建时间 |
| `updated_at` | TIMESTAMP | - | - | - | NOW() | 更新时间 |

```sql
CREATE INDEX idx_markets_category ON markets(category);
CREATE INDEX idx_markets_chain ON markets(chain);
CREATE INDEX idx_markets_status ON markets(status);
CREATE INDEX idx_markets_end_date ON markets(end_date);
CREATE INDEX idx_markets_featured ON markets(featured) WHERE featured = true;
CREATE INDEX idx_markets_question ON markets USING GIN (to_tsvector('chinese', question));
```

---

#### 2.2.3 `market_reviews` — 市场审核记录

| 字段 | 类型 | 主键 | 外键 | 索引 | 默认值 | 说明 |
|------|------|------|------|------|--------|------|
| `id` | UUID | PK | - | ✅ | gen_random_uuid() | 主键 |
| `market_id` | UUID | - | markets.id | ✅ | - | 关联市场 |
| `reviewer_id` | UUID | - | users.id | ✅ | - | 审核人 |
| `status` | ENUM('pending','approved','rejected') | - | - | ✅ | 'pending' | 审核状态 |
| `reject_reason` | TEXT | - | - | - | NULL | 拒绝原因 |
| `reviewed_at` | TIMESTAMP | - | - | - | NULL | 审核时间 |
| `created_at` | TIMESTAMP | - | - | - | NOW() | 创建时间 |
```

---

#### 2.2.4 `orders` — 下注订单

| 字段 | 类型 | 主键 | 外键 | 索引 | 默认值 | 说明 |
|------|------|------|------|------|--------|------|
| `id` | UUID | PK | - | ✅ | gen_random_uuid() | 订单 ID |
| `user_id` | UUID | - | users.id | ✅ | - | 用户 |
| `market_id` | UUID | - | markets.id | ✅ | - | 市场 |
| `side` | ENUM('YES','NO') | - | - | - | - | 方向 |
| `amount` | DECIMAL(18,2) | - | - | - | - | 下注金额 |
| `price` | INTEGER | - | - | - | - | 成交价（美分） |
| `shares` | DECIMAL(18,6) | - | - | - | - | 获得份额 |
| `estimated_return` | DECIMAL(18,2) | - | - | - | - | 预估收益 |
| `status` | ENUM('filled','cancelled') | - | - | ✅ | 'filled' | 订单状态 |
| `tx_hash` | VARCHAR(66) | - | - | - | NULL | 链上交易哈希 |
| `created_at` | TIMESTAMP | - | - | ✅ | NOW() | 下单时间 |

```sql
CREATE INDEX idx_orders_user ON orders(user_id, created_at DESC);
CREATE INDEX idx_orders_market ON orders(market_id);
CREATE INDEX idx_orders_status ON orders(status);
```

---

#### 2.2.5 `positions` — 持仓聚合

| 字段 | 类型 | 主键 | 外键 | 索引 | 默认值 | 说明 |
|------|------|------|------|------|--------|------|
| `id` | UUID | PK | - | ✅ | gen_random_uuid() | 主键 |
| `user_id` | UUID | - | users.id | ✅ | - | 用户 |
| `market_id` | UUID | - | markets.id | ✅ | - | 市场 |
| `side` | ENUM('YES','NO') | - | - | - | - | 方向 |
| `total_amount` | DECIMAL(18,2) | - | - | - | 0 | 总投入 |
| `avg_price` | INTEGER | - | - | - | 0 | 均价（美分） |
| `shares` | DECIMAL(18,6) | - | - | - | 0 | 份额 |
| `current_price` | INTEGER | - | - | - | 0 | 当前价格 |
| `pnl` | DECIMAL(18,2) | - | - | - | 0 | 盈亏 |
| `status` | ENUM('open','settled','closed') | - | - | ✅ | 'open' | 持仓状态 |
| `settled_outcome` | ENUM('YES','NO') | - | - | - | NULL | 结算结果 |
| `settled_return` | DECIMAL(18,2) | - | - | - | NULL | 结算返还 |
| `created_at` | TIMESTAMP | - | - | - | NOW() | 创建时间 |
| `updated_at` | TIMESTAMP | - | - | - | NOW() | 更新时间 |

```sql
CREATE UNIQUE INDEX idx_positions_user_market_side ON positions(user_id, market_id, side) WHERE status = 'open';
CREATE INDEX idx_positions_market ON positions(market_id, status);
```

---

#### 2.2.6 `settlements` — 结算记录

| 字段 | 类型 | 主键 | 外键 | 索引 | 默认值 | 说明 |
|------|------|------|------|------|--------|------|
| `id` | UUID | PK | - | ✅ | gen_random_uuid() | 主键 |
| `market_id` | UUID | - | markets.id | ✅ | - | 市场 |
| `outcome` | ENUM('YES','NO') | - | - | - | - | 结果 |
| `total_positions` | INTEGER | - | - | - | 0 | 结算持仓数 |
| `total_payout` | DECIMAL(18,2) | - | - | - | 0 | 总返还 |
| `total_frozen` | DECIMAL(18,2) | - | - | - | 0 | 总冻结释放 |
| `settled_by` | UUID | - | users.id | - | - | 结算操作人 |
| `settled_at` | TIMESTAMP | - | - | ✅ | NOW() | 结算时间 |
| `tx_hash` | VARCHAR(66) | - | - | - | NULL | 链上交易哈希（预留） |
| `created_at` | TIMESTAMP | - | - | - | NOW() | 创建时间 |
```

---

#### 2.2.7 `withdrawals` — 提现记录

| 字段 | 类型 | 主键 | 外键 | 索引 | 默认值 | 说明 |
|------|------|------|------|------|--------|------|
| `id` | UUID | PK | - | ✅ | gen_random_uuid() | 主键 |
| `user_id` | UUID | - | users.id | ✅ | - | 用户 |
| `chain` | ENUM('base','bsc') | - | - | - | - | 提现网络 |
| `token` | VARCHAR(10) | - | - | - | 'USDC' | 代币符号 |
| `amount` | DECIMAL(18,2) | - | - | - | - | 提现金额 |
| `fee` | DECIMAL(18,2) | - | - | - | 2 | 手续费 |
| `net_amount` | DECIMAL(18,2) | - | - | - | - | 到账金额 |
| `to_address` | VARCHAR(42) | - | - | - | - | 接收地址 |
| `status` | ENUM('PENDING','APPROVED','REJECTED','PAID') | - | - | ✅ | 'PENDING' | 状态 |
| `is_large` | BOOLEAN | - | - | ✅ | false | 是否大额 |
| `reject_reason` | TEXT | - | - | - | NULL | 拒绝原因 |
| `reviewed_by` | UUID | - | users.id | - | NULL | 审核人 |
| `reviewed_at` | TIMESTAMP | - | - | - | NULL | 审核时间 |
| `tx_hash` | VARCHAR(66) | - | - | - | NULL | 链上出款哈希（预留） |
| `created_at` | TIMESTAMP | - | - | ✅ | NOW() | 申请时间 |

```sql
CREATE INDEX idx_withdrawals_user ON withdrawals(user_id, created_at DESC);
CREATE INDEX idx_withdrawals_status ON withdrawals(status);
```

---

#### 2.2.8 `referrals` — 邀请关系

| 字段 | 类型 | 主键 | 外键 | 索引 | 默认值 | 说明 |
|------|------|------|------|------|--------|------|
| `id` | UUID | PK | - | ✅ | gen_random_uuid() | 主键 |
| `user_id` | UUID | - | users.id | ✅ UNIQUE | - | 被邀请人 |
| `inviter_id` | UUID | - | users.id | ✅ | - | 邀请人 |
| `level` | SMALLINT | - | - | - | 1 | 层级（1-5） |
| `created_at` | TIMESTAMP | - | - | - | NOW() | 创建时间 |

```sql
CREATE INDEX idx_referrals_inviter ON referrals(inviter_id);
```

---

#### 2.2.9 `commissions` — 返佣记录

| 字段 | 类型 | 主键 | 外键 | 索引 | 默认值 | 说明 |
|------|------|------|------|------|--------|------|
| `id` | UUID | PK | - | ✅ | gen_random_uuid() | 主键 |
| `from_user_id` | UUID | - | users.id | ✅ | - | 下注人 |
| `to_user_id` | UUID | - | users.id | ✅ | - | 获得返佣人 |
| `order_id` | UUID | - | orders.id | ✅ | - | 关联订单 |
| `level` | SMALLINT | - | - | ✅ | - | 返佣层级（1-5） |
| `rate` | SMALLINT | - | - | - | - | 返佣比例（%） |
| `bet_amount` | DECIMAL(18,2) | - | - | - | - | 原始下注额 |
| `commission_amount` | DECIMAL(18,2) | - | - | - | - | 返佣金额 |
| `market_question` | TEXT | - | - | - | - | 市场名称（冗余） |
| `created_at` | TIMESTAMP | - | - | ✅ | NOW() | 创建时间 |

```sql
CREATE INDEX idx_commissions_to_user ON commissions(to_user_id, created_at DESC);
CREATE INDEX idx_commissions_from_user ON commissions(from_user_id);
CREATE INDEX idx_commissions_level ON commissions(level);
```

---

#### 2.2.10 `treasury_records` — 资金流记录

| 字段 | 类型 | 主键 | 外键 | 索引 | 默认值 | 说明 |
|------|------|------|------|------|--------|------|
| `id` | UUID | PK | - | ✅ | gen_random_uuid() | 主键 |
| `type` | ENUM('inflow','outflow') | - | - | ✅ | - | 类型 |
| `chain` | ENUM('base','bsc') | - | - | ✅ | - | 链 |
| `token` | VARCHAR(10) | - | - | - | - | 代币 |
| `amount` | DECIMAL(18,2) | - | - | - | - | 金额 |
| `from_address` | VARCHAR(42) | - | - | - | NULL | 来源地址 |
| `to_address` | VARCHAR(42) | - | - | - | NULL | 目标地址 |
| `status` | ENUM('confirmed','pending','failed') | - | - | ✅ | 'pending' | 状态 |
| `tx_hash` | VARCHAR(66) | - | - | - | NULL | 链上交易哈希（预留） |
| `note` | TEXT | - | - | - | NULL | 备注 |
| `created_at` | TIMESTAMP | - | - | ✅ | NOW() | 创建时间 |
```

---

#### 2.2.11 `system_settings` — 系统配置

| 字段 | 类型 | 主键 | 外键 | 索引 | 说明 |
|------|------|------|------|------|------|
| `key` | VARCHAR(50) | PK | - | ✅ | 配置键（唯一） |
| `value` | JSONB | - | - | - | 配置值（JSON） |
| `description` | TEXT | - | - | - | 说明 |
| `updated_by` | UUID | - | users.id | - | 修改人 |
| `updated_at` | TIMESTAMP | - | - | - | 修改时间 |

默认配置项：
```
platform_name          → "FutureX"
platform_fee           → 2.5
min_trade_amount       → 10
max_market_duration    → 365
default_chain          → "base"
oracle_timeout_hours   → 24
require_market_approval→ true
maintenance_mode       → false
referral_rate_level1   → 30
referral_rate_level2   → 20
referral_rate_level3   → 10
referral_rate_level4   → 5
referral_rate_level5   → 5
auto_approve_limit     → 100
min_withdraw_amount    → 10
withdraw_fee           → 2
daily_withdraw_limit   → 50000
single_withdraw_limit  → 25000
```

---

### 2.3 ER 关系图（文字版）

```
users ──1:N──→ markets (creator)
users ──1:N──→ market_reviews (reviewer)
users ──1:N──→ orders
users ──1:N──→ positions
users ──1:N──→ settlements (settled_by)
users ──1:N──→ withdrawals
users ──1:N──→ referrals (user_id)
users ──1:N──→ referrals (inviter_id)
users ──1:N──→ commissions (from_user)
users ──1:N──→ commissions (to_user)

markets ──1:N──→ market_reviews
markets ──1:N──→ orders
markets ──1:N──→ positions
markets ──1:1──→ settlements

orders ──1:N──→ commissions
```

---

## 3. 第二部分：API 设计

### 3.1 基础规范

- **Base URL**: `https://api.futurex.xyz/v1`
- **认证方式**: JWT Bearer Token + 钱包签名验证
- **请求格式**: JSON (Content-Type: application/json)
- **响应格式**:
```json
{
  "success": true,
  "data": {},
  "error": null,
  "meta": { "page": 1, "perPage": 20, "total": 100 }
}
```

---

### 3.2 用户模块 `POST /auth/nonce`

生成签名随机数。

```
Method:  POST
Path:    /auth/nonce
Body:    { "walletAddress": "0x..." }
Response: { "nonce": "abc123...", "message": "Sign this message to login to FutureX: abc123..." }
权限:    Public
```

#### `POST /auth/login`

钱包签名验证登录。

```
Method:  POST
Path:    /auth/login
Body:    { "walletAddress": "0x...", "signature": "0x...", "nonce": "abc123..." }
Response: { "token": "jwt...", "user": { ... } }
权限:    Public
```

#### `GET /users/me`

获取当前用户信息。

```
Method:  GET
Path:    /users/me
Headers: Authorization: Bearer {token}
Response: { "id": "...", "walletAddress": "...", "balance": 5000, "frozenBalance": 500, ... }
权限:    User
```

#### `GET /users/me/positions`

获取当前用户持仓。

```
Method:  GET
Path:    /users/me/positions
Query:   ?status=open|settled|closed
Response: { "positions": [{ "marketId": "...", "side": "YES", "shares": 434.8, ... }] }
权限:    User
```

#### `GET /users/me/orders`

获取当前用户订单。

```
Method:  GET
Path:    /users/me/orders
Query:   ?page=1&perPage=20&status=filled|cancelled
Response: { "orders": [...], "meta": { ... } }
权限:    User
```

#### `PUT /users/me/profile`

更新用户资料。

```
Method:  PUT
Path:    /users/me/profile
Body:    { "username": "...", "email": "..." }
Response: { "user": { ... } }
权限:    User
```

---

### 3.3 市场模块

#### `GET /markets`

市场列表。

```
Method:  GET
Path:    /markets
Query:   ?category=worldcup&chain=base&status=active&sort=volume&order=desc&page=1&perPage=20&search=世界杯
Response: {
  "markets": [{ "id": "...", "question": "...", "yesPrice": 23, "volume": 4820000, ... }],
  "meta": { "page": 1, "perPage": 20, "total": 1284 }
}
权限:    Public
```

#### `GET /markets/:id`

市场详情。

```
Method:  GET
Path:    /markets/:id
Response: { "market": { "id": "...", "question": "...", "trend": [40,42,39,...], ... } }
权限:    Public
```

#### `POST /markets`

创建市场（用户端 → 进入审核）。

```
Method:  POST
Path:    /markets
Headers: Authorization: Bearer {token}
Body:    {
  "question": "巴西会赢得2026世界杯冠军吗？",
  "description": "...",
  "category": "worldcup",
  "chain": "base",
  "endDate": "2026-07-19",
  "resolution": "FIFA 官方赛果"
}
Response: { "market": { "id": "...", "reviewStatus": "pending", ... } }
权限:    User
```

#### `PUT /markets/:id`

更新市场（管理员）。

```
Method:  PUT
Path:    /markets/:id
Headers: Authorization: Bearer {token}
Body:    { "featured": true, "yesPrice": 45 }
Response: { "market": { ... } }
权限:    Admin, SuperAdmin
```

#### `DELETE /markets/:id`

删除市场。

```
Method:  DELETE
Path:    /markets/:id
Response: { "success": true }
权限:    Admin, SuperAdmin
```

---

### 3.4 审核模块

#### `GET /admin/reviews`

获取审核列表。

```
Method:  GET
Path:    /admin/reviews
Query:   ?status=pending|approved|rejected&page=1&perPage=20
Response: { "reviews": [...], "stats": { "pending": 4, "approved": 20, "rejected": 2 } }
权限:    Admin, SuperAdmin
```

#### `POST /admin/reviews/:id/approve`

通过审核。

```
Method:  POST
Path:    /admin/reviews/:id/approve
Response: { "review": { "id": "...", "status": "approved" } }
权限:    Admin, SuperAdmin
```

#### `POST /admin/reviews/:id/reject`

拒绝审核。

```
Method:  POST
Path:    /admin/reviews/:id/reject
Body:    { "reason": "结算来源不够明确" }
Response: { "review": { "id": "...", "status": "rejected", "rejectReason": "..." } }
权限:    Admin, SuperAdmin
```

---

### 3.5 下注模块

#### `POST /orders/place`

下注。

```
Method:  POST
Path:    /orders/place
Headers: Authorization: Bearer {token}
Body:    {
  "marketId": "wc-winner-brazil",
  "side": "YES",
  "amount": 100
}
Response: {
  "order": { "id": "ord-...", "shares": 434.8, "estimatedReturn": 434.8 },
  "wallet": { "balance": 4900, "frozen": 600 }
}
权限:    User
```

#### `POST /orders/:id/cancel`

取消订单。

```
Method:  POST
Path:    /orders/:id/cancel
Response: { "order": { "id": "...", "status": "cancelled" }, "wallet": { ... } }
权限:    User
```

---

### 3.6 结算模块

#### `GET /admin/settlements`

结算列表。

```
Method:  GET
Path:    /admin/settlements
Query:   ?status=open|settled&page=1&perPage=20
Response: { "markets": [{ "id": "...", "openPositions": 5, "totalBets": 10000 }] }
权限:    Admin, SuperAdmin, Finance
```

#### `POST /admin/settlements/:marketId/settle`

执行结算。

```
Method:  POST
Path:    /admin/settlements/:marketId/settle
Body:    { "outcome": "YES" }
Response: {
  "settlement": {
    "marketId": "...",
    "outcome": "YES",
    "settled": 5,
    "totalPayout": 8700,
    "totalFrozen": 10000
  }
}
权限:    Admin, SuperAdmin
```

---

### 3.7 提现模块

#### `POST /withdrawals/request`

申请提现。

```
Method:  POST
Path:    /withdrawals/request
Headers: Authorization: Bearer {token}
Body:    {
  "amount": 500,
  "toAddress": "0x...",
  "chain": "base"
}
Response: {
  "withdrawal": { "id": "wd-...", "status": "PAID", "netAmount": 498 }
}
权限:    User
```

#### `GET /withdrawals`

获取提现记录。

```
Method:  GET
Path:    /withdrawals
Query:   ?page=1&perPage=20
Response: { "withdrawals": [...], "meta": { ... } }
权限:    User
```

#### `GET /admin/withdrawals`

获取所有提现记录。

```
Method:  GET
Path:    /admin/withdrawals
Query:   ?status=PENDING|APPROVED|PAID|REJECTED&search=...&page=1&perPage=20
Response: { "withdrawals": [...], "stats": { "pending": 3, "pendingAmount": 12500 } }
权限:    Admin, SuperAdmin, Finance
```

#### `POST /admin/withdrawals/:id/approve`

审批通过。

```
Method:  POST
Path:    /admin/withdrawals/:id/approve
Response: { "withdrawal": { "id": "...", "status": "PAID" } }
权限:    Admin, SuperAdmin, Finance
```

#### `POST /admin/withdrawals/:id/reject`

拒绝提现。

```
Method:  POST
Path:    /admin/withdrawals/:id/reject
Body:    { "reason": "KYC未完成" }
Response: { "withdrawal": { "id": "...", "status": "REJECTED" } }
权限:    Admin, SuperAdmin, Finance
```

---

### 3.8 返佣模块

#### `GET /referrals/my-team`

我的团队。

```
Method:  GET
Path:    /referrals/my-team
Response: {
  "teamSize": 12,
  "directInvites": 3,
  "totalCommission": 845.50,
  "commissions": [...]
}
权限:    User
```

#### `GET /admin/referrals`

所有邀请关系。

```
Method:  GET
Path:    /admin/referrals
Response: { "relations": [...], "commissions": [...], "stats": { ... } }
权限:    Admin, SuperAdmin
```

#### `POST /admin/referrals`

添加邀请关系。

```
Method:  POST
Path:    /admin/referrals
Body:    { "userId": "...", "inviterId": "..." }
Response: { "relation": { ... } }
权限:    Admin, SuperAdmin
```

---

### 3.9 财务模块

#### `GET /admin/finance/stats`

财务总览。

```
Method:  GET
Path:    /admin/finance/stats
Response: {
  "betting": { "totalBetAmount": 500000, "totalPayout": 420000 },
  "wallet": { "totalBalance": 80000, "totalFrozen": 50000 },
  "withdrawal": { "pendingAmount": 12500, "approvedAmount": 38000 },
  "commission": { "total": 2500, "byLevel": [...] }
}
权限:    Admin, SuperAdmin, Finance, Auditor
```

#### `GET /admin/treasury`

资金池数据。

```
Method:  GET
Path:    /admin/treasury
Response: {
  "configs": [{ "chain": "base", "collectionAddress": "0x...", ... }],
  "state": { "todayInflow": 42800, "todayOutflow": 12100, ... },
  "transactions": [...],
  "alerts": [...]
}
权限:    Admin, SuperAdmin, Finance
```

---

### 3.10 后台模块

#### `GET /admin/dashboard`

仪表盘数据。

```
Method:  GET
Path:    /admin/dashboard
Response: { "stats": { "totalMarkets": 150, "totalUsers": 126000, ... } }
权限:    Admin, SuperAdmin, Finance, Auditor, Operator
```

#### `GET /admin/users`

用户列表。

```
Method:  GET
Path:    /admin/users
Query:   ?search=...&status=active|banned&sort=pnl&page=1&perPage=20
Response: { "users": [...], "meta": { ... } }
权限:    Admin, SuperAdmin
```

#### `PUT /admin/settings`

更新系统配置。

```
Method:  PUT
Path:    /admin/settings
Body:    { "platformFee": 3.0, "autoApproveLimit": 200 }
Response: { "settings": { ... } }
权限:    SuperAdmin
```

---

### 3.11 API 接口汇总

| 模块 | 接口数 | 主要权限 |
|------|--------|----------|
| 用户认证 | 3 | Public / User |
| 用户 | 4 | User |
| 市场 | 5 | Public / User / Admin |
| 审核 | 3 | Admin, SuperAdmin |
| 下注 | 2 | User |
| 结算 | 2 | Admin, Finance |
| 提现 | 5 | User / Admin / Finance |
| 返佣 | 3 | User / Admin |
| 财务 | 2 | Admin, Finance, Auditor |
| 后台 | 3 | Admin, SuperAdmin |
| **合计** | **32** | |

---

## 4. 第三部分：权限系统

### 4.1 角色定义

| 角色 | 标识 | 说明 |
|------|------|------|
| **Super Admin** | `super_admin` | 超级管理员，全部权限，可修改系统配置 |
| **Admin** | `admin` | 管理员，审核市场/用户/提现，查看所有数据 |
| **Finance** | `finance` | 财务，处理提现/结算，查看财务数据 |
| **Auditor** | `auditor` | 审计，只读财务和交易数据 |
| **Operator** | `operator` | 运营，管理精选市场/内容，只读用户数据 |
| **User** | `user` | 普通用户，创建市场/下注/提现/邀请 |

### 4.2 页面权限矩阵

| 页面 | Super Admin | Admin | Finance | Auditor | Operator | User |
|------|:-----------:|:-----:|:-------:|:-------:|:--------:|:----:|
| 首页 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 市场详情 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 创建市场 | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| 我的持仓 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 排行榜 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 邀请中心 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **后台-总览** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **后台-审核中心** | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| **后台-市场创建** | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| **后台-市场管理** | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| **后台-赔率配置** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **后台-引流市场** | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| **后台-用户管理** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **后台-邀请管理** | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| **后台-财务统计** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **后台-订单管理** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **后台-结算管理** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **后台-提现管理** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **后台-资金池** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **后台-系统设置** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

### 4.3 API 权限矩阵

| API 端点 | Super Admin | Admin | Finance | Auditor | Operator | User |
|----------|:-----------:|:-----:|:-------:|:-------:|:--------:|:----:|
| `POST /markets` | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| `PUT /markets/:id` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `DELETE /markets/:id` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `POST /admin/reviews/:id/approve` | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| `POST /admin/settlements/:id/settle` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `POST /admin/withdrawals/:id/approve` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `GET /admin/finance/stats` | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| `GET /admin/treasury` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `GET /admin/users` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `PUT /admin/settings` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## 5. 第四部分：部署架构

### 5.1 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| **前端** | Next.js 16 (App Router) + React 19 + TypeScript 5.7 | SSR/SSG 混合渲染 |
| **样式** | Tailwind CSS 4 + shadcn/ui (Base UI) + Lucide Icons | glassmorphism 设计 |
| **状态管理** | React Context + localStorage | MVP 阶段无数据库 |
| **钱包连接** | wagmi v2 + viem | 支持 Base + BSC |
| **数据库** | PostgreSQL (Supabase) | 生产环境 |
| **ORM** | Prisma | 类型安全 |
| **缓存** | Redis (Upstash) | 热门数据 + 会话 |
| **文件存储** | Vercel Blob / IPFS | 市场图片 |
| **区块链** | Base (USDC) + BNB Smart Chain (USDT) | 双链部署 |
| **预言机** | Chainlink Functions / UMA Optimistic Oracle | 市场结算 |
| **智能合约** | Solidity (Foundry/Hardhat) | 待开发 |
| **部署** | Vercel (前端) + Supabase (数据) | 一键部署 |
| **监控** | Vercel Analytics + Sentry | 错误追踪 |
| **CI/CD** | GitHub Actions | 自动化部署 |

### 5.2 环境划分

| 环境 | URL | 数据库 | 合约网络 | 用途 |
|------|-----|--------|----------|------|
| **本地开发** | `localhost:3000` | 本地 Supabase / localStorage | 本地测试网 | 日常开发 |
| **测试环境** | `test.futurex.xyz` | Supabase Staging | Base Sepolia / BSC Testnet | QA 测试 |
| **生产环境** | `futurex.xyz` | Supabase Production | Base Mainnet / BSC Mainnet | 正式上线 |

### 5.3 部署方案

```
                          ┌─────────────────────┐
                          │     Vercel Edge      │
                          │  (CDN + SSL + DNS)   │
                          └──────────┬──────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    ▼                ▼                 ▼
          ┌────────────┐   ┌──────────────┐   ┌──────────────┐
          │  Next.js    │   │  API Routes  │   │  Middleware   │
          │  (SSR/SSG)  │   │  (/api/*)    │   │  (Auth/CORS)  │
          └──────┬──────┘   └──────┬───────┘   └──────────────┘
                 │                 │
        ┌────────┴────────┬────────┴────────┐
        ▼                 ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Supabase   │  │    Redis     │  │  Vercel Blob │
│ (PostgreSQL) │  │  (Upstash)   │  │  (Images)    │
└──────────────┘  └──────────────┘  └──────────────┘
        │
        ▼
┌──────────────────────────────────────────────┐
│               Blockchain Layer               │
│  ┌─────────────┐      ┌─────────────┐       │
│  │ Base Mainnet│      │ BSC Mainnet │       │
│  │ (USDC)      │      │ (USDT)      │       │
│  │ MarketFactory│     │ MarketFactory│      │
│  │ Prediction   │     │ Prediction   │      │
│  │ Oracle       │     │ Oracle       │      │
│  └─────────────┘      └─────────────┘       │
└──────────────────────────────────────────────┘
```

### 5.4 环境变量

```bash
# .env.development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
NEXT_PUBLIC_CHAIN_ID_BASE=8453
NEXT_PUBLIC_CHAIN_ID_BSC=56
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
COLLECTION_ADDRESS_BASE=0x...
PAYMENT_CONTRACT_BASE=0x...
TOKEN_ADDRESS_BASE=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
TOKEN_ADDRESS_BSC=0x55d398326f99059fF775485246999027B3197955

# .env.production
NEXT_PUBLIC_APP_URL=https://futurex.xyz
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
NEXT_PUBLIC_CHAIN_ID_BASE=8453
NEXT_PUBLIC_CHAIN_ID_BSC=56
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
COLLECTION_ADDRESS_BASE=0x...
PAYMENT_CONTRACT_BASE=0x...
ENABLE_CHAIN_TX=true
```

### 5.5 部署命令

```bash
# 开发环境
npm run dev

# 构建
npm run build

# 部署到 Vercel (Preview)
vercel

# 部署到 Vercel (Production)
vercel --prod

# 数据库迁移
npx prisma migrate deploy

# 缓存预热
npm run cache:warm
```

### 5.6 智能合约（待开发）

```
contracts/
├── MarketFactory.sol        # 市场工厂合约
├── PredictionMarket.sol     # 单个预测市场（YES/NO 二元）
├── OracleInterface.sol      # 预言机接口
├── PaymentContract.sol      # 出款合约（批量打款）
├── ReferralRewards.sol      # 返佣合约
├── Treasury.sol             # 资金池管理
├── XPToken.sol              # 积分代币 (ERC-20)
└── AchievementNFT.sol       # 成就徽章 (ERC-1155)
```

---

## 附录

### A. 当前实现状态

| 模块 | 前端 UI | 数据层 | 后端 API | 智能合约 |
|------|:------:|:------:|:--------:|:--------:|
| 市场创建 | ✅ | ✅ (localStorage) | ❌ | ❌ |
| 市场审核 | ✅ | ✅ | ❌ | ❌ |
| 用户下注 | ✅ | ✅ | ❌ | ❌ |
| 持仓管理 | ✅ | ✅ | ❌ | ❌ |
| 订单系统 | ✅ | ✅ | ❌ | ❌ |
| 结算系统 | ✅ | ✅ | ❌ | ❌ |
| 提现系统 | ✅ | ✅ | ❌ | ❌ |
| 五代返佣 | ✅ | ✅ | ❌ | ❌ |
| 资金池 | ✅ | ✅ | ❌ | ❌ |
| 后台管理 | ✅ (15页) | ✅ | ❌ | ❌ |
| 钱包连接 | 🟡 (Mock) | 🟡 | ❌ | ❌ |

### B. 文件清单

```
lib/
├── data.ts              # 种子数据 + 类型定义
├── utils.ts             # cn() 工具函数
├── market-store.ts      # 市场数据层
├── betting-store.ts     # 下注 + 结算数据层
├── wallet-store.ts      # 用户余额数据层
├── withdrawal-store.ts  # 提现数据层
├── referral-store.ts    # 返佣数据层
└── treasury-store.ts    # 资金池数据层

app/
├── page.tsx             # 首页
├── market/[id]/page.tsx # 市场详情
├── world-cup/page.tsx   # 世界杯中心
├── leaderboard/page.tsx # 排行榜
├── portfolio/page.tsx   # 持仓 + 提现
├── referral/page.tsx    # 邀请中心
├── create/page.tsx      # 创建市场
└── admin/               # 管理后台 (15页)
    ├── page.tsx               # 总览
    ├── review/page.tsx        # 审核中心
    ├── create/page.tsx        # 市场创建
    ├── markets/page.tsx       # 市场管理
    ├── odds/page.tsx          # 赔率配置
    ├── featured/page.tsx      # 引流市场
    ├── users/page.tsx         # 用户管理
    ├── referrals/page.tsx     # 邀请管理
    ├── finance/page.tsx       # 财务统计
    ├── orders/page.tsx        # 订单管理
    ├── settlement/page.tsx    # 结算管理
    ├── withdrawals/page.tsx   # 提现管理
    ├── treasury/page.tsx      # 资金池
    └── settings/page.tsx      # 系统设置
```

---

> **文档版本**: v1.0  
> **最后更新**: 2026-06-08  
> **维护者**: FutureX 开发团队  
> **下一阶段**: 数据库接入 → API 开发 → 智能合约部署 → 预言机集成
