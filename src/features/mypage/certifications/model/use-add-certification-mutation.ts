"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { addCertification } from "@/entities/user/api/user.service"
import { userQueryKeys } from "@/entities/user/model/user.query-keys"
import type { AddCertificationRequest } from "@/entities/user/api/user.service"

export function useAddCertificationMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: AddCertificationRequest) => addCertification(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.myExpertProfile })
    },
  })
}
