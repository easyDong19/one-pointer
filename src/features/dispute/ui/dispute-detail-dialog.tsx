"use client"

import { ExternalLink, Paperclip } from "lucide-react"

import type { Evidence, MyDisputeDetail } from "@/entities/dispute/api/dispute.schema"
import { formatDate } from "@/shared/lib/format"
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

import { useDisputeByTicketQuery } from "../model/use-dispute-by-ticket-query"
import { useDisputeDetailQuery } from "../model/use-dispute-detail-query"

type Props = {
  isOpen: boolean
  ticketId: number
  onClose: () => void
}

type DisputeStatus = MyDisputeDetail["status"]
type TicketType = MyDisputeDetail["ticketType"]

const STATUS_LABEL: Record<DisputeStatus, string> = {
  SUBMITTED: "접수됨",
  REJECTED: "반려",
  UNDER_REVIEW: "검토 중",
  RESOLVED: "해결됨",
  CLOSED_UNRESOLVED: "미해결 종결",
  CANCELLED: "취소됨",
}

const STATUS_VARIANT: Record<
  DisputeStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  SUBMITTED: "secondary",
  REJECTED: "destructive",
  UNDER_REVIEW: "default",
  RESOLVED: "default",
  CLOSED_UNRESOLVED: "outline",
  CANCELLED: "outline",
}

const TICKET_TYPE_LABEL: Record<TicketType, string> = {
  OFFLINE: "오프라인",
  ONLINE: "온라인",
}

/**
 * 분쟁 상세 다이얼로그 — 채팅 배너 CTA 진입.
 *
 * ticketId → `useDisputeByTicketQuery` (disputeId 도출)
 *         → `useDisputeDetailQuery` (MyDisputeDetail) chained fetch.
 * 두 단계 분리 이유: `disputeQueryKeys.detail(disputeId)` 캐시를 다른 진입(마이페이지 등)과 공유하기 위함.
 */
export function DisputeDetailDialog({ isOpen, ticketId, onClose }: Props) {
  const byTicketQuery = useDisputeByTicketQuery(ticketId)
  const disputeId = byTicketQuery.data?.disputeId
  const detailQuery = useDisputeDetailQuery(disputeId)

  const isLoading =
    byTicketQuery.isLoading ||
    (disputeId != null && detailQuery.isLoading)
  const isError = byTicketQuery.isError || detailQuery.isError
  const data = detailQuery.data

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl md:p-8">
        <DialogHeader>
          <DialogTitle>분쟁 상세</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col gap-3 py-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-muted h-12 animate-pulse rounded-md" />
            ))}
          </div>
        ) : isError || !data ? (
          <div className="flex flex-col gap-4 py-6">
            <Text typography="body2-medium" className="text-muted-foreground text-center">
              분쟁 정보를 불러오지 못했어요. 잠시 후 다시 시도해주세요.
            </Text>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                닫기
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {/* 상태 + 의뢰 정보 */}
            <section className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={STATUS_VARIANT[data.status]}>
                  {STATUS_LABEL[data.status]}
                </Badge>
                <Text typography="caption2-medium" className="text-muted-foreground">
                  {TICKET_TYPE_LABEL[data.ticketType]} 의뢰
                </Text>
              </div>
              <Text typography="subtitle2-bold" className="text-foreground">
                {data.ticketTitle}
              </Text>
            </section>

            <Separator />

            {/* 신청인 / 피신청인 */}
            <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <PartyBlock
                label="신청인"
                nickname={data.applicantNickname}
                dateLabel="신청일"
                dateValue={data.appliedAt}
              />
              <PartyBlock
                label="피신청인"
                nickname={data.respondentNickname}
                dateLabel="응답일"
                dateValue={data.respondedAt}
              />
            </section>

            <Separator />

            {/* 신청 사유 */}
            <Section title="신청 사유">
              <Text typography="body2-regular" className="text-foreground whitespace-pre-wrap">
                {data.reason}
              </Text>
            </Section>

            {/* 신청인 진술 / 증거 */}
            <Section title="신청인 진술">
              <StatementBlock statement={data.applicantStatement} />
              <EvidenceList evidences={data.applicantEvidences} />
            </Section>

            {/* 피신청인 응답 / 증거 */}
            <Section title="피신청인 응답">
              <StatementBlock statement={data.respondentStatement} />
              <EvidenceList evidences={data.respondentEvidences} />
            </Section>

            {/* 관리자 결정 */}
            {(data.adminRemark || data.resolvedAt) && (
              <>
                <Separator />
                <Section
                  title="관리자 결정"
                  emphasis={data.status === "RESOLVED" || data.status === "REJECTED"}
                >
                  {data.adminRemark ? (
                    <Text
                      typography="body2-regular"
                      className="text-foreground whitespace-pre-wrap"
                    >
                      {data.adminRemark}
                    </Text>
                  ) : (
                    <Text typography="body2-regular" className="text-muted-foreground">
                      관리자 메모가 등록되지 않았어요.
                    </Text>
                  )}
                  {data.resolvedAt && (
                    <Text
                      typography="caption2-medium"
                      className="text-muted-foreground tabular-nums"
                    >
                      종결일 · {formatDate(data.resolvedAt)}
                    </Text>
                  )}
                </Section>
              </>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                닫기
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function Section({
  title,
  emphasis,
  children,
}: {
  title: string
  emphasis?: boolean
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-2">
      <Text
        typography="caption2-bold"
        className={emphasis ? "text-primary" : "text-muted-foreground"}
      >
        {title}
      </Text>
      <div className="flex flex-col gap-2">{children}</div>
    </section>
  )
}

function PartyBlock({
  label,
  nickname,
  dateLabel,
  dateValue,
}: {
  label: string
  nickname: string
  dateLabel: string
  dateValue: string | null
}) {
  return (
    <div className="border-border bg-muted/30 flex flex-col gap-1 rounded-md border px-3 py-2.5">
      <Text typography="caption2-medium" className="text-muted-foreground">
        {label}
      </Text>
      <Text typography="body2-bold" className="text-foreground">
        {nickname}
      </Text>
      <Text typography="caption2-medium" className="text-muted-foreground tabular-nums">
        {dateLabel} · {dateValue ? formatDate(dateValue) : "—"}
      </Text>
    </div>
  )
}

function StatementBlock({ statement }: { statement: string | null }) {
  if (!statement) {
    return (
      <Text typography="body2-regular" className="text-muted-foreground">
        진술이 없습니다.
      </Text>
    )
  }
  return (
    <Text typography="body2-regular" className="text-foreground whitespace-pre-wrap">
      {statement}
    </Text>
  )
}

function EvidenceList({ evidences }: { evidences: Evidence[] }) {
  if (evidences.length === 0) {
    return (
      <Text typography="caption2-medium" className="text-muted-foreground">
        첨부된 증거 자료가 없어요.
      </Text>
    )
  }
  return (
    <ul className="flex flex-col gap-1.5">
      {evidences.map((ev, idx) => (
        <li key={`${ev.fileUrl}-${idx}`}>
          <a
            href={ev.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground hover:text-primary border-border bg-background inline-flex max-w-full items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors"
          >
            <Paperclip className="size-4 shrink-0" aria-hidden />
            <span className="truncate">{ev.fileName}</span>
            <ExternalLink className="size-3.5 shrink-0 opacity-60" aria-hidden />
          </a>
        </li>
      ))}
    </ul>
  )
}
