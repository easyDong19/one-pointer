"use client"

import { useQuery } from "@tanstack/react-query"

import type { EarningsRequest } from "@/entities/earnings/api/earnings.service"
import { getExpertEarnings } from "@/entities/earnings/api/earnings.service"
import { earningsQueryKeys } from "@/entities/earnings/model/earnings.query-keys"

export function useEarningsSummaryQuery(params?: EarningsRequest) {
  return useQuery({
    queryKey: earningsQueryKeys.summary(params),
    queryFn: () => getExpertEarnings(params),
  })
}
