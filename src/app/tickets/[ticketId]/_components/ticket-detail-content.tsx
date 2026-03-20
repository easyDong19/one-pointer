"use client"

import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Text } from "@/shared/ui/text"
import { Separator } from "@/shared/ui/separator"
import { useTicketDetailQuery } from "@/features/ticket/detail/model/use-ticket-detail-query"
import { TicketImageCarousel } from "@/features/ticket/detail/ui/ticket-image-carousel"
import { TicketHeader } from "@/features/ticket/detail/ui/ticket-header"
import { TicketDescription } from "@/features/ticket/detail/ui/ticket-description"
import { TicketInfo } from "@/features/ticket/detail/ui/ticket-info"
import { TicketDesktopSidebar } from "@/features/ticket/detail/ui/ticket-desktop-sidebar"
import { TicketMobileBottomBar } from "@/features/ticket/detail/ui/ticket-mobile-bottom-bar"

export function TicketDetailContent({ ticketId }: { ticketId: number }) {
  const router = useRouter()
  const { data: ticket, isLoading, isError, error } = useTicketDetailQuery(ticketId)

  if (isLoading) {
    return (
      <div className="bg-background flex min-h-dvh items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (isError) {
    console.error("Ticket detail query error:", error)
  }

  if (!ticket) {
    return (
      <div className="bg-background flex min-h-dvh flex-col items-center justify-center gap-3">
        <Text as="p" typography="body1-medium" className="text-muted-foreground">
          {isError
            ? "데이터를 불러오는 중 오류가 발생했습니다"
            : "의뢰를 찾을 수 없습니다"}
        </Text>
        {isError && (
          <Text
            as="p"
            typography="caption1-medium"
            className="text-destructive max-w-sm text-center"
          >
            {error?.message}
          </Text>
        )}
        <button
          onClick={() => router.back()}
          className="text-primary text-sm font-medium underline"
        >
          뒤로가기
        </button>
      </div>
    )
  }

  return (
    <div className="bg-background min-h-dvh pb-24">
      {/* Desktop: 2-column layout */}
      <div className="mx-auto max-w-5xl lg:grid lg:grid-cols-[1fr_400px] lg:items-start lg:gap-8 lg:px-6 lg:py-8">
        {/* Left column / Mobile full width */}
        <div>
          <TicketImageCarousel
            images={ticket.images ?? []}
            onBack={() => router.back()}
          />

          <div className="px-4 pt-5 lg:px-0">
            <TicketHeader ticket={ticket} />
            <Separator className="my-5" />
            <TicketDescription ticket={ticket} />
            <Separator className="my-5" />
            <TicketInfo ticket={ticket} />
          </div>
        </div>

        {/* Desktop: Right sidebar */}
        <div className="hidden lg:block">
          <TicketDesktopSidebar ticket={ticket} />
        </div>
      </div>

      {/* Mobile: Bottom fixed button */}
      <TicketMobileBottomBar ticket={ticket} />
    </div>
  )
}
