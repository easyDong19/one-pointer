"use client"

import { ChevronRight, Package } from "lucide-react"

import { Text } from "@/shared/ui/text"
import { cn } from "@/shared/lib/utils"

type Props = {
  content: string
  isMine: boolean
  onClick?: () => void
}

export function DeliveryBubble({ content, isMine, onClick }: Props) {
  const isInteractive = onClick != null

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!isInteractive}
      className={cn(
        "border-border flex max-w-[260px] flex-col items-stretch gap-2 rounded-2xl border bg-background p-3 text-left md:max-w-[320px]",
        isMine ? "rounded-br-sm" : "rounded-bl-sm",
        isInteractive && "hover:bg-accent transition-colors",
      )}
    >
      <div className="flex items-center gap-2">
        <div className="bg-primary-light flex h-7 w-7 items-center justify-center rounded-md">
          <Package className="text-primary h-4 w-4" />
        </div>
        <Text typography="caption1-bold" className="text-foreground">
          작업물
        </Text>
      </div>

      {content && (
        <Text
          as="p"
          typography="caption1-medium"
          className="text-muted-foreground line-clamp-2"
        >
          {content}
        </Text>
      )}

      <div className="border-border/50 mt-1 flex items-center justify-between border-t pt-2">
        <Text
          as="span"
          typography="caption2-medium"
          className="text-muted-foreground"
        >
          작업물 확인하기
        </Text>
        <ChevronRight className="text-muted-foreground h-3.5 w-3.5" />
      </div>
    </button>
  )
}
