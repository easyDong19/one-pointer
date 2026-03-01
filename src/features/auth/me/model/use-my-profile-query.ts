import { useQuery } from "@tanstack/react-query"
import { getMyProfile } from "@/entities/auth/api/auth.service"
import { authQueryKeys } from "@/entities/auth/model/auth.query-keys"
import { useAuthStore } from "@/entities/auth/model/auth-store"

export function useMyProfileQuery() {
  const storedUser = useAuthStore((state) => state.user)

  return useQuery({
    queryKey: authQueryKeys.me,
    queryFn: getMyProfile,
    staleTime: 60_000,
    initialData: storedUser ?? undefined,
  })
}
