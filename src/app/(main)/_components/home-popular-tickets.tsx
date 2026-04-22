import Link from "next/link"
import { TrendingUp, Monitor } from "lucide-react"
import { Text } from "@/shared/ui/text"
import type { TicketFeedItem } from "@/entities/ticket/api/ticket.schema"

type HomePopularTicketsProps = {
  tickets: TicketFeedItem[]
}

const TICKET_TYPE_LABEL: Record<string, { text: string; className: string }> = {
  ONLINE: { text: "온라인", className: "text-success-foreground bg-success/10" },
  OFFLINE: { text: "오프라인", className: "text-primary bg-primary-light" },
}

function formatBudget(min: number, max: number): string {
  const fmt = (n: number) => n.toLocaleString("ko-KR")
  if (min === max) return `${fmt(min)}원`
  return `${fmt(min)} ~ ${fmt(max)}원`
}

export function HomePopularTickets({ tickets }: HomePopularTicketsProps) {
  if (tickets.length === 0) return null

  const displayTickets = tickets.slice(0, 10)

  return (
    <section className="flex flex-col gap-op-lg">
      <div className="flex items-center gap-2">
        <TrendingUp className="text-primary" />
        <Text as="h2" typography="subtitle1-bold" className="text-foreground">
          인기 있는 의뢰
        </Text>
      </div>

      {/* 모바일: 가로 스크롤 */}
      <div className="-mx-5 px-5 md:mx-0 md:px-0">
        <div className="flex gap-op-md overflow-x-auto pb-2 scrollbar-none md:hidden">
          {displayTickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} className="w-[180px] shrink-0" />
          ))}
        </div>
      </div>

      {/* 데스크탑: 그리드 */}
      <div className="hidden gap-op-md md:grid md:grid-cols-3 lg:grid-cols-4">
        {displayTickets.slice(0, 8).map((ticket) => (
          <TicketCard key={ticket.id} ticket={ticket} />
        ))}
      </div>
    </section>
  )
}

function TicketCard({
  ticket,
  className = "",
}: {
  ticket: TicketFeedItem
  className?: string
}) {
  const typeInfo = TICKET_TYPE_LABEL[ticket.ticketType ?? "OFFLINE"] ?? TICKET_TYPE_LABEL.OFFLINE

  return (
    <Link
      href={`/tickets/${ticket.id}`}
      className={`border-border bg-card group flex flex-col overflow-hidden rounded-2xl border transition-shadow hover:shadow-md ${className}`}
    >
      {/* 썸네일 */}
      <div className="bg-muted relative aspect-[4/3] w-full overflow-hidden">
        {ticket.thumbnailUrl ? (
          <img
            src={ticket.thumbnailUrl}
            alt={ticket.title ?? ""}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Monitor className="text-muted-foreground/40" size={40} />
          </div>
        )}
        {ticket.new && (
          <span className="bg-destructive absolute top-2 left-2 rounded-md px-1.5 py-0.5">
            <Text as="span" typography="caption3-bold" className="text-destructive-foreground">
              NEW
            </Text>
          </span>
        )}
      </div>

      {/* 내용 */}
      <div className="flex flex-1 flex-col gap-1.5 p-op-md">
        {/* 카테고리 + 유형 */}
        <div className="flex items-center gap-1.5">
          <Text as="span" typography="caption2-medium" className="text-muted-foreground">
            {ticket.subCategoryName}
          </Text>
          <span className={`rounded-md px-1.5 py-0.5 ${typeInfo.className}`}>
            <Text as="span" typography="caption2-medium">
              {typeInfo.text}
            </Text>
          </span>
        </div>

        {/* 제목 */}
        <Text as="h3" typography="body3-bold" className="text-foreground line-clamp-2">
          {ticket.title}
        </Text>

        {/* 가격 */}
        <Text as="span" typography="body3-medium" className="text-primary mt-auto pt-1">
          {ticket.budgetType === "NEGOTIABLE"
            ? "가격 협의"
            : formatBudget(ticket.budgetMin ?? 0, ticket.budgetMax ?? 0)}
        </Text>
      </div>
    </Link>
  )
}
