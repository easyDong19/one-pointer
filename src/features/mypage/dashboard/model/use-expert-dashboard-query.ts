"use client"

import { useQuery } from "@tanstack/react-query"
import { getExpertDashboard } from "@/entities/user/api/user.service"
import { userQueryKeys } from "@/entities/user/model/user.query-keys"

export function useExpertDashboardQuery(enabled = true) {
  return useQuery({
    queryKey: userQueryKeys.expertDashboard,
    queryFn: getExpertDashboard,
    enabled,
  })
}
