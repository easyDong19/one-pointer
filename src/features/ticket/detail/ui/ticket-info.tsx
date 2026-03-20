import { Text } from "@/shared/ui/text"
import { formatDate, formatDateShort, getDaysUntilDeadline } from "@/shared/lib/format"
import { LEVEL_LABEL, TICKET_TYPE_LABEL } from "@/entities/ticket/lib/ticket.constants"
import type { TicketDetail } from "@/entities/ticket/api/ticket.schema"

export function TicketInfo({ ticket }: { ticket: TicketDetail }) {
  const daysUntilDeadline = ticket.deadline
    ? getDaysUntilDeadline(ticket.deadline)
    : null

  const infoRows: { label: string; value: string; badge?: string }[] = [
    {
      label: "의뢰 유형",
      value: TICKET_TYPE_LABEL[ticket.ticketType] ?? ticket.ticketType,
    },
    ...(ticket.level
      ? [{ label: "레벨", value: LEVEL_LABEL[ticket.level] ?? ticket.level }]
      : []),
    ...(ticket.desiredDuration
      ? [{ label: "희망 소요 시간", value: ticket.desiredDuration }]
      : []),
    ...(ticket.desiredDates && ticket.desiredDates.length > 0
      ? [
          {
            label: "희망 일시",
            value: ticket.desiredDates
              .map((d) => `${formatDateShort(d.date)} ${d.timeSlot}`)
              .join(", "),
          },
        ]
      : []),
    ...(ticket.region ? [{ label: "지역", value: ticket.region }] : []),
    ...(ticket.locationDetail
      ? [{ label: "상세 장소", value: ticket.locationDetail }]
      : []),
    ...(ticket.deadline
      ? [
          {
            label: "의뢰 마감일",
            value: formatDate(ticket.deadline),
            badge:
              daysUntilDeadline !== null && daysUntilDeadline >= 0
                ? `D-${daysUntilDeadline}`
                : undefined,
          },
        ]
      : []),
  ]

  return (
    <div className="flex flex-col gap-4">
      <Text as="h2" typography="body1-bold" className="text-foreground">
        의뢰 정보
      </Text>
      <div className="flex flex-col gap-3">
        {infoRows.map((row) => (
          <div key={row.label} className="flex items-center justify-between">
            <Text
              as="span"
              typography="body2-regular"
              className="text-muted-foreground"
            >
              {row.label}
            </Text>
            <div className="flex items-center gap-2">
              <Text
                as="span"
                typography="body2-medium"
                className="text-foreground"
              >
                {row.value}
              </Text>
              {row.badge && (
                <span className="bg-destructive/10 text-destructive rounded-full px-2 py-0.5">
                  <Text as="span" typography="caption1-bold">
                    {row.badge}
                  </Text>
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
