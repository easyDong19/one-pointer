"use client"

import { useParams } from "next/navigation"

import type { SenderType } from "@/entities/review/api/review.schema"
import { Button } from "@/shared/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog"
import { Text } from "@/shared/ui/text"

import { formatPrice } from "../lib/format-price"
import {
  formatDeadlineKR,
  parseServerDeadline,
} from "../lib/format-deadline"
import { useAgreementByTicketQuery } from "../model/use-agreement-by-ticket-query"
import { useConfirmAgreementMutation } from "../model/use-confirm-agreement-mutation"
import { useRejectAgreementMutation } from "../model/use-reject-agreement-mutation"

type Props = {
  isOpen: boolean
  ticketId: number
  myRole: SenderType | null
  onClose: () => void
}

/**
 * AGREEMENT 메시지 카드 클릭 시 노출되는 상세 다이얼로그.
 *
 * docs/app/chat.md §7.1 — 전문가(EXPERT) + status PROPOSED 일 때만 footer 에 승인/거절.
 * 그 외 (의뢰인 시점, 또는 이미 확정/거절된 합의서) 는 읽기 전용.
 */
export function AgreementDetailDialog({
  isOpen,
  ticketId,
  myRole,
  onClose,
}: Props) {
  const params = useParams<{ roomId: string }>()
  const roomId = params.roomId

  const query = useAgreementByTicketQuery(ticketId)
  const confirmMutation = useConfirmAgreementMutation(roomId)
  const rejectMutation = useRejectAgreementMutation(roomId)

  const agreement = query.data
  const isPending = confirmMutation.isPending || rejectMutation.isPending
  const showActions = myRole === "EXPERT" && agreement?.status === "PROPOSED"

  const handleConfirm = async () => {
    if (!agreement) return
    await confirmMutation.mutateAsync(agreement.id)
    onClose()
  }

  const handleReject = async () => {
    if (!agreement) return
    await rejectMutation.mutateAsync(agreement.id)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl md:p-8">
        <DialogHeader>
          <DialogTitle>합의서 상세</DialogTitle>
        </DialogHeader>

        {query.isLoading ? (
          <div className="flex flex-col gap-3 py-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-muted h-8 animate-pulse rounded-md" />
            ))}
          </div>
        ) : query.isError || !agreement ? (
          <div className="py-6 text-center">
            <Text typography="body2-medium" className="text-muted-foreground">
              합의서 정보를 불러오지 못했어요.
            </Text>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <Row
              label="최종 금액"
              value={`${formatPrice(agreement.finalPrice ?? 0)}원`}
            />
            <Row
              label="작업 마감일"
              value={
                agreement.workDeadline
                  ? formatDeadlineKR(parseServerDeadline(agreement.workDeadline))
                  : "-"
              }
            />
            {agreement.scope && (
              <Row label="작업 범위" value={agreement.scope} multiline />
            )}
            <Row
              label="수정 가능 횟수"
              value={`${agreement.maxRevisions ?? 0}회`}
            />
            {agreement.deliveryFormat && (
              <Row label="납품 형식" value={agreement.deliveryFormat} />
            )}
            <Row label="상태" value={statusLabel(agreement.status)} />
          </div>
        )}

        {showActions && (
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleReject}
              disabled={isPending}
            >
              거절
            </Button>
            <Button type="button" onClick={handleConfirm} disabled={isPending}>
              {isPending ? "처리 중..." : "승인"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}

function Row({
  label,
  value,
  multiline,
}: {
  label: string
  value: string
  multiline?: boolean
}) {
  return (
    <div
      className={
        multiline
          ? "flex flex-col gap-1"
          : "flex items-center justify-between gap-4"
      }
    >
      <Text typography="caption2-medium" className="text-muted-foreground">
        {label}
      </Text>
      <Text
        typography="body2-medium"
        className={multiline ? "" : "text-right tabular-nums"}
      >
        {value}
      </Text>
    </div>
  )
}

function statusLabel(status: string | null | undefined): string {
  switch (status) {
    case "PROPOSED":
      return "제안됨"
    case "CONFIRMED":
      return "확정"
    case "REJECTED":
      return "거절됨"
    default:
      return "-"
  }
}
