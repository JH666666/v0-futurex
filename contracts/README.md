# FutureX Smart Contracts

> 智能合约目录 | 待开发

## 目录结构

```
contracts/
├── README.md
├── src/
│   ├── MarketFactory.sol        # 市场工厂合约
│   ├── PredictionMarket.sol     # 单个预测市场（YES/NO 二元）
│   ├── OracleInterface.sol      # 预言机接口
│   ├── PaymentContract.sol      # 出款合约（批量打款）
│   ├── ReferralRewards.sol      # 返佣合约
│   ├── Treasury.sol             # 资金池管理
│   ├── XPToken.sol              # 积分代币 (ERC-20)
│   └── AchievementNFT.sol       # 成就徽章 (ERC-1155)
├── script/
│   ├── DeployBase.s.sol         # Base 主网部署脚本
│   └── DeployBSC.s.sol          # BSC 主网部署脚本
├── test/
│   ├── MarketFactory.t.sol
│   ├── PredictionMarket.t.sol
│   └── PaymentContract.t.sol
└── foundry.toml
```

## 合约说明

### MarketFactory.sol
- 职责：创建新的预测市场合约实例
- 参数：question, category, endDate, resolution, oracle, fee
- 事件：MarketCreated(address market, address creator, string question)

### PredictionMarket.sol
- 职责：单个 YES/NO 二元预测市场
- 函数：buyYes(), buyNo(), claim(), settle()
- 定价：固定乘积 AMM (x * y = k)
- 结算：预言机写入结果后，赢家按份额比例领取 USDC

### PaymentContract.sol
- 职责：批量出款，管理员触发，向多个地址发送 USDC/USDT
- 函数：batchTransfer(address[] to, uint256[] amounts)
- 权限：仅管理员

### ReferralRewards.sol
- 职责：5 级返佣，下注时自动分配
- 等级：L1=30%, L2=20%, L3=10%, L4=5%, L5=5%
- 函数：registerReferral(), distributeCommission()

## 技术栈

- Solidity ^0.8.24
- Foundry (编译/测试/部署)
- OpenZeppelin Contracts
- Chainlink (预言机)

## 开发命令

```bash
# 编译
forge build

# 测试
forge test

# 部署到 Base Sepolia
forge script script/DeployBase.s.sol --rpc-url $BASE_RPC --broadcast

# 部署到 BSC Testnet
forge script script/DeployBSC.s.sol --rpc-url $BSC_RPC --broadcast
```
