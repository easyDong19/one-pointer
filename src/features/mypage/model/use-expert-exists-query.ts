"use client"

import { useQuery } from "@tanstack/react-query"
import { checkExpertProfileExists } from "@/entities/user/api/user.service"
import { userQueryKeys } from "@/entities/user/model/user.query-keys"

export function useExpertExistsQuery() {
  return useQuery({
    queryKey: userQueryKeys.expertExists,
    queryFn: checkExpertProfileExists,
  })
}
