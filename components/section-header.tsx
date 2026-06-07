import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function SectionHeader({
  title,
  subtitle,
  href,
  cta,
}: {
  title: string
  subtitle?: string
  href?: string
  cta?: string
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-xl font-bold tracking-tight sm:text-2xl">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {href && (
        <Link
          href={href}
          className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:underline"
        >
          {cta ?? "查看全部"}
          <ArrowRight className="size-4" />
        </Link>
      )}
    </div>
  )
}
