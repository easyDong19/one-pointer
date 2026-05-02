"use client"

import { useFieldArray, type UseFormReturn } from "react-hook-form"
import { Plus, Trash2 } from "lucide-react"
import { Input } from "@/shared/ui/input"
import { Button } from "@/shared/ui/button"
import { Text } from "@/shared/ui/text"
import type { ExpertRegisterFormValues } from "@/features/mypage/expert-register"

type Step2Props = {
  form: UseFormReturn<ExpertRegisterFormValues>
}

export function Step2Certifications({ form }: Step2Props) {
  const {
    register,
    control,
    formState: { errors },
  } = form

  const { fields, append, remove } = useFieldArray({
    control,
    name: "certifications",
  })

  return (
    <div className="flex flex-col gap-5">
      <div>
        <Text as="p" typography="body3-medium">
          자격증 (선택)
        </Text>
        <Text as="p" typography="caption2-medium" className="mt-0.5 text-muted-foreground">
          보유한 자격증이 있다면 추가해주세요
        </Text>
      </div>

      {fields.map((field, index) => (
        <div key={field.id} className="flex flex-col gap-2 rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <Text as="span" typography="caption1-medium" className="text-muted-foreground">
              자격증 #{index + 1}
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
              자격증명 <span className="text-destructive">*</span>
            </Text>
            <Input
              {...register(`certifications.${index}.name`)}
              placeholder="예: 정보처리기사"
            />
            {errors.certifications?.[index]?.name && (
              <Text as="p" typography="caption2-medium" className="text-destructive">
                {errors.certifications[index].name.message}
              </Text>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Text as="label" typography="caption2-medium">
              발급기관
            </Text>
            <Input
              {...register(`certifications.${index}.issuer`)}
              placeholder="예: 한국산업인력공단"
            />
          </div>
        </div>
      ))}

      {fields.length < 5 ? (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => append({ name: "", issuer: "" })}
        >
          <Plus className="mr-1 size-4" />
          자격증 추가
        </Button>
      ) : (
        <Text
          as="p"
          typography="caption2-medium"
          className="text-muted-foreground border-border/60 rounded-xl border border-dashed py-3 text-center"
        >
          자격증은 최대 5개까지 등록할 수 있습니다
        </Text>
      )}
    </div>
  )
}
