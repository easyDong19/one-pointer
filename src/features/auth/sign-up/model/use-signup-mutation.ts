import { useMutation, useQueryClient } from "@tanstack/react-query"
import { signup, type SignupRequest, type SignupResponse } from "@/entities/auth/api/auth.service"
import { authQueryKeys } from "@/entities/auth/model/auth.query-keys"
import { useAuthStore } from "@/entities/auth/model/auth-store"

export function useSignupMutation() {
  const queryClient = useQueryClient()
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated)

  return useMutation<SignupResponse, unknown, SignupRequest>({
    mutationFn: signup,
    onSuccess: async (response) => {
      setAuthenticated(response.data.user)
      await queryClient.invalidateQueries({ queryKey: authQueryKeys.me })
    },
  })
}
