"use client"

import Link from "next/link"
import { ArrowUpRight, FileText } from "lucide-react"

import type { TicketProgressInfo } from "@/entities/chat/api/chat.schema"
import { Text } from "@/shared/ui/text"

type Props = {
  progress: TicketProgressInfo | null | undefined
}

const TYPE_LABEL: Record<string, string> = {
  ONLINE: "온라인",
  OFFLINE: "오프라인",
}

/**
 * 메시지 목록 최상단의 의뢰 요약 카드.
 *
 * 의뢰 상세는 Phase 06 범위 밖이라 여기서는 ticketProgress 의 가용 정보 (id, type,
 * currentStatus) 만 표시 + `/tickets/{ticketId}` 로 이동 링크.
 */
export function TicketSummaryCard({ progress }: Props) {
  if (!progress?.ticketId) return null

  const typeLabel = progress.ticketType ? TYPE_LABEL[progress.ticketType] : null

  return (
    <Link
      href={`/tickets/${progress.ticketId}`}
      className="group bg-muted/40 hover:bg-muted/60 border-border my-3 flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors"
    >
      <div className="bg-background flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
        <FileText className="text-muted-foreground h-5 w-5" />
      </div>

      <div className="min-w-0 flex-1">
        <Text
          as="div"
          typography="caption2-medium"
          className="text-muted-foreground"
        >
          {typeLabel ? `${typeLabel} 의뢰` : "의뢰"}
        </Text>
        <Text
          as="div"
          typography="body2-bold"
          className="text-foreground truncate"
        >
          의뢰 #{progress.ticketId}
        </Text>
      </div>

      <ArrowUpRight className="text-muted-foreground group-hover:text-foreground h-4 w-4 shrink-0 transition-colors" />
    </Link>
  )
}
