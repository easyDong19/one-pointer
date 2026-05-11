"use client"

import Link from "next/link"
import { Laptop, MapPin } from "lucide-react"

import { Badge } from "@/shared/ui/badge"
import { Text } from "@/shared/ui/text"
import { formatDate } from "@/shared/lib/format"

import type { TicketDetail, MyTicket } from "@/entities/ticket/api/ticket.schema"
import { STATUS_LABEL, TICKET_TYPE_LABEL } from "@/entities/ticket/lib/ticket.constants"

type Props = {
  ticket: TicketDetail | MyTicket
  showProposalCount?: boolean
}

export function MyTicketCard({ ticket, showProposalCount }: Props) {
  const statusLabel = STATUS_LABEL[ticket.status]
  const typeLabel = TICKET_TYPE_LABEL[ticket.ticketType]
  const isOnline = ticket.ticketType === "ONLINE"

  const thumbnailUrl =
    "images" in ticket
      ? ticket.images?.[0]?.imageUrl ?? null
      : ticket.thumbnailUrl ?? null

  return (
    <Link
      href={`/tickets/${ticket.id}`}
      className="bg-card border-border hover:border-primary/40 hover:bg-muted/40 flex gap-3.5 rounded-xl border p-4 transition-colors"
    >
      {/* 썸네일 */}
      <div className="size-20 shrink-0 overflow-hidden rounded-lg border border-border">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt=""
            className="size-full object-cover"
          />
        ) : (
          <div
            className={`flex size-full items-center justify-center ${
              isOnline ? "bg-accent/8" : "bg-primary/8"
            }`}
          >
            {isOnline ? (
              <Laptop className="text-accent/40 size-7" />
            ) : (
              <MapPin className="text-primary/40 size-7" />
            )}
          </div>
        )}
      </div>

      {/* 정보 */}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {/* 카테고리 + 유형 + 상태 */}
        <div className="flex items-center gap-1.5">
          <Text typography="caption2-medium" className="text-muted-foreground truncate">
            {ticket.subCategoryName}
          </Text>
          {typeLabel && (
            <Badge variant="outline" className="shrink-0 px-1.5 py-0 text-[10px]">
              {typeLabel}
            </Badge>
          )}
          <div className="flex-1" />
          {statusLabel && (
            <Badge variant={statusLabel.variant} className="shrink-0 text-xs">
              {statusLabel.text}
            </Badge>
          )}
        </div>

        {/* 제목 */}
        <Text typography="body2-bold" className="text-foreground line-clamp-2">
          {ticket.title}
        </Text>

        {/* 메타: 제안 수 + 날짜 */}
        <div className="mt-auto flex items-center gap-2">
          {showProposalCount && (ticket.proposalCount ?? 0) > 0 && (
            <Badge variant="default" className="bg-primary/10 text-primary text-xs font-semibold">
              제안 {ticket.proposalCount}건
            </Badge>
          )}
          <Text typography="caption2-medium" className="text-muted-foreground ml-auto tabular-nums">
            {formatDate(ticket.createdAt)}
          </Text>
        </div>
      </div>
    </Link>
  )
}
