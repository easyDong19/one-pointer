"use client"

import { useQuery } from "@tanstack/react-query"
import { userQueryKeys } from "@/entities/user/model/user.query-keys"
import { getMyExpertProfile } from "@/entities/user/api/user.service"

export function useMyExpertProfileQuery() {
  return useQuery({
    queryKey: userQueryKeys.myExpertProfile,
    queryFn: getMyExpertProfile,
  })
}
