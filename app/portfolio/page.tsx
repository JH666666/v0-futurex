import { PortfolioView } from "@/components/portfolio/portfolio-view"
import { WithdrawForm } from "@/components/portfolio/withdraw-form"

export default function PortfolioPage() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
      <PortfolioView />
      <WithdrawForm />
    </div>
  )
}
