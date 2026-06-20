"use client"

import { useState } from "react"
import { Download, FileText, Loader2 } from "lucide-react"
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
import { openImageViewer } from "@/shared/lib/open-image-viewer"
import { formatDate } from "@/shared/lib/format"

import { useApproveDeliveryMutation } from "../model/use-approve-delivery-mutation"
import { useDeliveryByTicketQuery } from "../model/use-delivery-by-ticket-query"
import { useRejectDeliveryMutation } from "../model/use-reject-delivery-mutation"
import { useRequestRevisionMutation } from "../model/use-request-revision-mutation"

type Props = {
  isOpen: boolean
  ticketId: number
  myRole: SenderType | null
  onClose: () => void
}

type ActionMode = "view" | "revision" | "reject"

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}

export function DeliveryReviewDialog({
  isOpen,
  ticketId,
  myRole,
  onClose,
}: Props) {
  const params = useParams<{ roomId: string }>()
  const roomId = params.roomId

  const deliveryQuery = useDeliveryByTicketQuery(ticketId)
  const approveMutation = useApproveDeliveryMutation(roomId, ticketId)
  const revisionMutation = useRequestRevisionMutation(roomId, ticketId)
  const rejectMutation = useRejectDeliveryMutation(roomId, ticketId)

  const [actionMode, setActionMode] = useState<ActionMode>("view")
  const [revisionMessage, setRevisionMessage] = useState("")
  const [rejectionReason, setRejectionReason] = useState("")

  const delivery = deliveryQuery.data
  const isActing =
    approveMutation.isPending ||
    revisionMutation.isPending ||
    rejectMutation.isPending

  const canAct =
    myRole === "CLIENT" && delivery?.status === "SUBMITTED" && !isActing

  const imageAttachments =
    delivery?.attachments.filter((a) => a.fileType === "IMAGE") ?? []
  const fileAttachments =
    delivery?.attachments.filter((a) => a.fileType === "FILE" || a.fileType === "VIDEO") ?? []

  const handleApprove = async () => {
    if (!delivery) return
    await approveMutation.mutateAsync(delivery.id)
    onClose()
  }

  const handleRevision = async () => {
    if (!delivery || !revisionMessage.trim()) return
    await revisionMutation.mutateAsync({
      deliveryId: delivery.id,
      input: { revisionMessage: revisionMessage.trim() },
    })
    onClose()
  }

  const handleReject = async () => {
    if (!delivery || !rejectionReason.trim()) return
    await rejectMutation.mutateAsync({
      deliveryId: delivery.id,
      input: { rejectionReason: rejectionReason.trim() },
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl md:p-8">
        <DialogHeader>
          <DialogTitle>작업물 확인</DialogTitle>
        </DialogHeader>

        {deliveryQuery.isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="text-primary h-8 w-8 animate-spin" />
          </div>
        ) : !delivery ? (
          <div className="py-12 text-center">
            <Text typography="body2-medium" className="text-muted-foreground">
              작업물 정보를 불러올 수 없어요
            </Text>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <InfoChip
                label="유형"
                value={
                  delivery.deliveryType === "SERVICE_COMPLETE"
                    ? "용역 완료"
                    : "파일 납품"
                }
              />
              <InfoChip label="제출일" value={formatDate(delivery.submittedAt)} />
              <InfoChip
                label="수정"
                value={
                  delivery.maxRevisions != null
                    ? `${delivery.revisionCount}회 (최대 ${delivery.maxRevisions}회)`
                    : `${delivery.revisionCount}회`
                }
              />
            </div>

            {delivery.revisionMessage && (
              <div className="bg-muted rounded-lg p-3">
                <Text typography="caption2-medium" className="text-muted-foreground mb-1">
                  수정 요청 사유
                </Text>
                <Text typography="caption1-medium" className="text-foreground">
                  {delivery.revisionMessage}
                </Text>
              </div>
            )}

            <div>
              <Text typography="caption2-medium" className="text-muted-foreground mb-1">
                메모
              </Text>
              <Text typography="body2-medium" className="text-foreground whitespace-pre-wrap">
                {delivery.memo}
              </Text>
            </div>

            {imageAttachments.length > 0 && (
              <div>
                <Text typography="caption2-medium" className="text-muted-foreground mb-2">
                  이미지 ({imageAttachments.length})
                </Text>
                <div className="flex flex-wrap gap-2">
                  {imageAttachments.map((att) => (
                    <button
                      key={att.id}
                      type="button"
                      onClick={() => openImageViewer(att.fileUrl)}
                      className="h-20 w-20 overflow-hidden rounded-lg border transition-opacity hover:opacity-80"
                    >
                      <img
                        src={att.fileUrl}
                        alt={att.originalFileName}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {fileAttachments.length > 0 && (
              <div>
                <Text typography="caption2-medium" className="text-muted-foreground mb-2">
                  파일 ({fileAttachments.length})
                </Text>
                <div className="flex flex-col gap-1.5">
                  {fileAttachments.map((att) => (
                    <a
                      key={att.id}
                      href={att.fileUrl}
                      download={att.originalFileName}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border-border hover:bg-accent flex items-center gap-3 rounded-md border px-3 py-2 transition-colors"
                    >
                      <FileText className="text-muted-foreground h-4 w-4 shrink-0" />
                      <div className="flex min-w-0 flex-1 flex-col">
                        <Text typography="caption1-medium" className="text-foreground truncate">
                          {att.originalFileName}
                        </Text>
                        <Text typography="caption2-medium" className="text-muted-foreground tabular-nums">
                          {formatFileSize(att.fileSize)}
                        </Text>
                      </div>
                      <Download className="text-muted-foreground h-4 w-4 shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {canAct && actionMode === "view" && (
              <DialogFooter className="flex-col gap-2 sm:flex-row">
                <Button variant="outline" onClick={() => setActionMode("reject")}>
                  거절
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setActionMode("revision")}
                  disabled={delivery.remainingRevisions != null && delivery.remainingRevisions <= 0}
                >
                  수정 요청
                  {delivery.remainingRevisions != null && delivery.remainingRevisions <= 0 && " (소진)"}
                </Button>
                <Button onClick={handleApprove} disabled={isActing}>
                  {approveMutation.isPending ? "처리 중..." : "승인"}
                </Button>
              </DialogFooter>
            )}

            {canAct && actionMode === "revision" && (
              <div className="flex flex-col gap-3">
                <Text typography="caption2-medium">
                  수정 요청 사유 <span className="text-destructive">*</span>
                </Text>
                <textarea
                  value={revisionMessage}
                  onChange={(e) => setRevisionMessage(e.target.value)}
                  rows={3}
                  placeholder="수정이 필요한 부분을 상세히 적어주세요"
                  className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:ring-[3px]"
                />
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setActionMode("view")
                      setRevisionMessage("")
                    }}
                    disabled={isActing}
                  >
                    취소
                  </Button>
                  <Button
                    onClick={handleRevision}
                    disabled={!revisionMessage.trim() || isActing}
                  >
                    {revisionMutation.isPending ? "처리 중..." : "수정 요청"}
                  </Button>
                </DialogFooter>
              </div>
            )}

            {canAct && actionMode === "reject" && (
              <div className="flex flex-col gap-3">
                <Text typography="caption2-medium">
                  거절 사유 <span className="text-destructive">*</span>
                </Text>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                  placeholder="거절 사유를 적어주세요"
                  className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:ring-[3px]"
                />
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setActionMode("view")
                      setRejectionReason("")
                    }}
                    disabled={isActing}
                  >
                    취소
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleReject}
                    disabled={!rejectionReason.trim() || isActing}
                  >
                    {rejectMutation.isPending ? "처리 중..." : "거절"}
                  </Button>
                </DialogFooter>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function InfoChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <Text typography="caption2-medium" className="text-muted-foreground">
        {label}
      </Text>
      <Text typography="caption1-bold" className="text-foreground">
        {value}
      </Text>
    </div>
  )
}
