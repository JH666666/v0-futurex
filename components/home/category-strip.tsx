import Link from "next/link"
import { categoryMeta, type Category } from "@/lib/data"

const order: Category[] = ["worldcup", "crypto", "ai", "politics", "finance", "entertainment"]

export function CategoryStrip() {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {order.map((c) => (
        <Link
          key={c}
          href={c === "worldcup" ? "/world-cup" : `/?cat=${c}`}
          className="flex min-h-11 shrink-0 items-center gap-2 rounded-full glass px-4 text-sm font-medium transition-colors hover:border-primary/40"
        >
          <span aria-hidden className="text-base">
            {categoryMeta[c].emoji}
          </span>
          {categoryMeta[c].label}
        </Link>
      ))}
    </div>
  )
}
