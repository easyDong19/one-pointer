"use client"

import { useCallback, useRef, useState } from "react"
import { Loader2 } from "lucide-react"

import { Text } from "@/shared/ui/text"
import { openAlert } from "@/shared/lib/open-alert"
import { openConfirm } from "@/shared/lib/open-confirm-dialog"

import { useReceivedDirectRequestsQuery } from "../model/use-received-direct-requests-query"
import { useRejectDirectRequestMutation } from "../model/use-reject-direct-request-mutation"
import { ReceivedDirectRequestCard } from "./received-direct-request-card"

export function ReceivedDirectRequestList() {
  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useReceivedDirectRequestsQuery()
  const rejectMutation = useRejectDirectRequestMutation()
  const [rejectingId, setRejectingId] = useState<number | null>(null)

  const tickets = data?.pages.flatMap((p) => p.content) ?? []

  const observerRef = useRef<IntersectionObserver | null>(null)
  const sentinelRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (observerRef.current) observerRef.current.disconnect()
      if (!node) return
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      })
      observerRef.current.observe(node)
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage],
  )

  const handleReject = async (ticketId: number) => {
    const ok = await openConfirm({
      title: "직접 요청 거절",
      description: "이 직접 요청을 거절하시겠습니까? 거절 후에는 되돌릴 수 없습니다.",
      confirmLabel: "거절",
      variant: "destructive",
    })
    if (!ok) return

    setRejectingId(ticketId)
    try {
      await rejectMutation.mutateAsync(ticketId)
      await openAlert({ variant: "success", title: "직접 요청을 거절했습니다." })
    } catch {
      await openAlert({ variant: "warning", title: "거절에 실패했습니다." })
    } finally {
      setRejectingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="text-muted-foreground size-5 animate-spin" />
      </div>
    )
  }

  if (isError) {
    return (
      <Text
        typography="body2-medium"
        className="text-muted-foreground py-10 text-center"
      >
        받은 직접 요청을 불러올 수 없어요
      </Text>
    )
  }

  if (tickets.length === 0) {
    return (
      <div className="bg-muted/50 rounded-xl py-14 text-center">
        <Text typography="body2-medium" className="text-muted-foreground">
          받은 직접 요청이 없어요
        </Text>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {tickets.map((ticket) => (
        <ReceivedDirectRequestCard
          key={ticket.id}
          ticket={ticket}
          onReject={() => handleReject(ticket.id)}
          isRejecting={rejectingId === ticket.id}
        />
      ))}
      {hasNextPage && (
        <>
          <div ref={sentinelRef} className="h-8" aria-hidden />
          {isFetchingNextPage && (
            <div className="flex items-center justify-center py-2">
              <Loader2 className="text-muted-foreground size-4 animate-spin" />
            </div>
          )}
        </>
      )}
    </div>
  )
}
