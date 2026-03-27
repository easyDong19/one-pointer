"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updateCertification } from "@/entities/user/api/user.service"
import { userQueryKeys } from "@/entities/user/model/user.query-keys"
import type { AddCertificationRequest } from "@/entities/user/api/user.service"

type UpdateCertificationInput = {
  certificationId: number
} & AddCertificationRequest

export function useUpdateCertificationMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateCertificationInput) =>
      updateCertification(input.certificationId, {
        name: input.name,
        issuer: input.issuer,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.myExpertProfile })
    },
  })
}
