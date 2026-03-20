import { Text } from "@/shared/ui/text"
import { Button } from "@/shared/ui/button"
import { STATUS_LABEL } from "@/entities/ticket/lib/ticket.constants"
import type { TicketDetail } from "@/entities/ticket/api/ticket.schema"

export function TicketMobileBottomBar({ ticket }: { ticket: TicketDetail }) {
  const canPropose = ticket.status === "OPEN" || ticket.status === "IN_REVIEW"
  const statusInfo = STATUS_LABEL[ticket.status] ?? STATUS_LABEL.OPEN

  return (
    <div className="bg-background/80 border-border/50 fixed bottom-0 left-0 right-0 z-50 border-t px-4 pb-[env(safe-area-inset-bottom,0px)] pt-3 backdrop-blur-md lg:hidden">
      <div className="mx-auto max-w-3xl pb-3">
        <Button
          size="lg"
          className="w-full rounded-xl py-6"
          disabled={!canPropose}
        >
          <Text as="span" typography="body1-bold">
            {canPropose ? "제안서 보내기" : statusInfo.text}
          </Text>
        </Button>
      </div>
    </div>
  )
}
