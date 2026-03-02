import { useMutation, useQueryClient } from "@tanstack/react-query"
import { logout, type LogoutResponse } from "@/entities/auth/api/auth.service"
import { authQueryKeys } from "@/entities/auth/model/auth.query-keys"
import { useAuthStore } from "@/entities/auth/model/auth-store"

export function useLogoutMutation() {
  const queryClient = useQueryClient()
  const setUnauthenticated = useAuthStore((state) => state.setUnauthenticated)

  return useMutation<LogoutResponse>({
    mutationFn: logout,
    onSuccess: async () => {
      await queryClient.cancelQueries({ queryKey: authQueryKeys.all })
      queryClient.removeQueries({ queryKey: authQueryKeys.all })
      setUnauthenticated()
    },
  })
}
