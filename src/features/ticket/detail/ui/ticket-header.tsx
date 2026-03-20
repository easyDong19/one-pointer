import { Text } from "@/shared/ui/text"
import { Badge } from "@/shared/ui/badge"
import { formatBudget, formatDate } from "@/shared/lib/format"
import { STATUS_LABEL } from "@/entities/ticket/lib/ticket.constants"
import type { TicketDetail } from "@/entities/ticket/api/ticket.schema"

export function TicketHeader({ ticket }: { ticket: TicketDetail }) {
  const statusInfo = STATUS_LABEL[ticket.status] ?? STATUS_LABEL.OPEN

  return (
    <div className="flex flex-col gap-3">
      {/* Badges */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={statusInfo.variant}>{statusInfo.text}</Badge>
        {ticket.categoryName && (
          <Badge variant="outline">{ticket.categoryName}</Badge>
        )}
        {ticket.subCategoryName && (
          <Badge variant="outline">{ticket.subCategoryName}</Badge>
        )}
      </div>

      {/* Title */}
      <Text as="h1" typography="title-bold" className="text-foreground">
        {ticket.title}
      </Text>

      {/* Date */}
      <Text as="p" typography="body3-regular" className="text-muted-foreground">
        {formatDate(ticket.createdAt)}
      </Text>

      {/* Budget */}
      <Text as="p" typography="subtitle1-bold" className="text-foreground">
        {ticket.budgetType === "NEGOTIABLE"
          ? "가격 협의"
          : `총 ${formatBudget(ticket.budgetMin ?? 0, ticket.budgetMax ?? 0)}`}
      </Text>
    </div>
  )
}
