import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { logout, type LogoutResponse } from "@/entities/auth/api/auth.service"
import { authQueryKeys } from "@/entities/auth/model/auth.query-keys"
import { useAuthStore } from "@/entities/auth/model/auth-store"
import { useRoleStore } from "@/entities/user/model/role-store"

export function useLogoutMutation() {
  const queryClient = useQueryClient()
  const setUnauthenticated = useAuthStore((state) => state.setUnauthenticated)
  const router = useRouter()

  return useMutation<LogoutResponse>({
    mutationFn: logout,
    onSuccess: async () => {
      await queryClient.cancelQueries({ queryKey: authQueryKeys.all })
      queryClient.removeQueries({ queryKey: authQueryKeys.all })
      // 먼저 로그인 페이지로 이동 후 상태 변경 (AuthGuard 모달 방지)
      router.replace("/login")
      useRoleStore.getState().setRole("client")
      setUnauthenticated()
    },
  })
}
