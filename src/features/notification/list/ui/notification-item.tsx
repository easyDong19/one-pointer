"use client"

import { MoreHorizontal, Trash2 } from "lucide-react"

import type { Notification } from "@/entities/notification/api/notification.schema"
import { Text } from "@/shared/ui/text"
import { cn } from "@/shared/lib/utils"
import { formatRelativeTime } from "@/shared/lib/format"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu"

type Props = {
  notification: Notification
  onNavigate: () => void
  onDelete: () => void
}

export function NotificationItem({ notification, onNavigate, onDelete }: Props) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onNavigate}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onNavigate()
        }
      }}
      className={cn(
        "relative flex cursor-pointer items-start gap-3 px-4 py-3 transition-colors",
        "hover:bg-muted/40",
        !notification.isRead && "bg-primary/5",
      )}
    >
      <div className="min-w-0 flex-1">
        <Text
          as="p"
          typography="body3-bold"
          className="text-foreground truncate"
        >
          {notification.title}
        </Text>
        <Text
          as="p"
          typography="caption1-medium"
          className="text-muted-foreground mt-0.5 line-clamp-2"
        >
          {notification.body}
        </Text>
        <Text
          as="span"
          typography="caption2-medium"
          className="text-muted-foreground mt-1 block tabular-nums"
        >
          {formatRelativeTime(notification.createdAt)}
        </Text>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        {!notification.isRead && (
          <span className="bg-primary size-2 rounded-full" aria-label="읽지 않음" />
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              onClick={(e) => e.stopPropagation()}
              className="text-muted-foreground hover:text-foreground rounded-md p-1 transition-colors"
            >
              <MoreHorizontal className="size-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 size-4" />
              삭제
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
