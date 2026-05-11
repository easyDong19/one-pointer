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
import { formatPrice } from "@/features/agreement/lib/format-price"

import { useAcceptProposalMutation } from "../model/use-accept-proposal-mutation"
import { useProposalDetailQuery } from "../model/use-proposal-detail-query"
import { METHOD_LABEL, PROPOSED_DURATION_LABEL } from "../lib/proposal.constants"

type Props = {
  isOpen: boolean
  proposalId: number
  ticketId: number
  onClose: () => void
}

export function ProposalDetailDialog({ isOpen, proposalId, ticketId, onClose }: Props) {
  const { data, isLoading, error } = useProposalDetailQuery(proposalId, isOpen)
  const acceptMutation = useAcceptProposalMutation(ticketId)

  const handleAccept = async () => {
    await acceptMutation.mutateAsync(proposalId)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl md:p-8">
        <DialogHeader>
          <DialogTitle>제안서 상세</DialogTitle>
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
            {/* 전문가 카드 */}
            {data.expertInfo && (
              <div className="bg-muted rounded-lg p-4">
                <div className="flex items-start gap-3">
                  {data.expertInfo.profileImageUrl ? (
                    <img
                      src={data.expertInfo.profileImageUrl}
                      alt={data.expertInfo.nickname ?? ""}
                      className="size-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="bg-background size-12 rounded-full" />
                  )}
                  <div className="flex flex-1 flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <Text typography="body1-bold" className="text-foreground">
                        {data.expertInfo.nickname ?? "전문가"}
                      </Text>
                      {data.expertInfo.authStatus === "APPROVED" && (
                        <Badge variant="default" className="text-xs">
                          인증 완료
                        </Badge>
                      )}
                    </div>
                    {data.expertInfo.careerPeriod && (
                      <Text typography="caption1-medium" className="text-muted-foreground">
                        경력 {data.expertInfo.careerPeriod}
                      </Text>
                    )}
                    {data.expertInfo.introduction && (
                      <Text typography="body3-regular" className="text-foreground/80">
                        {data.expertInfo.introduction}
                      </Text>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 가격 / 시간 / 방식 */}
            <div className="flex flex-col gap-2.5">
              <InfoRow
                label="제안 금액"
                value={data.price != null ? `${formatPrice(data.price)}원` : "-"}
                emphasize
              />
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

            {/* 어필 */}
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

            {/* 가능 날짜 */}
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
            disabled={acceptMutation.isPending}
          >
            닫기
          </Button>
          <Button
            type="button"
            onClick={handleAccept}
            disabled={!data || data.status !== "PENDING" || acceptMutation.isPending}
          >
            {acceptMutation.isPending ? "수락 중..." : "수락하고 채팅 시작"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function InfoRow({
  label,
  value,
  emphasize,
}: {
  label: string
  value: string
  emphasize?: boolean
}) {
  return (
    <div className="flex items-center justify-between">
      <Text as="span" typography="body3-regular" className="text-muted-foreground">
        {label}
      </Text>
      <Text
        as="span"
        typography={emphasize ? "subtitle2-bold" : "body3-medium"}
        className="text-foreground tabular-nums"
      >
        {value}
      </Text>
    </div>
  )
}
