"use client"

import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog"
import { Separator } from "@/shared/ui/separator"
import { Text } from "@/shared/ui/text"
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

  const statusLabel = data?.status ? PROPOSAL_STATUS_LABEL[data.status] : null
  const canWithdraw = data?.status === "PENDING"

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl md:p-8">
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
          <Text typography="body2-medium" className="text-muted-foreground py-8 text-center">
            제안서를 불러올 수 없어요
          </Text>
        ) : (
          <div className="flex flex-col gap-5">
            {/* 의뢰 정보 */}
            {data.ticketInfo && (
              <div className="bg-muted rounded-lg p-4">
                <Text typography="caption1-medium" className="text-muted-foreground mb-1">
                  의뢰
                </Text>
                <Text typography="body1-bold" className="text-foreground">
                  {data.ticketInfo.title ?? "(제목 없음)"}
                </Text>
                {data.ticketInfo.subCategoryName && (
                  <Text typography="caption1-medium" className="text-muted-foreground mt-1">
                    {data.ticketInfo.subCategoryName}
                    {data.ticketInfo.clientNickname ? ` · ${data.ticketInfo.clientNickname}` : ""}
                  </Text>
                )}
              </div>
            )}

            {/* 상태 + 가격 */}
            <div className="flex items-center justify-between">
              {statusLabel && (
                <Badge variant={data.status === "PENDING" ? "default" : "secondary"}>
                  {statusLabel}
                </Badge>
              )}
              <Text typography="subtitle1-bold" className="text-foreground tabular-nums">
                {data.price != null ? `${formatPrice(data.price)}원` : "-"}
              </Text>
            </div>

            <Separator />

            {/* 상세 */}
            <div className="flex flex-col gap-2.5">
              {data.proposedDuration && (
                <InfoRow
                  label="소요 시간"
                  value={PROPOSED_DURATION_LABEL[data.proposedDuration] ?? data.proposedDuration}
                />
              )}
              {data.method && <InfoRow label="진행 방식" value={METHOD_LABEL[data.method]} />}
              {data.locationProposal && (
                <InfoRow label="장소 제안" value={data.locationProposal} />
              )}
              {data.onlineTool && <InfoRow label="온라인 도구" value={data.onlineTool} />}
            </div>

            {data.appeal && (
              <>
                <Separator />
                <div className="flex flex-col gap-1.5">
                  <Text typography="caption1-medium" className="text-muted-foreground">
                    자기 어필
                  </Text>
                  <Text typography="body2-regular" className="text-foreground whitespace-pre-wrap">
                    {data.appeal}
                  </Text>
                </div>
              </>
            )}

            {data.availableDates && data.availableDates.length > 0 && (
              <>
                <Separator />
                <div className="flex flex-col gap-1.5">
                  <Text typography="caption1-medium" className="text-muted-foreground">
                    가능 날짜
                  </Text>
                  <ul className="flex flex-col gap-1">
                    {data.availableDates.map((d, i) => (
                      <li key={i}>
                        <Text typography="body2-regular" className="text-foreground">
                          {d.availableDate}
                          {d.timeSlot ? ` · ${d.timeSlot}` : ""}
                        </Text>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
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

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <Text as="span" typography="body3-regular" className="text-muted-foreground">
        {label}
      </Text>
      <Text as="span" typography="body3-medium" className="text-foreground">
        {value}
      </Text>
    </div>
  )
}
