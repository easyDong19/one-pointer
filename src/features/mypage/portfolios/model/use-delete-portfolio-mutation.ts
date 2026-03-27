"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { deletePortfolio } from "@/entities/user/api/user.service"
import { userQueryKeys } from "@/entities/user/model/user.query-keys"

export function useDeletePortfolioMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (portfolioId: number) => deletePortfolio(portfolioId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.myExpertProfile })
    },
  })
}
