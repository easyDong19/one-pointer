"use client"

import { useInfiniteQuery } from "@tanstack/react-query"

import type { TransactionStatus } from "@/entities/earnings/api/earnings.schema"
import { getExpertTransactions } from "@/entities/earnings/api/earnings.service"
import { earningsQueryKeys } from "@/entities/earnings/model/earnings.query-keys"

export function useEarningsTransactionsQuery(status?: TransactionStatus) {
  return useInfiniteQuery({
    queryKey: earningsQueryKeys.transactions({ status }),
    queryFn: ({ pageParam }) =>
      getExpertTransactions({
        cursor: pageParam ?? undefined,
        status,
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? lastPage.nextCursor : undefined,
  })
}
