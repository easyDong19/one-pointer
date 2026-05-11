"use client"

import { useInfiniteQuery } from "@tanstack/react-query"

import { getMyCompletedProposals } from "@/entities/proposal/api/proposal.service"
import { proposalQueryKeys } from "@/entities/proposal/model/proposal.query-keys"

const PAGE_SIZE = 20

/**
 * `GET /v1/api/proposal/my/completed` — 완료 내 제안 (커서 페이지네이션).
 */
export function useMyCompletedProposalsQuery(enabled = true) {
  return useInfiniteQuery({
    queryKey: proposalQueryKeys.myCompleted({ size: PAGE_SIZE }),
    queryFn: ({ pageParam }) =>
      getMyCompletedProposals({
        cursor: pageParam ?? undefined,
        size: PAGE_SIZE,
      }),
    initialPageParam: null as string | number | null,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? (lastPage.nextCursor ?? undefined) : undefined,
    enabled,
  })
}
