# FutureX Database ER Diagram v1.0

> 基于 PostgreSQL (Supabase) | 11 张表 | 2026-06-08

## 实体关系图 (Mermaid)

```mermaid
erDiagram
    users ||--o{ markets : "creates"
    users ||--o{ market_reviews : "reviews"
    users ||--o{ orders : "places"
    users ||--o{ positions : "holds"
    users ||--o{ settlements : "executes"
    users ||--o{ withdrawals : "requests"
    users ||--o{ referrals : "referred_as_user"
    users ||--o{ referrals : "referred_as_inviter"
    users ||--o{ commissions : "earns"
    users ||--o{ commissions : "pays_bet"
    users ||--o{ system_settings : "updates"

    markets ||--o{ market_reviews : "has"
    markets ||--o{ orders : "has"
    markets ||--o{ positions : "has"
    markets ||--|| settlements : "settled_by"

    orders ||--o{ commissions : "generates"

    users {
        uuid id PK
        varchar wallet_address UK
        varchar handle UK
        varchar referral_code UK
        uuid referred_by FK
        decimal balance
        decimal frozen_balance
        decimal total_earned
        decimal total_withdrawn
        enum role
        enum kyc_status
        enum status
        timestamp created_at
        timestamp updated_at
    }

    markets {
        uuid id PK
        text question
        enum category
        enum chain
        int yes_price
        decimal volume
        decimal liquidity
        int participants
        date end_date
        text resolution_source
        varchar resolution_contract
        enum outcome
        enum status
        boolean featured
        uuid creator_id FK
        timestamp created_at
        timestamp updated_at
    }

    market_reviews {
        uuid id PK
        uuid market_id FK
        uuid reviewer_id FK
        enum status
        text reject_reason
        timestamp reviewed_at
        timestamp created_at
    }

    orders {
        uuid id PK
        uuid user_id FK
        uuid market_id FK
        enum side
        decimal amount
        int price
        decimal shares
        decimal estimated_return
        enum status
        varchar tx_hash
        timestamp created_at
    }

    positions {
        uuid id PK
        uuid user_id FK
        uuid market_id FK
        enum side
        decimal total_amount
        int avg_price
        decimal shares
        int current_price
        decimal pnl
        enum status
        enum settled_outcome
        decimal settled_return
        timestamp created_at
        timestamp updated_at
    }

    settlements {
        uuid id PK
        uuid market_id FK
        enum outcome
        int total_positions
        decimal total_payout
        decimal total_frozen
        uuid settled_by FK
        varchar tx_hash
        timestamp settled_at
        timestamp created_at
    }

    withdrawals {
        uuid id PK
        uuid user_id FK
        enum chain
        varchar token
        decimal amount
        decimal fee
        decimal net_amount
        varchar to_address
        enum status
        boolean is_large
        text reject_reason
        uuid reviewed_by FK
        timestamp reviewed_at
        varchar tx_hash
        timestamp created_at
    }

    referrals {
        uuid id PK
        uuid user_id FK "UNIQUE"
        uuid inviter_id FK
        smallint level "1-5"
        timestamp created_at
    }

    commissions {
        uuid id PK
        uuid from_user_id FK
        uuid to_user_id FK
        uuid order_id FK
        smallint level
        smallint rate
        decimal bet_amount
        decimal commission_amount
        text market_question
        timestamp created_at
    }

    treasury_records {
        uuid id PK
        enum type
        enum chain
        varchar token
        decimal amount
        varchar from_address
        varchar to_address
        enum status
        varchar tx_hash
        text note
        timestamp created_at
    }

    system_settings {
        varchar key PK
        jsonb value
        text description
        uuid updated_by FK
        timestamp updated_at
    }
```

## 表关系总结

| 父表 | 子表 | 关系 | 外键 |
|------|------|------|------|
| users | markets | 1:N | creator_id |
| users | market_reviews | 1:N | reviewer_id |
| users | orders | 1:N | user_id |
| users | positions | 1:N | user_id |
| users | settlements | 1:N | settled_by |
| users | withdrawals | 1:N | user_id, reviewed_by |
| users | referrals | 1:N (双向) | user_id, inviter_id |
| users | commissions | 1:N (双向) | from_user_id, to_user_id |
| users | system_settings | 1:N | updated_by |
| markets | market_reviews | 1:N | market_id |
| markets | orders | 1:N | market_id |
| markets | positions | 1:N | market_id |
| markets | settlements | 1:1 | market_id |
| orders | commissions | 1:N | order_id |

## 索引清单

| 表 | 索引 | 类型 |
|----|------|------|
| users | wallet_address | UNIQUE |
| users | handle | UNIQUE |
| users | referral_code | UNIQUE |
| users | referred_by, role, status | BTREE |
| markets | category, chain, status, end_date | BTREE |
| markets | featured (partial) | BTREE |
| markets | question | GIN (全文搜索) |
| market_reviews | market_id, reviewer_id, status | BTREE |
| orders | (user_id, created_at), market_id, status | BTREE |
| positions | (user_id, market_id, side) WHERE open | UNIQUE |
| settlements | market_id, settled_at | BTREE |
| withdrawals | (user_id, created_at), status, is_large | BTREE |
| referrals | inviter_id, level | BTREE |
| commissions | (to_user_id, created_at), from_user_id, order_id, level | BTREE |
| treasury_records | type, chain, status, created_at | BTREE |
