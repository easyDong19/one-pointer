"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updateBankAccount } from "@/entities/user/api/user.service"
import { userQueryKeys } from "@/entities/user/model/user.query-keys"
import type { UpdateBankAccountRequest } from "@/entities/user/api/user.service"

export function useUpdateBankAccountMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateBankAccountRequest) => updateBankAccount(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.myExpertProfile })
    },
  })
}
