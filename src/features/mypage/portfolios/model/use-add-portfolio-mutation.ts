"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { addPortfolio } from "@/entities/user/api/user.service"
import { uploadImages } from "@/entities/media/api/media.service"
import { userQueryKeys } from "@/entities/user/model/user.query-keys"

type AddPortfolioInput = {
  type?: string
  description: string
  existingImageUrls: string[]
  newImages: File[]
}

export function useAddPortfolioMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: AddPortfolioInput) => {
      const newImageUrls =
        input.newImages.length > 0
          ? await uploadImages(input.newImages, "PORTFOLIO")
          : []

      return addPortfolio({
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
