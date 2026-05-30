"use client"

import { useCallback, useMemo, useRef } from "react"
import { Loader2 } from "lucide-react"

import { Text } from "@/shared/ui/text"

import { useMyTicketsQuery } from "../model/use-my-tickets-query"
import { useMyInProgressTicketsQuery } from "../model/use-my-in-progress-tickets-query"
import { useMyCompletedTicketsQuery } from "../model/use-my-completed-tickets-query"
import { MyTicketCard } from "./my-ticket-card"

export type Tab = "recruiting" | "in-progress" | "completed"

type Props = {
  tab: Tab
}

const EMPTY_MESSAGES: Record<Tab, string> = {
  recruiting: "모집 중인 의뢰가 없어요",
  "in-progress": "진행 중인 의뢰가 없어요",
  completed: "완료된 의뢰가 없어요",
}

export function MyTicketsList({ tab }: Props) {
  const recruiting = useMyTicketsQuery(tab === "recruiting")
  const inProgress = useMyInProgressTicketsQuery(tab === "in-progress")
  const completed = useMyCompletedTicketsQuery(tab === "completed")

  const paginatedQuery = tab === "in-progress" ? inProgress : completed
  // 멤버 표현식 대신 지역 변수로 구조분해해야 메모이제이션이 보존된다.
  const recruitingData = recruiting.data
  const {
    data: paginatedData,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = paginatedQuery

  const tickets = useMemo(() => {
    if (tab === "recruiting") return recruitingData ?? []
    return paginatedData?.pages.flatMap((p) => p.content) ?? []
  }, [tab, recruitingData, paginatedData])

  const isLoading = tab === "recruiting" ? recruiting.isLoading : paginatedQuery.isLoading
  const isError = tab === "recruiting" ? recruiting.isError : paginatedQuery.isError

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

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="text-muted-foreground size-5 animate-spin" />
      </div>
    )
  }

  if (isError) {
    return (
      <Text typography="body2-medium" className="text-muted-foreground py-10 text-center">
        의뢰 목록을 불러올 수 없어요
      </Text>
    )
  }

  if (tickets.length === 0) {
    return (
      <div className="bg-muted/50 rounded-xl py-14 text-center">
        <Text typography="body2-medium" className="text-muted-foreground">
          {EMPTY_MESSAGES[tab]}
        </Text>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {tickets.map((ticket) => (
        <MyTicketCard
          key={ticket.id}
          ticket={ticket}
          showProposalCount={tab === "recruiting"}
        />
      ))}
      {tab !== "recruiting" && paginatedQuery.hasNextPage && (
        <>
          <div ref={sentinelRef} className="h-8" aria-hidden />
          {paginatedQuery.isFetchingNextPage && (
            <div className="flex items-center justify-center py-2">
              <Loader2 className="text-muted-foreground size-4 animate-spin" />
            </div>
          )}
        </>
      )}
    </div>
  )
}
