-- ============================================================================
-- FutureX Database Schema v1.0
-- PostgreSQL (Supabase)
-- ============================================================================
-- 使用方法:
--   1. Supabase Dashboard → SQL Editor → 粘贴执行
--   2. 或: psql -h <host> -U <user> -d <db> -f schema.sql
-- ============================================================================

-- ═══════════════════════════════════════════════════════════════════════════
-- 0. 扩展 + 类型定义
-- ═══════════════════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 品类枚举
DO $$ BEGIN
  CREATE TYPE market_category AS ENUM (
    'worldcup', 'crypto', 'ai', 'politics', 'finance', 'entertainment'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 链枚举
DO $$ BEGIN
  CREATE TYPE chain_type AS ENUM ('base', 'bsc');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 用户角色
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM (
    'user', 'admin', 'finance', 'auditor', 'operator', 'super_admin'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 用户状态
DO $$ BEGIN
  CREATE TYPE user_status AS ENUM ('active', 'banned', 'pending');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- KYC 状态
DO $$ BEGIN
  CREATE TYPE kyc_status AS ENUM ('unverified', 'pending', 'verified', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 市场状态
DO $$ BEGIN
  CREATE TYPE market_status AS ENUM ('active', 'settled', 'disputed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 审核状态
DO $$ BEGIN
  CREATE TYPE review_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 订单状态
DO $$ BEGIN
  CREATE TYPE order_status AS ENUM ('filled', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 订单方向
DO $$ BEGIN
  CREATE TYPE order_side AS ENUM ('YES', 'NO');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 持仓状态
DO $$ BEGIN
  CREATE TYPE position_status AS ENUM ('open', 'settled', 'closed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 提现状态
DO $$ BEGIN
  CREATE TYPE withdrawal_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'PAID');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 资金流类型
DO $$ BEGIN
  CREATE TYPE treasury_tx_type AS ENUM ('inflow', 'outflow');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 资金流状态
DO $$ BEGIN
  CREATE TYPE treasury_tx_status AS ENUM ('confirmed', 'pending', 'failed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- 自动更新 updated_at 触发器
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. users — 用户账户
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address  VARCHAR(42)  NOT NULL,
  username        VARCHAR(50),
  handle          VARCHAR(30),
  email           VARCHAR(255),
  avatar_url      TEXT,
  referral_code   VARCHAR(20),
  referred_by     UUID         REFERENCES users(id) ON DELETE SET NULL,

  -- 余额
  balance         DECIMAL(18,2) NOT NULL DEFAULT 0,
  frozen_balance  DECIMAL(18,2) NOT NULL DEFAULT 0,
  total_earned    DECIMAL(18,2) NOT NULL DEFAULT 0,
  total_withdrawn DECIMAL(18,2) NOT NULL DEFAULT 0,
  total_deposited DECIMAL(18,2) NOT NULL DEFAULT 0,

  -- 身份
  role            user_role    NOT NULL DEFAULT 'user',
  kyc_status      kyc_status   NOT NULL DEFAULT 'unverified',
  status          user_status  NOT NULL DEFAULT 'active',

  last_login_at   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- 索引
CREATE UNIQUE INDEX idx_users_wallet     ON users(wallet_address);
CREATE UNIQUE INDEX idx_users_handle     ON users(handle) WHERE handle IS NOT NULL;
CREATE UNIQUE INDEX idx_users_ref_code   ON users(referral_code) WHERE referral_code IS NOT NULL;
CREATE        INDEX idx_users_referred   ON users(referred_by);
CREATE        INDEX idx_users_role       ON users(role);
CREATE        INDEX idx_users_status     ON users(status);
CREATE        INDEX idx_users_created    ON users(created_at DESC);

-- 触发器
CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. markets — 预测市场
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE markets (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question            TEXT            NOT NULL,
  description         TEXT,
  category            market_category NOT NULL,
  chain               chain_type      NOT NULL DEFAULT 'base',
  yes_price           INTEGER         NOT NULL DEFAULT 50 CHECK (yes_price >= 1 AND yes_price <= 99),
  volume              DECIMAL(18,2)   NOT NULL DEFAULT 0,
  liquidity           DECIMAL(18,2)   NOT NULL DEFAULT 0,
  participants        INTEGER         NOT NULL DEFAULT 0,
  end_date            DATE            NOT NULL,
  resolution_source   TEXT            NOT NULL,
  resolution_contract VARCHAR(42),
  outcome             order_side,     -- YES or NULL
  status              market_status   NOT NULL DEFAULT 'active',
  featured            BOOLEAN         NOT NULL DEFAULT false,
  featured_until      DATE,
  creator_id          UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_markets_category   ON markets(category);
CREATE INDEX idx_markets_chain      ON markets(chain);
CREATE INDEX idx_markets_status     ON markets(status);
CREATE INDEX idx_markets_end_date   ON markets(end_date);
CREATE INDEX idx_markets_featured   ON markets(featured) WHERE featured = true;
CREATE INDEX idx_markets_creator    ON markets(creator_id);
CREATE INDEX idx_markets_created    ON markets(created_at DESC);
CREATE INDEX idx_markets_question   ON markets USING GIN (to_tsvector('simple', question));

CREATE TRIGGER trg_markets_updated_at
  BEFORE UPDATE ON markets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════════════════
-- 3. market_reviews — 市场审核记录
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE market_reviews (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id     UUID           NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
  reviewer_id   UUID           NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status        review_status  NOT NULL DEFAULT 'pending',
  reject_reason TEXT,
  reviewed_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reviews_market   ON market_reviews(market_id);
CREATE INDEX idx_reviews_reviewer ON market_reviews(reviewer_id);
CREATE INDEX idx_reviews_status   ON market_reviews(status);
CREATE INDEX idx_reviews_created  ON market_reviews(created_at DESC);

-- ═══════════════════════════════════════════════════════════════════════════
-- 4. orders — 下注订单
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE orders (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  market_id        UUID            NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
  side             order_side      NOT NULL,
  amount           DECIMAL(18,2)   NOT NULL CHECK (amount > 0),
  price            INTEGER         NOT NULL CHECK (price >= 1 AND price <= 99),
  shares           DECIMAL(18,6)   NOT NULL,
  estimated_return DECIMAL(18,2)   NOT NULL,
  status           order_status    NOT NULL DEFAULT 'filled',
  tx_hash          VARCHAR(66),
  created_at       TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_user      ON orders(user_id, created_at DESC);
CREATE INDEX idx_orders_market    ON orders(market_id);
CREATE INDEX idx_orders_status    ON orders(status);
CREATE INDEX idx_orders_created   ON orders(created_at DESC);

-- ═══════════════════════════════════════════════════════════════════════════
-- 5. positions — 持仓聚合
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE positions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  market_id        UUID            NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
  side             order_side      NOT NULL,
  total_amount     DECIMAL(18,2)   NOT NULL DEFAULT 0,
  avg_price        INTEGER         NOT NULL DEFAULT 0,
  shares           DECIMAL(18,6)   NOT NULL DEFAULT 0,
  current_price    INTEGER         NOT NULL DEFAULT 0,
  pnl              DECIMAL(18,2)   NOT NULL DEFAULT 0,
  status           position_status NOT NULL DEFAULT 'open',
  settled_outcome  order_side,
  settled_return   DECIMAL(18,2),
  created_at       TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- 每个用户在同一市场同一方向只有一条 open 持仓
CREATE UNIQUE INDEX idx_positions_unique
  ON positions(user_id, market_id, side) WHERE status = 'open';
CREATE INDEX idx_positions_market  ON positions(market_id, status);
CREATE INDEX idx_positions_user    ON positions(user_id, status);

CREATE TRIGGER trg_positions_updated_at
  BEFORE UPDATE ON positions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════════════════
-- 6. settlements — 结算记录
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE settlements (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id       UUID            NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
  outcome         order_side      NOT NULL,
  total_positions INTEGER         NOT NULL DEFAULT 0,
  total_payout    DECIMAL(18,2)   NOT NULL DEFAULT 0,
  total_frozen    DECIMAL(18,2)   NOT NULL DEFAULT 0,
  settled_by      UUID            NOT NULL REFERENCES users(id),
  tx_hash         VARCHAR(66),
  settled_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_settlements_market ON settlements(market_id);
CREATE INDEX idx_settlements_date   ON settlements(settled_at DESC);

-- ═══════════════════════════════════════════════════════════════════════════
-- 7. withdrawals — 提现记录
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE withdrawals (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID              NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  chain         chain_type        NOT NULL,
  token         VARCHAR(10)       NOT NULL DEFAULT 'USDC',
  amount        DECIMAL(18,2)     NOT NULL CHECK (amount > 0),
  fee           DECIMAL(18,2)     NOT NULL DEFAULT 2,
  net_amount    DECIMAL(18,2)     NOT NULL,
  to_address    VARCHAR(42)       NOT NULL,
  status        withdrawal_status NOT NULL DEFAULT 'PENDING',
  is_large      BOOLEAN           NOT NULL DEFAULT false,
  reject_reason TEXT,
  reviewed_by   UUID              REFERENCES users(id),
  reviewed_at   TIMESTAMPTZ,
  tx_hash       VARCHAR(66),
  created_at    TIMESTAMPTZ       NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_withdrawals_user   ON withdrawals(user_id, created_at DESC);
CREATE INDEX idx_withdrawals_status ON withdrawals(status);
CREATE INDEX idx_withdrawals_large  ON withdrawals(is_large) WHERE is_large = true;

-- ═══════════════════════════════════════════════════════════════════════════
-- 8. referrals — 邀请关系
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE referrals (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  inviter_id  UUID      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  level       SMALLINT  NOT NULL DEFAULT 1 CHECK (level >= 1 AND level <= 5),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- 每个用户只能有一个邀请人
  CONSTRAINT uq_referrals_user UNIQUE (user_id)
);

CREATE INDEX idx_referrals_inviter ON referrals(inviter_id);
CREATE INDEX idx_referrals_level   ON referrals(level);

-- ═══════════════════════════════════════════════════════════════════════════
-- 9. commissions — 返佣记录
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE commissions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id      UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_user_id        UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_id          UUID            NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  level             SMALLINT        NOT NULL CHECK (level >= 1 AND level <= 5),
  rate              SMALLINT        NOT NULL CHECK (rate >= 1 AND rate <= 100),
  bet_amount        DECIMAL(18,2)   NOT NULL,
  commission_amount DECIMAL(18,2)   NOT NULL,
  market_question   TEXT            NOT NULL,
  created_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_commissions_to     ON commissions(to_user_id, created_at DESC);
CREATE INDEX idx_commissions_from   ON commissions(from_user_id);
CREATE INDEX idx_commissions_order  ON commissions(order_id);
CREATE INDEX idx_commissions_level  ON commissions(level);

-- ═══════════════════════════════════════════════════════════════════════════
-- 10. treasury_records — 资金流记录
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE treasury_records (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type         treasury_tx_type   NOT NULL,
  chain        chain_type         NOT NULL,
  token        VARCHAR(10)        NOT NULL,
  amount       DECIMAL(18,2)      NOT NULL,
  from_address VARCHAR(42),
  to_address   VARCHAR(42),
  status       treasury_tx_status NOT NULL DEFAULT 'pending',
  tx_hash      VARCHAR(66),
  note         TEXT,
  created_at   TIMESTAMPTZ        NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_treasury_type    ON treasury_records(type);
CREATE INDEX idx_treasury_chain   ON treasury_records(chain);
CREATE INDEX idx_treasury_status  ON treasury_records(status);
CREATE INDEX idx_treasury_created ON treasury_records(created_at DESC);

-- ═══════════════════════════════════════════════════════════════════════════
-- 11. system_settings — 系统配置
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE system_settings (
  key         VARCHAR(50)  PRIMARY KEY,
  value       JSONB        NOT NULL DEFAULT '{}',
  description TEXT,
  updated_by  UUID         REFERENCES users(id),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════════════
-- 默认配置数据
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO system_settings (key, value, description) VALUES
  ('platform_name',           '"FutureX"',                        '平台名称'),
  ('platform_fee',            '2.5',                              '平台手续费 (%)'),
  ('min_trade_amount',        '10',                               '最小交易额 (USDC)'),
  ('max_market_duration',     '365',                              '市场最长有效期 (天)'),
  ('default_chain',           '"base"',                           '默认链'),
  ('oracle_timeout_hours',    '24',                               '预言机超时 (小时)'),
  ('require_market_approval', 'true',                             '新市场需审核'),
  ('maintenance_mode',        'false',                            '维护模式'),
  ('auto_approve_limit',      '100',                              '自动提现阈值 (USDT)'),
  ('min_withdraw_amount',     '10',                               '最小提现金额'),
  ('withdraw_fee',            '2',                                '提现手续费 (固定)'),
  ('daily_withdraw_limit',    '50000',                            '用户单日提现上限'),
  ('single_withdraw_limit',   '25000',                            '单笔提现上限'),
  ('referral_rate_l1',        '30',                               '一级返佣 (%)'),
  ('referral_rate_l2',        '20',                               '二级返佣 (%)'),
  ('referral_rate_l3',        '10',                               '三级返佣 (%)'),
  ('referral_rate_l4',        '5',                                '四级返佣 (%)'),
  ('referral_rate_l5',        '5',                                '五级返佣 (%)')
ON CONFLICT (key) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- 视图：管理后台仪表盘数据
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE VIEW admin_dashboard AS
SELECT
  (SELECT COUNT(*) FROM markets WHERE status = 'active')   AS active_markets,
  (SELECT COUNT(*) FROM markets)                            AS total_markets,
  (SELECT COUNT(*) FROM users WHERE status = 'active')     AS active_users,
  (SELECT COUNT(*) FROM users)                              AS total_users,
  (SELECT COALESCE(SUM(amount), 0) FROM orders WHERE status = 'filled'
    AND created_at >= CURRENT_DATE)                         AS today_volume,
  (SELECT COALESCE(SUM(amount), 0) FROM withdrawals WHERE status = 'PENDING')
                                                           AS pending_withdrawals;

-- ═══════════════════════════════════════════════════════════════════════════
-- RLS (Row Level Security) — Supabase 安全策略
-- ═══════════════════════════════════════════════════════════════════════════

-- 启用 RLS
ALTER TABLE users            ENABLE ROW LEVEL SECURITY;
ALTER TABLE markets          ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_reviews   ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders           ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlements      ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals      ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals        ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE treasury_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings  ENABLE ROW LEVEL SECURITY;

-- 用户只能读取自己的数据
CREATE POLICY users_self ON users
  FOR SELECT USING (auth.uid()::text = wallet_address);
CREATE POLICY users_self_update ON users
  FOR UPDATE USING (auth.uid()::text = wallet_address);

-- 所有人可以读取活跃市场
CREATE POLICY markets_public_read ON markets
  FOR SELECT USING (status = 'active');

-- 用户只能读取自己的订单
CREATE POLICY orders_self ON orders
  FOR SELECT USING (auth.uid()::text = (SELECT wallet_address FROM users WHERE id = user_id));
CREATE POLICY orders_self_insert ON orders
  FOR INSERT WITH CHECK (auth.uid()::text = (SELECT wallet_address FROM users WHERE id = user_id));

-- 用户只能读取自己的持仓
CREATE POLICY positions_self ON positions
  FOR SELECT USING (auth.uid()::text = (SELECT wallet_address FROM users WHERE id = user_id));

-- 用户只能读取自己的提现
CREATE POLICY withdrawals_self ON withdrawals
  FOR SELECT USING (auth.uid()::text = (SELECT wallet_address FROM users WHERE id = user_id));
CREATE POLICY withdrawals_self_insert ON withdrawals
  FOR INSERT WITH CHECK (auth.uid()::text = (SELECT wallet_address FROM users WHERE id = user_id));

-- 管理员可以读取所有数据（简化版，生产环境需要基于 role 的细粒度策略）
-- CREATE POLICY admin_all ON markets FOR ALL USING (is_admin());

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
