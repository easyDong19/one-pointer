import { Text } from "@/shared/ui/text"
import type { TicketDetail } from "@/entities/ticket/api/ticket.schema"

export function TicketDescription({ ticket }: { ticket: TicketDetail }) {
  return (
    <div className="flex flex-col gap-3">
      <Text as="h2" typography="body1-bold" className="text-foreground">
        상세 내용
      </Text>
      <Text
        as="p"
        typography="body2-regular"
        className="text-foreground whitespace-pre-wrap"
      >
        {ticket.content || "상세 내용이 없습니다."}
      </Text>
    </div>
  )
}
