"use client"

import { MoreHorizontal } from "lucide-react"

import type { ChatBannerResponse } from "@/entities/chat/api/chat.schema"
import type { SenderType } from "@/entities/review/api/review.schema"
import { openRefundRequest } from "@/features/refund/lib/open-refund-request"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu"

type Props = {
  banner: ChatBannerResponse | null | undefined
  myRole: SenderType | null | undefined
  ticketId: number | null
}

/**
 * 채팅방 헤더 우측 옵션 드롭다운.
 *
 * docs/app/chat.md §6.3 — `canRequestRefund=true` 인 의뢰인에게 환불 요청 항목 노출.
 * 현재 환불 외 옵션 없음 — 노출 항목 0 일 땐 트리거 자체 비표시.
 */
export function ChatRoomOptionsMenu({ banner, myRole, ticketId }: Props) {
  const canRequestRefund =
    myRole === "CLIENT" &&
    banner?.canRequestRefund === true &&
    ticketId != null

  if (!canRequestRefund) return null

  const handleRefund = () => {
    openRefundRequest({
      ticketId: ticketId as number,
      refundZone: banner?.currentRefundZone ?? null,
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="채팅방 옵션"
          className="text-muted-foreground hover:text-foreground rounded-md p-2 transition-colors"
        >
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleRefund} variant="destructive">
          환불 요청
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
