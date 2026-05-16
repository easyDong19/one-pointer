"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updateExpertProfile } from "@/entities/user/api/user.service"
import { userQueryKeys } from "@/entities/user/model/user.query-keys"
import { expertQueryKeys } from "@/entities/expert/model/expert.query-keys"
import { formSlotsToApi } from "../lib/time-slot-conversion"
import type { ExpertEditFormValues } from "./expert-edit-schema"

export function useUpdateExpertProfileMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (values: ExpertEditFormValues) => {
      return updateExpertProfile({
        introduction: values.introduction,
        detailIntroduction: values.detailIntroduction || undefined,
        careerPeriod: values.careerPeriod || undefined,
        activityMethod: values.activityMethod,
        bannerImageUrl: values.bannerImageUrl ?? undefined,
        subCategoryIds: values.subCategoryIds,
        availableTimes: formSlotsToApi(values.availableTimes),
        availableRegions: values.availableRegions,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.myExpertProfile })
      queryClient.invalidateQueries({ queryKey: expertQueryKeys.all })
    },
  })
}
