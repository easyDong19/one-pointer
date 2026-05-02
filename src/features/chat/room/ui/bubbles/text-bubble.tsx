"use client"

import { cn } from "@/shared/lib/utils"

type Props = {
  content: string
  isMine: boolean
}

export function TextBubble({ content, isMine }: Props) {
  return (
    <div
      className={cn(
        "max-w-[260px] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap break-words md:max-w-[320px]",
        isMine
          ? "bg-primary-light text-foreground rounded-br-sm"
          : "bg-muted text-foreground rounded-bl-sm",
      )}
    >
      {content}
    </div>
  )
}
