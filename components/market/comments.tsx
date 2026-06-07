"use client"

import { useState } from "react"
import { MessageCircle, ThumbsUp } from "lucide-react"
import { cn } from "@/lib/utils"

const initial = [
  { id: 1, user: "vitalik.base", side: "YES", text: "基本面很扎实，赔率被低估了。", likes: 42, time: "2 小时前" },
  { id: 2, user: "degen.base", side: "NO", text: "我觉得市场过热，回调风险大。", likes: 18, time: "5 小时前" },
  { id: 3, user: "alpha.base", side: "YES", text: "已加仓，预言机来源很可靠。", likes: 31, time: "1 天前" },
]

export function Comments() {
  const [comments, setComments] = useState(initial)
  const [text, setText] = useState("")

  function add() {
    if (!text.trim()) return
    setComments([{ id: Date.now(), user: "you.base", side: "YES", text, likes: 0, time: "刚刚" }, ...comments])
    setText("")
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl glass p-5">
      <h3 className="flex items-center gap-2 font-bold">
        <MessageCircle className="size-5 text-primary" />
        讨论 ({comments.length})
      </h3>

      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="发表你的看法…"
          className="h-11 w-full rounded-xl bg-secondary/60 px-4 text-sm outline-none placeholder:text-muted-foreground"
        />
        <button onClick={add} className="h-11 shrink-0 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground">
          发送
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {comments.map((c) => (
          <div key={c.id} className="flex gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold">
              {c.user.slice(0, 2).toUpperCase()}
            </span>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold num">{c.user}</span>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-bold",
                    c.side === "YES" ? "bg-yes/15 text-yes" : "bg-no/15 text-no",
                  )}
                >
                  {c.side}
                </span>
                <span className="text-xs text-muted-foreground">{c.time}</span>
              </div>
              <p className="mt-1 text-sm leading-relaxed text-foreground/90">{c.text}</p>
              <button className="mt-1.5 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                <ThumbsUp className="size-3.5" /> {c.likes}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
