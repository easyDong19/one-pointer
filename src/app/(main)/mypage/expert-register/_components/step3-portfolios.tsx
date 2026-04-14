"use client"

import { useFieldArray, type UseFormReturn } from "react-hook-form"
import { Plus, Trash2 } from "lucide-react"
import { Input } from "@/shared/ui/input"
import { Button } from "@/shared/ui/button"
import { Text } from "@/shared/ui/text"
import { cn } from "@/shared/lib/utils"
import type { ExpertRegisterFormValues } from "@/features/mypage/expert-register"
import { PortfolioImageUploader } from "./portfolio-image-uploader"

type Step3Props = {
  form: UseFormReturn<ExpertRegisterFormValues>
}

export function Step3Portfolios({ form }: Step3Props) {
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = form

  const { fields, append, remove } = useFieldArray({
    control,
    name: "portfolios",
  })

  return (
    <div className="flex flex-col gap-5">
      <div>
        <Text as="p" typography="body3-medium">
          포트폴리오 (선택)
        </Text>
        <Text as="p" typography="caption2-medium" className="mt-0.5 text-muted-foreground">
          작업물이나 서비스 사례를 추가해주세요 (최대 10개)
        </Text>
      </div>

      {fields.map((field, index) => (
        <div key={field.id} className="flex flex-col gap-3 rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <Text as="span" typography="caption1-medium" className="text-muted-foreground">
              포트폴리오 #{index + 1}
            </Text>
            <button
              type="button"
              onClick={() => remove(index)}
              className="rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="size-4" />
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            <Text as="label" typography="caption2-medium">
              유형
            </Text>
            <Input
              {...register(`portfolios.${index}.type`)}
              placeholder="예: 서비스 후기, 작업물"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Text as="label" typography="caption2-medium">
              설명 <span className="text-destructive">*</span>
            </Text>
            <textarea
              {...register(`portfolios.${index}.description`)}
              rows={3}
              placeholder="포트폴리오에 대해 설명해주세요"
              className={cn(
                "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:ring-[3px]",
                errors.portfolios?.[index]?.description && "border-destructive",
              )}
            />
            {errors.portfolios?.[index]?.description && (
              <Text as="p" typography="caption2-medium" className="text-destructive">
                {errors.portfolios[index].description.message}
              </Text>
            )}
          </div>

          <PortfolioImageUploader
            images={watch(`portfolios.${index}.images`) ?? []}
            onChange={(images) =>
              setValue(`portfolios.${index}.images`, images, { shouldValidate: true })
            }
          />
        </div>
      ))}

      {fields.length < 10 && (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => append({ type: "", description: "", images: [] })}
        >
          <Plus className="mr-1 size-4" />
          포트폴리오 추가
        </Button>
      )}
    </div>
  )
}
