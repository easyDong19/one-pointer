"use client"

import { useRouter } from "next/navigation"

import { Text } from "@/shared/ui/text"
import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import { Separator } from "@/shared/ui/separator"
import { formatBudget } from "@/shared/lib/format"
import {
  STATUS_LABEL,
  LEVEL_LABEL,
  TICKET_TYPE_LABEL,
} from "@/entities/ticket/lib/ticket.constants"
import type { TicketDetail } from "@/entities/ticket/api/ticket.schema"
import { useAuthStore } from "@/entities/auth/model/auth-store"
import { openProposalForm } from "@/features/proposal/lib/open-proposal-form"
import { openExpertRegisterPrompt, useExpertExistsQuery } from "@/features/mypage"

const EDITABLE_STATUSES = new Set(["OPEN", "IN_REVIEW"])

export function TicketDesktopSidebar({ ticket }: { ticket: TicketDetail }) {
  const router = useRouter()
  const userId = useAuthStore((s) => s.user?.id)
  const isOwner = userId != null && userId === ticket.clientId
  const { data: expertExists, isLoading: isExpertLoading } = useExpertExistsQuery()
  const statusInfo = STATUS_LABEL[ticket.status] ?? STATUS_LABEL.OPEN
  const canPropose = ticket.status === "OPEN" || ticket.status === "IN_REVIEW"
  const canEdit = isOwner && EDITABLE_STATUSES.has(ticket.status)

  const handleSendProposal = async () => {
    if (isExpertLoading) return
    if (!expertExists) {
      const confirmed = await openExpertRegisterPrompt()
      if (confirmed) router.push("/mypage/expert-register")
      return
    }
    openProposalForm({
      ticketId: ticket.id,
      defaultMethod: ticket.ticketType === "ONLINE" ? "ONLINE" : "OFFLINE",
    })
  }

  return (
    <div className="sticky top-8">
      <div className="bg-card border-border flex flex-col gap-5 rounded-xl border p-6 shadow-sm">
        {/* Title & Status */}
        <div className="flex flex-col gap-2">
          <Badge variant={statusInfo.variant} className="w-fit">
            {statusInfo.text}
          </Badge>
          <Text as="h2" typography="subtitle1-bold" className="text-foreground">
            {ticket.title}
          </Text>
        </div>

        {/* Budget */}
        <div className="bg-muted rounded-lg p-4">
          <Text
            as="p"
            typography="caption1-medium"
            className="text-muted-foreground mb-1"
          >
            예산
          </Text>
          <Text as="p" typography="subtitle1-bold" className="text-foreground">
            {ticket.budgetType === "NEGOTIABLE"
              ? "가격 협의"
              : `총 ${formatBudget(ticket.budgetMin ?? 0, ticket.budgetMax ?? 0)}`}
          </Text>
        </div>

        {/* Quick Info */}
        <div className="flex flex-col gap-2.5">
          {ticket.desiredDuration && (
            <InfoRow label="소요 시간" value={ticket.desiredDuration} />
          )}
          <InfoRow
            label="의뢰 유형"
            value={TICKET_TYPE_LABEL[ticket.ticketType] ?? ticket.ticketType}
          />
          {ticket.level && (
            <InfoRow
              label="레벨"
              value={LEVEL_LABEL[ticket.level] ?? ticket.level}
            />
          )}
          {ticket.proposalCount !== undefined &&
            ticket.proposalCount !== null &&
            ticket.proposalCount > 0 && (
              <InfoRow label="제안서" value={`${ticket.proposalCount}건`} />
            )}
        </div>

        {!isOwner && (
          <>
            <Separator />
            <Button
              size="lg"
              className="w-full"
              disabled={!canPropose}
              onClick={canPropose ? handleSendProposal : undefined}
            >
              <Text as="span" typography="body2-bold">
                {canPropose ? "제안서 보내기" : statusInfo.text}
              </Text>
            </Button>
          </>
        )}

        {canEdit && (
          <>
            <Separator />
            <Button
              size="lg"
              variant="outline"
              className="w-full"
              onClick={() => router.push(`/tickets/${ticket.id}/edit`)}
            >
              <Text as="span" typography="body2-bold">
                의뢰 수정
              </Text>
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <Text
        as="span"
        typography="body3-regular"
        className="text-muted-foreground"
      >
        {label}
      </Text>
      <Text as="span" typography="body3-medium" className="text-foreground">
        {value}
      </Text>
    </div>
  )
}
