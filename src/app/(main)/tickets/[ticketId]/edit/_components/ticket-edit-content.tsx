"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { useAuthStore } from "@/entities/auth/model/auth-store"
import { useTicketCreateForm } from "@/features/ticket/create/model/use-ticket-create-form"
import { TicketCreatePage } from "@/features/ticket/create/ui/ticket-create-page"
import { useTicketDetailQuery } from "@/features/ticket/detail/model/use-ticket-detail-query"
import { Text } from "@/shared/ui/text"

const EDITABLE_STATUSES = new Set(["OPEN", "IN_REVIEW"])

/**
 * `/tickets/[id]/edit` — 모바일 `CreateTicketView(ticket: ticket)` 대응.
 *
 * - 의뢰 상세 조회 → 폼 store 에 `initFromTicket()` 으로 prefill
 * - 가드: 본인 소유 + status ∈ {OPEN, IN_REVIEW}. 위반 시 상세 페이지로 redirect.
 * - 이후 wizard 자체는 `mode === "edit"` 분기로 라벨/submit 변경
 */
export function TicketEditContent({ ticketId }: { ticketId: number }) {
  const router = useRouter()
  const userId = useAuthStore((s) => s.user?.id)
  const { data: ticket, isLoading, isError } = useTicketDetailQuery(ticketId)
  const initFromTicket = useTicketCreateForm((s) => s.initFromTicket)
  const reset = useTicketCreateForm((s) => s.reset)
  const initRef = useRef(false)

  useEffect(() => {
    if (initRef.current) return
    if (!ticket || userId == null) return

    if (userId !== ticket.clientId) {
      toast.error("본인 의뢰만 수정할 수 있어요")
      router.replace(`/tickets/${ticketId}`)
      return
    }
    if (!EDITABLE_STATUSES.has(ticket.status)) {
      toast.error("이 상태에서는 의뢰를 수정할 수 없어요")
      router.replace(`/tickets/${ticketId}`)
      return
    }

    initRef.current = true
    initFromTicket(ticket)
  }, [ticket, userId, ticketId, router, initFromTicket])

  // unmount 시 reset — 다음 진입 (신규 또는 다른 edit) 시 깨끗하게
  useEffect(() => {
    return () => {
      reset()
    }
  }, [reset])

  if (isLoading || !ticket) {
    return (
      <div className="bg-background flex min-h-dvh items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="bg-background flex min-h-dvh items-center justify-center">
        <Text typography="body1-medium" className="text-muted-foreground">
          의뢰를 불러오지 못했어요
        </Text>
      </div>
    )
  }

  // store 가 아직 init 안 된 사이 (1 tick) 깜빡임 방지
  if (!initRef.current) {
    return (
      <div className="bg-background flex min-h-dvh items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    )
  }

  return <TicketCreatePage />
}
