"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ImagePlus, Loader2, X } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Card, CardContent } from "@/shared/ui/card"
import { Text } from "@/shared/ui/text"
import { cn } from "@/shared/lib/utils"
import { uploadImage } from "@/entities/media/api/media.service"
import { useMyExpertProfileQuery } from "@/features/mypage/expert-profile"
import { useCategoryListQuery } from "@/features/category/browse/model/use-category-list-query"
import {
  expertEditFormSchema,
  useUpdateExpertProfileMutation,
  apiSlotsToForm,
  deriveSubCategoryIds,
  type ExpertEditFormValues,
} from "@/features/mypage/expert-edit"
import { CategorySelector } from "@/app/(main)/mypage/expert-register/_components/category-selector"
import { TimeSlotGrid } from "@/app/(main)/mypage/expert-register/_components/time-slot-grid"
import { RegionMultiSelect } from "./region-multi-select"

const ACTIVITY_OPTIONS = [
  { value: "OFFLINE" as const, label: "오프라인" },
  { value: "ONLINE" as const, label: "온라인" },
  { value: "BOTH" as const, label: "온/오프라인" },
]

export function ExpertProfileEditForm() {
  const { data: profile, isLoading: profileLoading } = useMyExpertProfileQuery()
  const { data: categories = [], isLoading: categoriesLoading } = useCategoryListQuery()
  const updateMutation = useUpdateExpertProfileMutation()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)
  const [isUploadingBanner, setIsUploadingBanner] = useState(false)

  const form = useForm<ExpertEditFormValues>({
    resolver: zodResolver(expertEditFormSchema as never),
    defaultValues: {
      bannerImageUrl: null,
      introduction: "",
      detailIntroduction: "",
      careerPeriod: "",
      activityMethod: "ONLINE",
      subCategoryIds: [],
      availableTimes: [],
      availableRegions: [],
    },
  })

  const {
    register,
    watch,
    setValue,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = form

  // 프로필 + 카테고리 로드되면 폼 초기화
  const initialized = useRef(false)
  useEffect(() => {
    if (initialized.current) return
    if (!profile || categories.length === 0) return
    initialized.current = true

    reset({
      bannerImageUrl: profile.bannerImageUrl ?? null,
      introduction: profile.introduction ?? "",
      detailIntroduction: profile.detailIntroduction ?? "",
      careerPeriod: profile.careerPeriod ?? "",
      activityMethod: profile.activityMethod ?? "ONLINE",
      subCategoryIds: deriveSubCategoryIds(profile, categories),
      availableTimes: apiSlotsToForm(profile.availableTimes ?? []),
      availableRegions: profile.availableRegions ?? [],
    })
  }, [profile, categories, reset])

  // 배너 파일 → blob preview
  useEffect(() => {
    if (!bannerFile) {
      setBannerPreview(null)
      return
    }
    const url = URL.createObjectURL(bannerFile)
    setBannerPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [bannerFile])

  const introduction = watch("introduction") ?? ""
  const activityMethod = watch("activityMethod")
  const subCategoryIds = watch("subCategoryIds") ?? []
  const availableTimes = watch("availableTimes") ?? []
  const availableRegions = watch("availableRegions") ?? []
  const bannerImageUrl = watch("bannerImageUrl")

  const displayBanner = bannerPreview ?? bannerImageUrl

  const handleBannerSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setBannerFile(file)
    e.target.value = ""
  }

  const handleBannerRemove = () => {
    setBannerFile(null)
    setValue("bannerImageUrl", null)
  }

  const onSubmit = handleSubmit(async (values) => {
    try {
      let finalBannerUrl = values.bannerImageUrl
      if (bannerFile) {
        setIsUploadingBanner(true)
        finalBannerUrl = await uploadImage(bannerFile, "EXPERT_BANNER")
        setIsUploadingBanner(false)
      }

      await updateMutation.mutateAsync({
        ...values,
        bannerImageUrl: finalBannerUrl,
      })

      setBannerFile(null)
      toast.success("프로필이 수정되었습니다")
    } catch (error) {
      setIsUploadingBanner(false)
      toast.error(
        error instanceof Error ? error.message : "프로필 수정에 실패했습니다",
      )
    }
  })

  if (profileLoading || categoriesLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="text-muted-foreground size-6 animate-spin" />
      </div>
    )
  }

  if (!profile) {
    return (
      <Text typography="body2-medium" className="text-muted-foreground py-10 text-center">
        프로필을 불러올 수 없어요
      </Text>
    )
  }

  const isPending = isSubmitting || isUploadingBanner || updateMutation.isPending

  return (
    <Card>
      <CardContent>
        <form onSubmit={onSubmit} className="flex flex-col gap-6">
          {/* 배너 이미지 */}
          <div className="flex flex-col gap-2">
            <Text as="label" typography="body3-medium">
              배너 이미지
            </Text>
            {displayBanner ? (
              <div className="relative h-40 w-full overflow-hidden rounded-md border">
                <Image
                  src={displayBanner}
                  alt="배너 미리보기"
                  fill
                  className="object-cover"
                  unoptimized
                />
                <button
                  type="button"
                  onClick={handleBannerRemove}
                  aria-label="배너 제거"
                  className="bg-background/80 absolute right-2 top-2 rounded-full p-1 backdrop-blur-sm hover:bg-background"
                >
                  <X className="size-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="border-input bg-muted/30 hover:bg-muted/50 flex h-40 w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed transition-colors"
              >
                <ImagePlus className="text-muted-foreground size-6" />
                <Text typography="caption1-medium" className="text-muted-foreground">
                  배너 이미지 추가
                </Text>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleBannerSelect}
            />
            {displayBanner && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-primary self-start text-xs font-medium hover:underline"
              >
                다른 이미지로 교체
              </button>
            )}
          </div>

          {/* 한줄 소개 */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Text as="label" typography="body3-medium">
                한줄 소개 <span className="text-destructive">*</span>
              </Text>
              <Text typography="caption2-medium" className="text-muted-foreground">
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
              <Text typography="caption2-medium" className="text-destructive">
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

          {/* 경력 */}
          <div className="flex flex-col gap-1.5">
            <Text as="label" typography="body3-medium">
              경력
            </Text>
            <Input
              {...register("careerPeriod")}
              placeholder="예: 5년"
            />
          </div>

          {/* 활동 방식 */}
          <div className="flex flex-col gap-2">
            <Text as="label" typography="body3-medium">
              활동 방식 <span className="text-destructive">*</span>
            </Text>
            <div className="grid grid-cols-3 gap-2">
              {ACTIVITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setValue("activityMethod", opt.value, { shouldValidate: true })}
                  className={cn(
                    "h-10 rounded-md border text-sm transition-colors",
                    activityMethod === opt.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-input text-muted-foreground hover:bg-muted/40",
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 카테고리 */}
          <CategorySelector
            selectedIds={subCategoryIds}
            onChange={(ids) =>
              setValue("subCategoryIds", ids, { shouldValidate: true })
            }
            error={errors.subCategoryIds?.message}
          />

          {/* 활동 시간대 */}
          <div className="flex flex-col gap-2">
            <Text as="label" typography="body3-medium">
              활동 가능 시간대
            </Text>
            <TimeSlotGrid
              selectedSlots={availableTimes}
              onChange={(slots) =>
                setValue("availableTimes", slots, { shouldValidate: true })
              }
            />
            {errors.availableTimes && (
              <Text typography="caption2-medium" className="text-destructive">
                {errors.availableTimes.message}
              </Text>
            )}
          </div>

          {/* 활동 지역 */}
          <div className="flex flex-col gap-2">
            <Text as="label" typography="body3-medium">
              활동 지역
            </Text>
            <RegionMultiSelect
              selected={availableRegions}
              onChange={(regions) =>
                setValue("availableRegions", regions, { shouldValidate: true })
              }
            />
            {errors.availableRegions && (
              <Text typography="caption2-medium" className="text-destructive">
                {errors.availableRegions.message}
              </Text>
            )}
          </div>

          {/* 제출 */}
          <Button
            type="submit"
            className="mt-2"
            disabled={isPending}
          >
            <Text as="span" typography="body3-medium">
              {isPending ? "저장 중..." : "저장하기"}
            </Text>
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
