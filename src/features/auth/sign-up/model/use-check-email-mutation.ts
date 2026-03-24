import { useMutation } from "@tanstack/react-query"
import { checkEmail, type CheckEmailResponse } from "@/entities/auth/api/auth.service"

export function useCheckEmailMutation() {
  return useMutation<CheckEmailResponse, unknown, string>({
    mutationFn: checkEmail,
  })
}
