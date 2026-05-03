"use client"

import { useState } from "react"
import { useParams } from "next/navigation"

import type { EscrowRefundZone } from "@/entities/payment/api/payment.service"
import { Button } from "@/shared/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog"
import { Text } from "@/shared/ui/text"

import { useRequestRefundMutation } from "../model/use-request-refund-mutation"

type Props = {
  isOpen: boolean
  ticketId: number
  /** 표시 전용 — 서버가 zone 을 재계산하므로 요청 body 엔 포함하지 않음 */
  refundZone?: EscrowRefundZone | null
  onClose: () => void
}

const MIN_REASON_LEN = 10

export function RefundRequestDialog({
  isOpen,
  ticketId,
  refundZone,
  onClose,
}: Props) {
  const params = useParams<{ roomId: string }>()
  const roomId = params.roomId

  const mutation = useRequestRefundMutation(roomId)

  const [reason, setReason] = useState("")

  const trimmed = reason.trim()
  const canSubmit = trimmed.length >= MIN_REASON_LEN && !mutation.isPending

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    await mutation.mutateAsync({ ticketId, reason: trimmed })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg md:p-8">
        <DialogHeader>
          <DialogTitle>환불 요청</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Text typography="caption1-medium" className="text-muted-foreground">
            {zoneNotice(refundZone)}
          </Text>

          <div className="flex flex-col gap-1.5">
            <Text as="label" typography="caption2-medium">
              환불 사유 <span className="text-destructive">*</span>
              <span className="text-muted-foreground ml-1">
                ({trimmed.length}/{MIN_REASON_LEN}자 이상)
              </span>
            </Text>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={5}
              placeholder="환불을 요청하시는 이유를 자세히 적어주세요"
              className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:ring-[3px]"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={mutation.isPending}
            >
              취소
            </Button>
            <Button type="submit" disabled={!canSubmit} variant="destructive">
              {mutation.isPending ? "요청 중..." : "환불 요청"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

/**
 * docs/app/chat.md §9.7 — RefundZone 별 안내문 다양화.
 */
function zoneNotice(zone: EscrowRefundZone | null | undefined): string {
  switch (zone) {
    case "COOLING_OFF":
      return "쿨링오프 기간이라 환불이 자동 승인됩니다."
    case "WORK_IN_PROGRESS":
      return "전문가의 응답을 거쳐 환불이 진행됩니다."
    case "DEADLINE_GRACE":
    case "DEADLINE_WAIT":
      return "마감 관련 환불 요청입니다. 전문가 응답 후 처리됩니다."
    default:
      return "환불 요청 후 전문가가 응답하면 환불이 진행됩니다."
  }
}
