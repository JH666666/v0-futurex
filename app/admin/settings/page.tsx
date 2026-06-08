"use client"

import { useState } from "react"
import { Save, Globe, DollarSign, Clock, Shield, Percent, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import { getWithdrawSettings, saveWithdrawSettings } from "@/lib/withdrawal-store"
import { getAllTreasuryConfigs, updateTreasuryConfig } from "@/lib/treasury-store"
import { chainOrder } from "@/lib/data"

type Settings = {
  platformName: string
  platformFee: number
  minTradeAmount: number
  maxMarketDuration: number
  defaultChain: "base" | "bsc"
  oracleTimeout: number
  requireApproval: boolean
  maintenanceMode: boolean
  referralRate: number
  // 提现相关
  minWithdrawAmount: number
  autoApproveLimit: number
  largeWithdrawLimit: number
  dailyWithdrawLimit: number
  autoWithdrawal: boolean
}

const wdDefaults = getWithdrawSettings()

const defaultSettings: Settings = {
  platformName: "FutureX",
  platformFee: 2.5,
  minTradeAmount: 10,
  maxMarketDuration: 365,
  defaultChain: "base",
  oracleTimeout: 24,
  requireApproval: true,
  maintenanceMode: false,
  referralRate: 5,
  minWithdrawAmount: wdDefaults.minWithdrawAmount,
  autoApproveLimit: wdDefaults.autoApproveLimit,
  largeWithdrawLimit: 10000,
  dailyWithdrawLimit: 50000,
  autoWithdrawal: false,
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [saved, setSaved] = useState(false)

  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  function handleSave() {
    // 同步提现设置
    saveWithdrawSettings({
      autoApproveLimit: settings.autoApproveLimit,
      minWithdrawAmount: settings.minWithdrawAmount,
      withdrawFee: 2,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">系统设置</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            配置平台参数与运营选项
          </p>
        </div>
        <button
          onClick={handleSave}
          className={cn(
            "inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-semibold transition-all active:scale-95",
            saved
              ? "bg-yes text-yes-foreground"
              : "bg-primary text-primary-foreground",
          )}
        >
          <Save className="size-4" />
          {saved ? "已保存" : "保存设置"}
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Platform */}
        <SettingCard icon={Globe} title="平台信息">
          <Field label="平台名称">
            <input
              value={settings.platformName}
              onChange={(e) => update("platformName", e.target.value)}
              className="h-10 w-full rounded-xl bg-secondary/60 px-4 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </Field>
          <Field label="默认链">
            <select
              value={settings.defaultChain}
              onChange={(e) => update("defaultChain", e.target.value as "base" | "bsc")}
              className="h-10 w-full rounded-xl bg-secondary/60 px-4 text-sm outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="base">Base</option>
              <option value="bsc">BNB Smart Chain</option>
            </select>
          </Field>
        </SettingCard>

        {/* Fee */}
        <SettingCard icon={Percent} title="费率配置">
          <Field label="平台手续费 (%)">
            <input
              type="number"
              step="0.1"
              min="0"
              max="10"
              value={settings.platformFee}
              onChange={(e) => update("platformFee", Number(e.target.value))}
              className="h-10 w-full rounded-xl bg-secondary/60 px-4 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </Field>
          <Field label="邀请返佣率 (%)">
            <input
              type="number"
              step="0.5"
              min="0"
              max="20"
              value={settings.referralRate}
              onChange={(e) => update("referralRate", Number(e.target.value))}
              className="h-10 w-full rounded-xl bg-secondary/60 px-4 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </Field>
          <Field label="最小交易额 (USDC)">
            <input
              type="number"
              min="1"
              value={settings.minTradeAmount}
              onChange={(e) => update("minTradeAmount", Number(e.target.value))}
              className="h-10 w-full rounded-xl bg-secondary/60 px-4 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </Field>
        </SettingCard>

        <SettingCard icon={Clock} title="提现规则">
          <Field label="最小提现金额 (USDC)">
            <input
              type="number"
              min="1"
              value={settings.minWithdrawAmount ?? 10}
              onChange={(e) => update("minWithdrawAmount", Number(e.target.value))}
              className="h-10 w-full rounded-xl bg-secondary/60 px-4 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </Field>
          <Field label="自动审核阈值 (USDC)">
            <input
              type="number"
              min="0"
              value={settings.autoApproveLimit ?? 1000}
              onChange={(e) => update("autoApproveLimit", Number(e.target.value))}
              className="h-10 w-full rounded-xl bg-secondary/60 px-4 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </Field>
          <Field label="大额审核阈值 (USDC)">
            <input
              type="number"
              min="0"
              value={settings.largeWithdrawLimit ?? 10000}
              onChange={(e) => update("largeWithdrawLimit", Number(e.target.value))}
              className="h-10 w-full rounded-xl bg-secondary/60 px-4 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </Field>
          <Field label="用户单日提现上限 (USDC)">
            <input
              type="number"
              min="0"
              value={settings.dailyWithdrawLimit ?? 50000}
              onChange={(e) => update("dailyWithdrawLimit", Number(e.target.value))}
              className="h-10 w-full rounded-xl bg-secondary/60 px-4 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </Field>
          <Field label="自动提现">
            <Toggle
              checked={settings.autoWithdrawal ?? false}
              onChange={(v) => update("autoWithdrawal", v)}
            />
          </Field>
        </SettingCard>

        {/* Market */}
        {/* 资金地址配置 */}
        <SettingCard icon={Globe} title="资金地址配置">
          {chainOrder.map((chain) => {
            const cfg = getAllTreasuryConfigs().find((c) => c.chain === chain)
            return (
              <div key={chain} className="flex flex-col gap-3 rounded-xl bg-secondary/40 p-3">
                <span className="text-xs font-bold">{chain === "base" ? "Base" : "BNB Smart Chain"}</span>
                <Field label="收款地址">
                  <input
                    value={cfg?.collectionAddress || ""}
                    onChange={(e) => updateTreasuryConfig(chain, { collectionAddress: e.target.value })}
                    placeholder="0x..."
                    className="h-10 w-full rounded-xl bg-secondary/60 px-3 font-mono text-xs outline-none focus:ring-2 focus:ring-primary"
                  />
                </Field>
                <Field label="出款合约地址">
                  <input
                    value={cfg?.paymentContractAddress || ""}
                    onChange={(e) => updateTreasuryConfig(chain, { paymentContractAddress: e.target.value })}
                    placeholder="0x..."
                    className="h-10 w-full rounded-xl bg-secondary/60 px-3 font-mono text-xs outline-none focus:ring-2 focus:ring-primary"
                  />
                </Field>
                <Field label="代币合约地址">
                  <input
                    value={cfg?.tokenAddress || ""}
                    onChange={(e) => updateTreasuryConfig(chain, { tokenAddress: e.target.value })}
                    placeholder="0x..."
                    className="h-10 w-full rounded-xl bg-secondary/60 px-3 font-mono text-xs outline-none focus:ring-2 focus:ring-primary"
                  />
                </Field>
              </div>
            )
          })}
        </SettingCard>

        <SettingCard icon={Clock} title="市场规则">
          <Field label="市场最长有效期 (天)">
            <input
              type="number"
              min="1"
              max="730"
              value={settings.maxMarketDuration}
              onChange={(e) => update("maxMarketDuration", Number(e.target.value))}
              className="h-10 w-full rounded-xl bg-secondary/60 px-4 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </Field>
          <Field label="预言机超时 (小时)">
            <input
              type="number"
              min="1"
              max="168"
              value={settings.oracleTimeout}
              onChange={(e) => update("oracleTimeout", Number(e.target.value))}
              className="h-10 w-full rounded-xl bg-secondary/60 px-4 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </Field>
          <Field label="新市场需审核">
            <Toggle
              checked={settings.requireApproval}
              onChange={(v) => update("requireApproval", v)}
            />
          </Field>
        </SettingCard>

        {/* Security */}
        <SettingCard icon={Shield} title="安全与维护">
          <Field label="维护模式">
            <Toggle
              checked={settings.maintenanceMode}
              onChange={(v) => update("maintenanceMode", v)}
            />
          </Field>
          {settings.maintenanceMode && (
            <div className="rounded-xl bg-no/10 px-4 py-3 text-sm text-no">
              <Zap className="inline size-3.5 mr-1" />
              维护模式下用户将无法进行交易。
            </div>
          )}
        </SettingCard>
      </div>

      {/* Danger zone */}
      <div className="rounded-2xl glass p-5 ring-1 ring-no/30">
        <h2 className="mb-1 flex items-center gap-2 font-bold text-no">
          <Shield className="size-5" />
          危险操作
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">
          这些操作不可撤销，请谨慎执行。
        </p>
        <div className="flex flex-wrap gap-3">
          <button className="h-10 rounded-xl bg-no/10 px-4 text-sm font-semibold text-no hover:bg-no/20 transition-colors">
            暂停所有市场
          </button>
          <button className="h-10 rounded-xl bg-no/10 px-4 text-sm font-semibold text-no hover:bg-no/20 transition-colors">
            重置平台数据
          </button>
          <button className="h-10 rounded-xl bg-no/10 px-4 text-sm font-semibold text-no hover:bg-no/20 transition-colors">
            强制结算全部市场
          </button>
        </div>
      </div>
    </div>
  )
}

function SettingCard({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Globe
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl glass p-5">
      <h2 className="flex items-center gap-2 font-bold">
        <Icon className="size-4 text-primary" />
        {title}
      </h2>
      {children}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-7 w-12 rounded-full transition-colors",
        checked ? "bg-primary" : "bg-secondary",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 size-6 rounded-full bg-white transition-transform",
          checked ? "translate-x-5" : "translate-x-0",
        )}
      />
    </button>
  )
}
