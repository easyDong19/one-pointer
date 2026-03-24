import { useMutation } from "@tanstack/react-query"
import { checkNickname, type CheckNicknameResponse } from "@/entities/auth/api/auth.service"

export function useCheckNicknameMutation() {
  return useMutation<CheckNicknameResponse, unknown, string>({
    mutationFn: checkNickname,
  })
}
