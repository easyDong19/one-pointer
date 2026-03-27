"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updatePortfolio } from "@/entities/user/api/user.service"
import { uploadImages } from "@/entities/media/api/media.service"
import { userQueryKeys } from "@/entities/user/model/user.query-keys"

type UpdatePortfolioInput = {
  portfolioId: number
  type?: string
  description: string
  existingImageUrls: string[]
  newImages: File[]
}

export function useUpdatePortfolioMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: UpdatePortfolioInput) => {
      const newImageUrls =
        input.newImages.length > 0
          ? await uploadImages(input.newImages, "PORTFOLIO")
          : []

      return updatePortfolio(input.portfolioId, {
        type: input.type ?? "",
        description: input.description,
        imageUrls: [...input.existingImageUrls, ...newImageUrls],
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.myExpertProfile })
    },
  })
}
