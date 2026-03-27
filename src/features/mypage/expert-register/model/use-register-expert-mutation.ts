"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { registerExpert } from "@/entities/user/api/user.service"
import { uploadImages, type ImageDomain } from "@/entities/media/api/media.service"
import { userQueryKeys } from "@/entities/user/model/user.query-keys"
import type { ExpertRegisterFormValues } from "./expert-register-schema"

export function useRegisterExpertMutation() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: async (input: ExpertRegisterFormValues) => {
      // 1. 포트폴리오 이미지 업로드
      const portfoliosWithUrls = await Promise.all(
        input.portfolios.map(async (p) => {
          const imageUrls =
            p.images.length > 0
              ? await uploadImages(p.images, "PORTFOLIO" as ImageDomain)
              : []
          return {
            type: p.type ?? "",
            description: p.description,
            imageUrls,
          }
        }),
      )

      // 2. 전문가 등록 API
      return registerExpert({
        introduction: input.introduction,
        detailIntroduction: input.detailIntroduction,
        careerPeriod: input.careerPeriod,
        activityMethod: input.activityMethod,
        subCategoryIds: input.subCategoryIds,
        certifications: input.certifications
          .filter((c) => c.name.trim().length > 0)
          .map((c) => ({ name: c.name, issuer: c.issuer ?? "" })),
        portfolios: portfoliosWithUrls.length > 0 ? portfoliosWithUrls : undefined,
        availableTimes:
          input.availableTimes.length > 0 ? input.availableTimes : undefined,
        availableRegions:
          input.availableRegions.length > 0 ? input.availableRegions : undefined,
        bankCode: input.bankCode || undefined,
        accountNumber: input.accountNumber || undefined,
        accountHolder: input.accountHolder || undefined,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.expertExists })
      queryClient.invalidateQueries({ queryKey: userQueryKeys.myExpertProfile })
      router.push("/mypage")
    },
  })
}
