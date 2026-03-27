import { z } from "zod/v4"

export const expertRegisterFormSchema = z
  .object({
    // Step 1: 기본 정보
    introduction: z
      .string()
      .min(1, "소개글을 입력해주세요.")
      .max(100, "소개글은 100자 이내로 입력해주세요."),
    detailIntroduction: z.string().optional(),
    careerPeriod: z.string().optional(),
    activityMethod: z.enum(["OFFLINE", "ONLINE", "BOTH"]),
    subCategoryIds: z
      .array(z.number())
      .min(1, "카테고리를 1개 이상 선택해주세요.")
      .max(3, "카테고리는 최대 3개까지 선택할 수 있습니다."),

    // Step 2: 자격증 (선택)
    certifications: z
      .array(
        z.object({
          name: z.string().min(1, "자격증명을 입력해주세요."),
          issuer: z.string().optional(),
        }),
      )
      .default([]),

    // Step 3: 포트폴리오 (선택)
    portfolios: z
      .array(
        z.object({
          type: z.string().optional(),
          description: z.string().min(1, "설명을 입력해주세요."),
          images: z.array(z.instanceof(File)).max(7, "이미지는 최대 7장까지 가능합니다."),
        }),
      )
      .default([]),

    // Step 4: 활동 정보
    availableTimes: z
      .array(z.object({ dayOfWeek: z.string(), timeSlot: z.string() }))
      .default([]),
    availableRegions: z.array(z.string()).default([]),

    // Step 5: 정산계좌 (선택)
    bankCode: z.string().optional(),
    accountNumber: z.string().optional(),
    accountHolder: z.string().optional(),
  })
  .refine(
    (data) => {
      const hasAny = data.bankCode || data.accountNumber || data.accountHolder
      if (!hasAny) return true
      return !!(data.bankCode && data.accountNumber && data.accountHolder)
    },
    {
      message: "정산계좌 정보를 모두 입력해주세요.",
      path: ["bankCode"],
    },
  )

export type ExpertRegisterFormValues = z.infer<typeof expertRegisterFormSchema>

/** 각 단계에서 검증할 필드 목록 */
export const STEP_FIELDS: Record<number, (keyof ExpertRegisterFormValues)[]> = {
  1: ["introduction", "activityMethod", "subCategoryIds"],
  2: ["certifications"],
  3: ["portfolios"],
  4: ["availableTimes", "availableRegions"],
  5: ["bankCode", "accountNumber", "accountHolder"],
}

export const STEP_LABELS = ["기본 정보", "자격증", "포트폴리오", "활동 정보", "정산계좌"]
