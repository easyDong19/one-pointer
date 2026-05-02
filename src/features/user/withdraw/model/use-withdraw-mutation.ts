"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { withdrawAccount } from "@/entities/user/api/user.service"
import { useAuthStore } from "@/entities/auth/model/auth-store"
import { authQueryKeys } from "@/entities/auth/model/auth.query-keys"
import { useRoleStore } from "@/entities/user/model/role-store"

/**
 * 회원 탈퇴 mutation. useLogoutMutation 의 onSuccess 패턴 차용.
 * 정상 응답 시 캐시·store 정리 → /login 으로 redirect.
 *
 * 차단 응답(success: false → ApiError 409) 은 호출하는 컴포넌트의 try/catch 에서 처리.
 */
export function useWithdrawMutation() {
  const queryClient = useQueryClient()
  const setUnauthenticated = useAuthStore((s) => s.setUnauthenticated)
  const router = useRouter()

  return useMutation<void>({
    mutationFn: withdrawAccount,
    onSuccess: async () => {
      await queryClient.cancelQueries({ queryKey: authQueryKeys.all })
      queryClient.removeQueries({ queryKey: authQueryKeys.all })
      router.replace("/login")
      useRoleStore.getState().setRole("client")
      setUnauthenticated()
    },
  })
}
