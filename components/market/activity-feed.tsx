import { Activity as ActivityIcon } from "lucide-react"
import { activityFeed } from "@/lib/data"
import { cn } from "@/lib/utils"

export function ActivityFeed() {
  return (
    <div className="flex flex-col gap-3 rounded-2xl glass p-5">
      <div className="flex items-center gap-2">
        <ActivityIcon className="size-4 text-primary" />
        <h2 className="font-bold">实时动态</h2>
        <span className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="size-1.5 animate-pulse rounded-full bg-yes" />
          实时
        </span>
      </div>
      <ul className="flex flex-col divide-y divide-border/60">
        {activityFeed.map((a) => (
          <li key={a.id} className="flex items-center gap-3 py-2.5 text-sm">
            <span className="font-mono text-xs text-muted-foreground">{a.user}</span>
            <span className="text-muted-foreground">{a.action === "buy" ? "买入" : "卖出"}</span>
            <span
              className={cn(
                "rounded-md px-1.5 py-0.5 text-xs font-bold",
                a.side === "YES" ? "bg-yes/15 text-yes" : "bg-no/15 text-no",
              )}
            >
              {a.side}
            </span>
            <span className="num text-xs text-muted-foreground">
              {a.amount.toLocaleString()} 份 @ {a.price}¢
            </span>
            <span className="ml-auto shrink-0 text-xs text-muted-foreground">{a.time}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
