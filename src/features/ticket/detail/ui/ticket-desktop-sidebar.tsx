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

export function TicketDesktopSidebar({ ticket }: { ticket: TicketDetail }) {
  const statusInfo = STATUS_LABEL[ticket.status] ?? STATUS_LABEL.OPEN
  const canPropose = ticket.status === "OPEN" || ticket.status === "IN_REVIEW"

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

        <Separator />

        {/* CTA */}
        <Button size="lg" className="w-full" disabled={!canPropose}>
          <Text as="span" typography="body2-bold">
            {canPropose ? "제안서 보내기" : statusInfo.text}
          </Text>
        </Button>
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
