"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { deleteCertification } from "@/entities/user/api/user.service"
import { userQueryKeys } from "@/entities/user/model/user.query-keys"

export function useDeleteCertificationMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (certificationId: number) => deleteCertification(certificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.myExpertProfile })
    },
  })
}
