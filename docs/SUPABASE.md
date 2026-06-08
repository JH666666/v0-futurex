# FutureX Supabase 部署指南

> 数据库: Supabase (PostgreSQL) | ORM: Prisma

## 第一步: 创建 Supabase 项目

1. 访问 https://supabase.com → 注册/登录
2. 点击 "New Project"
3. 填写项目名称: `futurex`
4. 设置数据库密码 (保存好密码)
5. 选择区域: Southeast Asia (Singapore) 或 US West
6. 等待项目创建完成 (约 2 分钟)

## 第二步: 获取连接信息

1. Supabase Dashboard → Settings → Database
2. 复制 Connection String:

```
postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
```

3. 粘贴到 `backend/.env` 的 `DATABASE_URL` 字段

## 第三步: 数据库迁移

```bash
cd backend

# 安装依赖
npm install

# 生成 Prisma Client
npx prisma generate

# 推送到 Supabase (开发环境)
npx prisma db push

# 或 执行迁移 (生产环境推荐)
npx prisma migrate dev --name init
```

## 第四步: 填充种子数据

```bash
npx tsx prisma/seed.ts
```

## 第五步: 切换为 Real Mode

```bash
# backend/.env
MOCK_MODE=false
```

重启后端:

```bash
npm run dev
# → http://localhost:4000
# Mock Mode: ❌ 关闭 (连接数据库)
```

## 验证

```bash
curl http://localhost:4000/api/health
# {"success":true,"message":"FutureX API Running"}

curl http://localhost:4000/api/markets
# 从 Supabase 返回市场数据 (如果无种子数据则为空)
```

## 模式切换

| `MOCK_MODE` | 数据来源 | 适用阶段 |
|:-----------:|----------|----------|
| `true` | 内存 Mock 数据 | 本地开发 |
| `false` | Supabase PostgreSQL | 测试/生产 |

前端无需任何修改。`lib/api-client.ts` 统一调用后端 API。

## 数据库表

| 表 | 说明 |
|----|------|
| users | 用户账户 + KYC + 风控 + 等级 |
| markets | 预测市场 |
| market_reviews | 市场审核记录 |
| orders | 下注订单 |
| positions | 持仓聚合 |
| settlements | 结算记录 |
| withdrawals | 提现记录 |
| referrals | 邀请关系 |
| commissions | 返佣记录 |
| treasury_records | 资金流记录 |
| activity_logs | 用户行为日志 |
| system_settings | 系统配置 |
