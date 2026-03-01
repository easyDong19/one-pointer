import { useMutation, useQueryClient } from "@tanstack/react-query"
import { login, type LoginRequest, type LoginResponse } from "@/entities/auth/api/auth.service"
import { authQueryKeys } from "@/entities/auth/model/auth.query-keys"
import { useAuthStore } from "@/entities/auth/model/auth-store"

export function useLoginMutation() {
  const queryClient = useQueryClient()
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated)

  return useMutation<LoginResponse, unknown, LoginRequest>({
    mutationFn: login,
    onSuccess: async (response) => {
      setAuthenticated(response.data.user)
      await queryClient.invalidateQueries({ queryKey: authQueryKeys.me })
    },
  })
}
