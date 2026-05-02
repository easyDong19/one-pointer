"use client"

import Link from "next/link"
import { User } from "lucide-react"

import type { ChatRoomSummary } from "@/entities/chat/api/chat.schema"
import { Text } from "@/shared/ui/text"
import { cn } from "@/shared/lib/utils"

import { formatChatTime } from "../lib/chat-time"
import { formatLastMessagePreview } from "../lib/format-last-message"

type Props = {
  room: ChatRoomSummary
  /** 데스크탑 sidebar 모드에서 현재 라우트와 매치되는 방에만 true. 모바일은 사실상 의미 없음. */
  isActive?: boolean
}

export function ChatRoomItem({ room, isActive = false }: Props) {
  if (!room.roomId) return null

  const unread = room.unreadCount ?? 0
  const hasUnread = unread > 0
  const previewText = formatLastMessagePreview(room.lastMessageType, room.lastMessage)

  return (
    <Link
      href={`/chat/${room.roomId}`}
      className={cn(
        "relative flex items-center gap-3 px-4 py-3 transition-colors",
        "hover:bg-muted/40",
        // sidebar (md+) 전용 톤
        "md:gap-2.5 md:px-3 md:py-2.5",
        "md:hover:bg-sidebar-accent/50",
        // unread (active 가 아닐 때만 적용)
        hasUnread && !isActive && "bg-primary-light/30",
        // active (md+ 에서만 의미. 모바일은 동시 노출 없음)
        isActive &&
          "md:bg-sidebar-accent md:hover:bg-sidebar-accent md:before:bg-primary md:before:absolute md:before:top-0 md:before:bottom-0 md:before:left-0 md:before:w-[2px]",
      )}
    >
      <Avatar
        imageUrl={room.opponentProfileImageUrl}
        nickname={room.opponentNickname ?? "상대방"}
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Text
            as="span"
            typography="body2-bold"
            className="text-foreground truncate"
          >
            {room.opponentNickname ?? "상대방"}
          </Text>
          {room.ticketTitle && (
            <>
              <span aria-hidden className="text-muted-foreground/60 text-xs">
                ·
              </span>
              <Text
                as="span"
                typography="caption1-medium"
                className="text-muted-foreground truncate"
              >
                {room.ticketTitle}
              </Text>
            </>
          )}
          {room.statusLabel && (
            <span className="bg-muted text-muted-foreground ml-auto shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium md:hidden">
              {room.statusLabel}
            </span>
          )}
        </div>

        <Text
          as="p"
          typography="caption1-medium"
          className={cn(
            "mt-1 truncate",
            hasUnread || isActive ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {previewText || "새로운 메시지가 없습니다"}
        </Text>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1">
        {room.lastMessageAt && (
          <Text
            as="span"
            typography="caption2-medium"
            className="text-muted-foreground tabular-nums"
          >
            {formatChatTime(room.lastMessageAt)}
          </Text>
        )}
        {hasUnread && (
          <span className="bg-primary text-primary-foreground inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold tabular-nums">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </div>
    </Link>
  )
}

function Avatar({
  imageUrl,
  nickname,
}: {
  imageUrl: string | null | undefined
  nickname: string
}) {
  return (
    <div className="bg-muted relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full md:h-10 md:w-10">
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt={nickname} className="h-full w-full object-cover" />
      ) : (
        <User className="text-muted-foreground/40 h-6 w-6 md:h-5 md:w-5" />
      )}
    </div>
  )
}
