"use client"

import { Text } from "@/shared/ui/text"
import { cn } from "@/shared/lib/utils"

import { CHAT_TABS, type ChatFilterTab } from "../lib/chat-filter"

type Props = {
  active: ChatFilterTab
  onChange: (next: ChatFilterTab) => void
  inProgressCount: number
}

export function ChatRoomFilterTabs({ active, onChange, inProgressCount }: Props) {
  return (
    <div role="tablist" className="border-border flex items-center gap-1 border-b">
      {CHAT_TABS.map((tab) => {
        const isActive = tab.key === active
        const showBadge = tab.key === "IN_PROGRESS" && inProgressCount > 0
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.key)}
            className={cn(
              "relative inline-flex items-center gap-1.5 px-3 py-2.5 transition-colors",
              isActive
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Text as="span" typography="body2-bold">
              {tab.label}
            </Text>
            {showBadge && (
              <span className="bg-primary text-primary-foreground inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold">
                {inProgressCount}
              </span>
            )}
            {isActive && (
              <span
                aria-hidden
                className="bg-primary absolute right-0 bottom-0 left-0 h-0.5"
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
