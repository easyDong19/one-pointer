"use client"

import type { UseFormReturn } from "react-hook-form"
import { Input } from "@/shared/ui/input"
import { Text } from "@/shared/ui/text"
import { cn } from "@/shared/lib/utils"
import type { ExpertRegisterFormValues } from "@/features/mypage/expert-register"
import { CategorySelector } from "./category-selector"

type Step1Props = {
  form: UseFormReturn<ExpertRegisterFormValues>
}

const ACTIVITY_OPTIONS = [
  { value: "OFFLINE" as const, label: "오프라인" },
  { value: "ONLINE" as const, label: "온라인" },
  { value: "BOTH" as const, label: "온/오프라인" },
]

export function Step1BasicInfo({ form }: Step1Props) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = form

  const introduction = watch("introduction") ?? ""
  const activityMethod = watch("activityMethod")
  const subCategoryIds = watch("subCategoryIds") ?? []

  return (
    <div className="flex flex-col gap-5">
      {/* 소개글 */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <Text as="label" typography="body3-medium">
            한줄 소개 <span className="text-destructive">*</span>
          </Text>
          <Text as="span" typography="caption2-medium" className="text-muted-foreground">
            {introduction.length}/100
          </Text>
        </div>
        <textarea
          {...register("introduction")}
          maxLength={100}
          rows={2}
          placeholder="나를 소개하는 한줄을 입력해주세요"
          className={cn(
            "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:ring-[3px]",
            errors.introduction && "border-destructive",
          )}
        />
        {errors.introduction && (
          <Text as="p" typography="caption2-medium" className="text-destructive">
            {errors.introduction.message}
          </Text>
        )}
      </div>

      {/* 상세 소개 */}
      <div className="flex flex-col gap-1.5">
        <Text as="label" typography="body3-medium">
          상세 소개
        </Text>
        <textarea
          {...register("detailIntroduction")}
          rows={4}
          placeholder="전문 분야, 경험 등을 자세히 소개해주세요"
          className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:ring-[3px]"
        />
      </div>

      {/* 경력 기간 */}
      <div className="flex flex-col gap-1.5">
        <Text as="label" typography="body3-medium">
          경력
        </Text>
        <Input
          {...register("careerPeriod")}
          placeholder="예: 5년, 10년 이상"
        />
      </div>

      {/* 활동 방식 */}
      <div className="flex flex-col gap-1.5">
        <Text as="label" typography="body3-medium">
          활동 방식 <span className="text-destructive">*</span>
        </Text>
        <div className="flex gap-2">
          {ACTIVITY_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setValue("activityMethod", option.value, { shouldValidate: true })}
              className={cn(
                "flex-1 rounded-md border px-3 py-2 text-center text-sm font-medium transition-colors",
                activityMethod === option.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:bg-muted",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
        {errors.activityMethod && (
          <Text as="p" typography="caption2-medium" className="text-destructive">
            {errors.activityMethod.message}
          </Text>
        )}
      </div>

      {/* 카테고리 */}
      <CategorySelector
        selectedIds={subCategoryIds}
        onChange={(ids) => setValue("subCategoryIds", ids, { shouldValidate: true })}
        error={errors.subCategoryIds?.message}
      />
    </div>
  )
}
