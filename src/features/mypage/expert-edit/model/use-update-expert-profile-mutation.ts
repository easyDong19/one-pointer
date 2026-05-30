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
        // 배너 제거 시 null 이 들어오는데, 백엔드는 null 을 "변경 없음"으로 무시하므로
        // 빈 문자열을 보내 실제로 비운다. (URL 이 있으면 그대로 전송)
        bannerImageUrl: values.bannerImageUrl ?? "",
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
