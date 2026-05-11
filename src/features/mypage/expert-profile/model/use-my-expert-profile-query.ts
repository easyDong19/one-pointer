"use client"

import { useQuery } from "@tanstack/react-query"
import { userQueryKeys } from "@/entities/user/model/user.query-keys"
import { getMyExpertProfile } from "@/entities/user/api/user.service"

/**
 * `GET /v1/api/user/expert/me` — 내 전문가 프로필.
 *
 * 전문가 프로필이 없는 의뢰인이 호출하면 백엔드가 404 를 반환하므로
 * `enabled` 로 호출처에서 명시적으로 gate 한다 (e.g. `useExpertExistsQuery` 결과로).
 */
export function useMyExpertProfileQuery(enabled = true) {
  return useQuery({
    queryKey: userQueryKeys.myExpertProfile,
    queryFn: getMyExpertProfile,
    enabled,
  })
}
