"use client"

import { useState } from "react"
import { useParams } from "next/navigation"

import { Button } from "@/shared/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog"
import { Text } from "@/shared/ui/text"
import { cn } from "@/shared/lib/utils"

import { useRespondToRefundMutation } from "../model/use-respond-refund-mutation"

type Props = {
  isOpen: boolean
  refundRequestId: number
  onClose: () => void
}

const MIN_REJECT_REASON_LEN = 5

/**
 * docs/app/chat.md §5.3 — REFUND_IN_PROGRESS REQUESTED 의 전문가 "응답하기".
 * 수락 / 거절 + 거절 사유 (조건부 textarea).
 */
export function RefundRespondDialog({
  isOpen,
  refundRequestId,
  onClose,
}: Props) {
  const params = useParams<{ roomId: string }>()
  const roomId = params.roomId

  const mutation = useRespondToRefundMutation(roomId)

  const [accept, setAccept] = useState<boolean | null>(null)
  const [rejectReason, setRejectReason] = useState("")

  const trimmedReason = rejectReason.trim()
  const canSubmit =
    accept != null &&
    !mutation.isPending &&
    (accept === true || trimmedReason.length >= MIN_REJECT_REASON_LEN)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit || accept == null) return
    await mutation.mutateAsync({
      refundRequestId,
      input: {
        accept,
        rejectReason: accept ? null : trimmedReason,
      },
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg md:p-8">
        <DialogHeader>
          <DialogTitle>환불 요청 응답</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Text as="label" typography="caption2-medium">
              응답 <span className="text-destructive">*</span>
            </Text>
            <div className="flex gap-2">
              <Choice
                selected={accept === true}
                tone="primary"
                onClick={() => setAccept(true)}
              >
                수락
              </Choice>
              <Choice
                selected={accept === false}
                tone="destructive"
                onClick={() => setAccept(false)}
              >
                거절
              </Choice>
            </div>
          </div>

          {accept === false && (
            <div className="flex flex-col gap-1.5">
              <Text as="label" typography="caption2-medium">
                거절 사유 <span className="text-destructive">*</span>
                <span className="text-muted-foreground ml-1">
                  ({trimmedReason.length}/{MIN_REJECT_REASON_LEN}자 이상)
                </span>
              </Text>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
                placeholder="환불을 거절하는 이유를 적어주세요"
                className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:ring-[3px]"
              />
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={mutation.isPending}
            >
              취소
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              {mutation.isPending ? "전송 중..." : "응답 보내기"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function Choice({
  selected,
  tone,
  onClick,
  children,
}: {
  selected: boolean
  tone: "primary" | "destructive"
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex-1 rounded-md border px-4 py-2.5 text-sm font-semibold transition-colors",
        selected
          ? tone === "primary"
            ? "border-primary bg-primary text-primary-foreground"
            : "border-destructive bg-destructive text-destructive-foreground"
          : "border-border bg-background text-foreground hover:bg-accent",
      )}
    >
      {children}
    </button>
  )
}
