import Link from "next/link"
import { Monitor } from "lucide-react"
import { Text } from "@/shared/ui/text"
import { cn } from "@/shared/lib/utils"
import { formatBudget, formatRelativeTime } from "@/shared/lib/format"
import type { TicketFeedItem } from "@/entities/ticket/api/ticket.schema"
import { TICKET_TYPE_LABEL } from "@/entities/category/lib/category.constants"

export function TicketList({
  tickets,
  isLoading,
}: {
  tickets: TicketFeedItem[]
  isLoading: boolean
}) {
  if (isLoading) {
    return (
      <div className="flex flex-col">
        {Array.from({ length: 5 }).map((_, i) => (
          <TicketSkeleton key={i} />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {tickets.map((ticket) => (
        <TicketListItem key={ticket.id} ticket={ticket} />
      ))}
    </div>
  )
}

function TicketListItem({ ticket }: { ticket: TicketFeedItem }) {
  const typeInfo = TICKET_TYPE_LABEL[ticket.ticketType ?? "OFFLINE"] ?? TICKET_TYPE_LABEL.OFFLINE

  return (
    <Link
      href={`/tickets/${ticket.id}`}
      className="border-border/50 hover:bg-muted/30 flex gap-4 border-b px-4 py-4 transition-colors lg:px-6"
    >
      {/* Thumbnail */}
      <div className="bg-muted h-[100px] w-[100px] shrink-0 overflow-hidden rounded-xl lg:h-[120px] lg:w-[120px]">
        {ticket.thumbnailUrl ? (
          <img
            src={ticket.thumbnailUrl}
            alt={ticket.title ?? ""}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Monitor className="text-muted-foreground/40 h-8 w-8" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {/* Top: category + type + time */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Text as="span" typography="caption1-medium" className="text-muted-foreground">
              {ticket.subCategoryName}
            </Text>
            <span className={cn("rounded-md px-1.5 py-0.5", typeInfo.className)}>
              <Text as="span" typography="caption2-medium">
                {typeInfo.text}
              </Text>
            </span>
          </div>
          <Text as="span" typography="caption2-medium" className="text-muted-foreground shrink-0">
            {ticket.createdAt ? formatRelativeTime(ticket.createdAt) : ""}
          </Text>
        </div>

        {/* Title */}
        <Text as="h3" typography="body2-bold" className="text-foreground line-clamp-2">
          {ticket.title}
        </Text>

        {/* Budget */}
        <Text as="span" typography="body3-bold" className="text-primary">
          {ticket.budgetType === "NEGOTIABLE"
            ? "가격 협의"
            : formatBudget(ticket.budgetMin ?? 0, ticket.budgetMax ?? 0)}
        </Text>

        {/* Bottom: region + proposals + deadline */}
        <div className="mt-auto flex items-center justify-between pt-1">
          <div className="flex items-center gap-1">
            {ticket.region && (
              <Text as="span" typography="caption1-medium" className="text-muted-foreground">
                {ticket.region}
              </Text>
            )}
            {ticket.region && (ticket.proposalCount ?? 0) > 0 && (
              <Text as="span" typography="caption1-medium" className="text-muted-foreground">
                ·
              </Text>
            )}
            {(ticket.proposalCount ?? 0) > 0 && (
              <Text as="span" typography="caption1-medium" className="text-muted-foreground">
                제안 {ticket.proposalCount}건
              </Text>
            )}
          </div>
          {(ticket.daysUntilDeadline ?? -1) >= 0 && (
            <span
              className={cn(
                "rounded-md px-2 py-0.5 font-semibold",
                (ticket.daysUntilDeadline ?? 0) <= 2
                  ? "bg-destructive/10 text-destructive"
                  : "bg-primary-light text-primary",
              )}
            >
              <Text as="span" typography="caption1-bold">
                D-{ticket.daysUntilDeadline ?? 0}
              </Text>
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

function TicketSkeleton() {
  return (
    <div className="border-border/50 flex gap-4 border-b px-4 py-4 lg:px-6">
      <div className="bg-muted h-[100px] w-[100px] shrink-0 animate-pulse rounded-xl lg:h-[120px] lg:w-[120px]" />
      <div className="flex flex-1 flex-col gap-2">
        <div className="bg-muted h-4 w-32 animate-pulse rounded" />
        <div className="bg-muted h-5 w-full animate-pulse rounded" />
        <div className="bg-muted h-4 w-24 animate-pulse rounded" />
        <div className="bg-muted mt-auto h-4 w-40 animate-pulse rounded" />
      </div>
    </div>
  )
}
