import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { logout, type LogoutResponse } from "@/entities/auth/api/auth.service"
import { useAuthStore } from "@/entities/auth/model/auth-store"
import { useRoleStore } from "@/entities/user/model/role-store"

export function useLogoutMutation() {
  const queryClient = useQueryClient()
  const setUnauthenticated = useAuthStore((state) => state.setUnauthenticated)
  const router = useRouter()

  return useMutation<LogoutResponse>({
    mutationFn: logout,
    onSuccess: async () => {
      await queryClient.cancelQueries()
      // 모든 캐시 제거: 다른 계정으로 재로그인 시 이전 사용자의 user/expertExists 등
      // 캐시가 잠시 남아 잘못된 권한 추론으로 부수 쿼리(예: expert/me) 가 의뢰인 인증으로
      // 호출되며 404 가 발생하던 버그 방지.
      queryClient.clear()
      // 먼저 로그인 페이지로 이동 후 상태 변경 (AuthGuard 모달 방지)
      router.replace("/login")
      useRoleStore.getState().setRole("client")
      setUnauthenticated()
    },
  })
}
