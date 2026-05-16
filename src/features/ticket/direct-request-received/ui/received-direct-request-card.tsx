"use client"

import Link from "next/link"
import { Laptop, Loader2, MapPin } from "lucide-react"

import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import { Text } from "@/shared/ui/text"
import { formatDate } from "@/shared/lib/format"
import { cn } from "@/shared/lib/utils"

import type { MyTicket } from "@/entities/ticket/api/ticket.schema"
import { STATUS_LABEL, TICKET_TYPE_LABEL } from "@/entities/ticket/lib/ticket.constants"

type Props = {
  ticket: MyTicket
  onReject: () => void
  isRejecting?: boolean
}

export function ReceivedDirectRequestCard({ ticket, onReject, isRejecting }: Props) {
  const statusLabel = STATUS_LABEL[ticket.status]
  const typeLabel = TICKET_TYPE_LABEL[ticket.ticketType]
  const isOnline = ticket.ticketType === "ONLINE"
  const thumbnailUrl = ticket.thumbnailUrl ?? null

  const handleRejectClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isRejecting) return
    onReject()
  }

  return (
    <div className="bg-card border-border hover:border-primary/40 hover:bg-muted/40 flex flex-col gap-3 rounded-xl border p-4 transition-colors">
      <Link href={`/tickets/${ticket.id}`} className="flex min-w-0 gap-3.5">
        {/* 썸네일 */}
        <div className="size-20 shrink-0 overflow-hidden rounded-lg border border-border">
          {thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={thumbnailUrl} alt="" className="size-full object-cover" />
          ) : (
            <div
              className={cn(
                "flex size-full items-center justify-center",
                isOnline ? "bg-accent/8" : "bg-primary/8",
              )}
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

          <Text typography="body2-bold" className="text-foreground line-clamp-2">
            {ticket.title}
          </Text>

          <div className="mt-auto flex items-center gap-2">
            <Text
              typography="caption2-medium"
              className="text-muted-foreground ml-auto tabular-nums"
            >
              {formatDate(ticket.createdAt)}
            </Text>
          </div>
        </div>
      </Link>

      <div className="border-border/60 flex items-center justify-end border-t pt-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleRejectClick}
          disabled={isRejecting}
        >
          {isRejecting ? (
            <Loader2 className="mr-1 size-3.5 animate-spin" />
          ) : null}
          거절
        </Button>
      </div>
    </div>
  )
}
