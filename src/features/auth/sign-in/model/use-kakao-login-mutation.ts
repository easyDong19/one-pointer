import { useMutation, useQueryClient } from "@tanstack/react-query"
import { kakaoLogin, type KakaoLoginRequest, type KakaoLoginResponse } from "@/entities/auth/api/auth.service"
import { authQueryKeys } from "@/entities/auth/model/auth.query-keys"
import { useAuthStore } from "@/entities/auth/model/auth-store"

export function useKakaoLoginMutation() {
  const queryClient = useQueryClient()
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated)

  return useMutation<KakaoLoginResponse, unknown, KakaoLoginRequest>({
    mutationFn: kakaoLogin,
    onSuccess: async (response) => {
      // 기존 회원: accessToken + user 존재 → 로그인 완료
      if (!response.data.newUser && response.data.accessToken) {
        // kakaoLoginResponse에는 user 필드가 없으므로 프로필을 별도 조회
        await queryClient.invalidateQueries({ queryKey: authQueryKeys.me })
      }
    },
  })
}
