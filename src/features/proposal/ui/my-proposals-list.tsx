"use client"

import { useCallback, useMemo, useRef } from "react"
import { Loader2 } from "lucide-react"

import { Text } from "@/shared/ui/text"

import { openMyProposalDetail } from "../lib/open-my-proposal-detail"
import { useMyCompletedProposalsQuery } from "../model/use-my-completed-proposals-query"
import { useMyInProgressProposalsQuery } from "../model/use-my-in-progress-proposals-query"
import { MyProposalCard } from "./my-proposal-card"

type Tab = "in-progress" | "completed"

type Props = {
  tab: Tab
}

export function MyProposalsList({ tab }: Props) {
  const inProgress = useMyInProgressProposalsQuery(tab === "in-progress")
  const completed = useMyCompletedProposalsQuery(tab === "completed")
  const list = tab === "in-progress" ? inProgress : completed
  // 멤버 표현식 대신 지역 변수로 구조분해해야 메모이제이션이 보존된다.
  const { data, hasNextPage, isFetchingNextPage, fetchNextPage } = list

  const proposals = useMemo(
    () => data?.pages.flatMap((p) => p.content) ?? [],
    [data],
  )

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

  if (list.isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="text-muted-foreground size-5 animate-spin" />
      </div>
    )
  }

  if (list.isError) {
    return (
      <Text typography="body2-medium" className="text-muted-foreground py-10 text-center">
        제안 목록을 불러올 수 없어요
      </Text>
    )
  }

  if (proposals.length === 0) {
    return (
      <div className="bg-muted/50 rounded-xl py-14 text-center">
        <Text typography="body2-medium" className="text-muted-foreground">
          {tab === "in-progress"
            ? "진행 중인 제안이 없어요"
            : "완료된 제안이 없어요"}
        </Text>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {proposals.map((proposal) => (
        <MyProposalCard
          key={proposal.id}
          proposal={proposal}
          onClick={() => openMyProposalDetail({ proposalId: proposal.id })}
        />
      ))}
      {list.hasNextPage && (
        <>
          <div ref={sentinelRef} className="h-8" aria-hidden />
          {list.isFetchingNextPage && (
            <div className="flex items-center justify-center py-2">
              <Loader2 className="text-muted-foreground size-4 animate-spin" />
            </div>
          )}
        </>
      )}
    </div>
  )
}
