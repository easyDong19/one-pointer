"use client"

import { useEffect, useEffectEvent } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { useAuthStore } from "@/entities/auth/model/auth-store"
import { useTicketCreateForm } from "@/features/ticket/create/model/use-ticket-create-form"
import type { TicketDetail } from "@/entities/ticket/api/ticket.schema"
import { getTicketEditAction } from "@/entities/ticket/lib/ticket.constants"
import { TicketCreatePage } from "@/features/ticket/create/ui/ticket-create-page"
import { useTicketDetailQuery } from "@/features/ticket/detail/model/use-ticket-detail-query"
import { Text } from "@/shared/ui/text"

/**
 * `/tickets/[id]/edit` — 모바일 `CreateTicketView(ticket: ticket)` 대응.
 *
 * - 의뢰 상세 조회 → 폼 store 에 `initFromTicket()` 으로 prefill
 * - 가드: 본인 소유 + 모바일과 동일한 status 정책 (entities/ticket/lib/ticket.constants
 *   의 getTicketEditAction). OPEN 만 editable; IN_REVIEW 는 specific message; 그 외 generic.
 * - 이후 wizard 자체는 `mode === "edit"` 분기로 라벨/submit 변경
 *
 * 준비 상태(`ready`) 는 store 의 `mode === "edit" && editingTicketId === ticketId`
 * 로 derived — `initFromTicket()` 가 그 두 필드를 동시에 세팅하므로 별도 useState
 * 없이 zustand subscription 만으로 re-render 가 자동 발생한다.
 */
export function TicketEditContent({ ticketId }: { ticketId: number }) {
  const router = useRouter()
  const userId = useAuthStore((s) => s.user?.id)
  const { data: ticket, isLoading, isError } = useTicketDetailQuery(ticketId)
  const initFromTicket = useTicketCreateForm((s) => s.initFromTicket)
  const reset = useTicketCreateForm((s) => s.reset)
  const ready = useTicketCreateForm(
    (s) => s.mode === "edit" && s.editingTicketId === ticketId,
  )

  // 가드 + prefill 은 "effect event" 로 분리 — router / initFromTicket / ticketId
  // 같은 stable 참조는 deps 에서 빠진다. userId 는 비동기로 늦게 도착할 수 있어
  // reactive 해야 하므로 (효과 재실행 트리거) effect deps 에 그대로 남긴다.
  const onTicketLoaded = useEffectEvent((loaded: TicketDetail, currentUserId: number) => {
    if (currentUserId !== loaded.clientId) {
      toast.error("본인 의뢰만 수정할 수 있어요")
      router.replace(`/tickets/${ticketId}`)
      return
    }

    // 모바일과 동일한 status 가드 — IN_REVIEW 는 specific message, 그 외는 generic
    const editAction = getTicketEditAction(loaded.status)
    if (editAction.kind !== "editable") {
      toast.info(
        editAction.kind === "blocked"
          ? editAction.message
          : "이 상태에서는 의뢰를 수정할 수 없어요",
      )
      router.replace(`/tickets/${ticketId}`)
      return
    }

    initFromTicket(loaded)
  })

  useEffect(() => {
    if (ready || !ticket || userId == null) return
    onTicketLoaded(ticket, userId)
  }, [ready, ticket, userId])

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
  // — initFromTicket 호출 후 mode/editingTicketId 변화에 zustand 가 re-render 트리거
  if (!ready) {
    return (
      <div className="bg-background flex min-h-dvh items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    )
  }

  return <TicketCreatePage />
}
