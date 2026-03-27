"use client"

import { useQuery } from "@tanstack/react-query"
import { getClientDashboard } from "@/entities/user/api/user.service"
import { userQueryKeys } from "@/entities/user/model/user.query-keys"

export function useClientDashboardQuery(enabled = true) {
  return useQuery({
    queryKey: userQueryKeys.clientDashboard,
    queryFn: getClientDashboard,
    enabled,
  })
}
