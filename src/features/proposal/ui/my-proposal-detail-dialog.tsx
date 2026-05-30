"use client"

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
import { formatDate } from "@/shared/lib/format"
import { openConfirm } from "@/shared/lib/open-confirm-dialog"
import { formatPrice } from "@/features/agreement/lib/format-price"

import { useMyProposalDetailQuery } from "../model/use-my-proposal-detail-query"
import { useWithdrawProposalMutation } from "../model/use-withdraw-proposal-mutation"
import {
  METHOD_LABEL,
  PROPOSAL_STATUS_LABEL,
  PROPOSED_DURATION_LABEL,
} from "../lib/proposal.constants"

type Props = {
  isOpen: boolean
  proposalId: number
  onClose: () => void
}

const STATUS_PILL_CLASS: Record<string, string> = {
  PENDING: "bg-primary/10 text-primary",
  SELECTED: "bg-emerald-50 text-emerald-700",
  COMPLETED: "bg-blue-50 text-blue-700",
  REJECTED: "bg-rose-50 text-rose-600",
  WITHDRAWN: "bg-muted text-muted-foreground",
}

export function MyProposalDetailDialog({ isOpen, proposalId, onClose }: Props) {
  const { data, isLoading, error } = useMyProposalDetailQuery(proposalId, isOpen)
  const withdrawMutation = useWithdrawProposalMutation()

  const handleWithdraw = async () => {
    const ok = await openConfirm({
      title: "제안을 철회하시겠습니까?",
      description: "철회한 제안은 다시 보낼 수 있어요.",
      confirmLabel: "철회",
      variant: "destructive",
    })
    if (!ok) return
    await withdrawMutation.mutateAsync(proposalId)
    onClose()
  }

  const canWithdraw = data?.status === "PENDING"

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg md:p-8">
        <DialogHeader>
          <DialogTitle>내 제안서</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col gap-4 py-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-muted h-10 animate-pulse rounded-md" />
            ))}
          </div>
        ) : error || !data ? (
          <Text
            as="p"
            typography="body2-medium"
            className="text-muted-foreground py-8 text-center"
          >
            제안서를 불러올 수 없어요
          </Text>
        ) : (
          <div className="flex flex-col gap-5">
            {/* 의뢰 정보 */}
            {data.ticketInfo && (
              <div className="bg-muted flex flex-col gap-1 rounded-xl p-4">
                <Text
                  as="p"
                  typography="caption2-medium"
                  className="text-muted-foreground"
                >
                  의뢰
                </Text>
                <Text
                  as="p"
                  typography="body2-bold"
                  className="text-foreground line-clamp-2 leading-snug"
                >
                  {data.ticketInfo.title ?? "(제목 없음)"}
                </Text>
                {(data.ticketInfo.subCategoryName ||
                  data.ticketInfo.clientNickname) && (
                  <Text
                    as="p"
                    typography="caption1-medium"
                    className="text-muted-foreground"
                  >
                    {[data.ticketInfo.subCategoryName, data.ticketInfo.clientNickname]
                      .filter(Boolean)
                      .join(" · ")}
                  </Text>
                )}
              </div>
            )}

            {/* 상태 + 제안 금액 */}
            <div className="flex items-end justify-between">
              <div className="flex flex-col gap-1.5">
                {data.status && (
                  <span
                    className={cn(
                      "inline-flex w-fit items-center rounded-full px-2.5 py-1",
                      STATUS_PILL_CLASS[data.status] ??
                        "bg-muted text-muted-foreground",
                    )}
                  >
                    <Text typography="caption2-bold" className="text-current">
                      {PROPOSAL_STATUS_LABEL[data.status] ?? data.status}
                    </Text>
                  </span>
                )}
                <Text
                  as="span"
                  typography="caption2-medium"
                  className="text-muted-foreground"
                >
                  제안 금액
                </Text>
              </div>
              <Text
                as="span"
                typography="h3-bold"
                className="text-foreground tabular-nums"
              >
                {data.price != null ? `${formatPrice(data.price)}원` : "-"}
              </Text>
            </div>

            {/* 상세 */}
            <dl className="border-border flex flex-col gap-3 border-t pt-4">
              {data.proposedDuration && (
                <InfoRow
                  label="소요 시간"
                  value={
                    PROPOSED_DURATION_LABEL[data.proposedDuration] ??
                    data.proposedDuration
                  }
                />
              )}
              {data.method && (
                <InfoRow label="진행 방식" value={METHOD_LABEL[data.method]} />
              )}
              {data.locationProposal && (
                <InfoRow label="장소 제안" value={data.locationProposal} />
              )}
              {data.onlineTool && (
                <InfoRow label="온라인 도구" value={data.onlineTool} />
              )}
            </dl>

            {data.appeal && (
              <div className="bg-muted/50 flex flex-col gap-1.5 rounded-xl p-4">
                <Text
                  as="p"
                  typography="caption2-medium"
                  className="text-muted-foreground"
                >
                  자기 어필
                </Text>
                <Text
                  as="p"
                  typography="body3-regular"
                  className="text-foreground leading-relaxed whitespace-pre-wrap"
                >
                  {data.appeal}
                </Text>
              </div>
            )}

            {data.availableDates && data.availableDates.length > 0 && (
              <div className="border-border flex flex-col gap-2 border-t pt-4">
                <Text
                  as="p"
                  typography="caption2-medium"
                  className="text-muted-foreground"
                >
                  가능 날짜
                </Text>
                <ul className="flex flex-col gap-1.5">
                  {data.availableDates.map((d, i) => (
                    <li
                      key={`${d.availableDate}-${i}`}
                      className="bg-muted flex items-center justify-between rounded-lg px-3 py-2"
                    >
                      <Text
                        typography="body3-medium"
                        className="text-foreground tabular-nums"
                      >
                        {formatDate(d.availableDate)}
                      </Text>
                      {d.timeSlot && (
                        <Text
                          typography="caption1-medium"
                          className="text-muted-foreground tabular-nums"
                        >
                          {d.timeSlot}
                        </Text>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={withdrawMutation.isPending}
          >
            닫기
          </Button>
          {canWithdraw && (
            <Button
              type="button"
              variant="destructive"
              onClick={handleWithdraw}
              disabled={withdrawMutation.isPending}
            >
              {withdrawMutation.isPending ? "철회 중..." : "제안 철회"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function InfoRow({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="shrink-0">
        <Text typography="body3-regular" className="text-muted-foreground">
          {label}
        </Text>
      </dt>
      <dd className="min-w-0 text-right">
        <Text typography="body3-medium" className="text-foreground">
          {value}
        </Text>
      </dd>
    </div>
  )
}
