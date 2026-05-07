"use client"

import { Text } from "@/shared/ui/text"
import { cn } from "@/shared/lib/utils"

import {
  NOTIFICATION_TABS,
  type NotificationFilterTab,
} from "../lib/notification-filter"

type Props = {
  active: NotificationFilterTab
  onChange: (next: NotificationFilterTab) => void
}

export function NotificationFilterTabs({ active, onChange }: Props) {
  return (
    <div role="tablist" className="border-border flex items-center gap-1 border-b">
      {NOTIFICATION_TABS.map((tab) => {
        const isActive = tab.key === active
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.key)}
            className={cn(
              "relative inline-flex items-center px-3 py-2.5 transition-colors",
              isActive
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Text as="span" typography="body2-bold">
              {tab.label}
            </Text>
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
