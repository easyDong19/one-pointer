import { z } from "zod/v4"

export const expertEditFormSchema = z
  .object({
    bannerImageUrl: z.string().nullable(),
    introduction: z
      .string()
      .min(1, "한줄 소개를 입력해주세요.")
      .max(100, "한줄 소개는 100자 이내로 입력해주세요."),
    detailIntroduction: z.string().optional(),
    careerPeriod: z.string().optional(),
    activityMethod: z.enum(["OFFLINE", "ONLINE", "BOTH"]),
    subCategoryIds: z
      .array(z.number())
      .min(1, "카테고리를 1개 이상 선택해주세요.")
      .max(3, "카테고리는 최대 3개까지 선택할 수 있습니다."),
    // 활동 시간대·지역은 선택 (모바일 앱 / 전문가 등록과 동일하게 강제하지 않음)
    availableTimes: z
      .array(z.object({ dayOfWeek: z.string(), timeSlot: z.string() }))
      .default([]),
    availableRegions: z.array(z.string()).default([]),
  })

export type ExpertEditFormValues = z.infer<typeof expertEditFormSchema>
