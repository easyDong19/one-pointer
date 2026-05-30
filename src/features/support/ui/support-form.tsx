"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { ImagePlus, Lightbulb, X } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod/v4"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Text } from "@/shared/ui/text"
import { openAlert } from "@/shared/lib/open-alert"
import { useCreateInquiryMutation } from "../model/use-create-inquiry-mutation"

/**
 * 고객센터 문의 폼.
 * 명세: docs/domain/inquiry/INQUIRY_FORM.md
 */

const supportFormSchema = z.object({
  contactEmail: z.string().email("유효한 이메일 형식이 아닙니다."),
  content: z.string().min(1, "문의 내용을 입력해주세요."),
})

type SupportFormValues = z.infer<typeof supportFormSchema>

const MAX_IMAGES = 3

type PendingImage = {
  file: File
  previewUrl: string
}

export function SupportForm() {
  const router = useRouter()
  const mutation = useCreateInquiryMutation()
  const [images, setImages] = useState<PendingImage[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  // 언마운트 시 잔여 blob URL revoke (memory leak 방지)
  const imagesRef = useRef<PendingImage[]>(images)
  useEffect(() => {
    imagesRef.current = images
  }, [images])
  useEffect(() => {
    return () => {
      imagesRef.current.forEach((img) => URL.revokeObjectURL(img.previewUrl))
    }
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SupportFormValues>({
    resolver: zodResolver(supportFormSchema as never),
    mode: "onBlur",
    defaultValues: { contactEmail: "", content: "" },
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    const remaining = MAX_IMAGES - images.length
    const additions: PendingImage[] = files.slice(0, remaining).map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }))
    setImages((prev) => [...prev, ...additions])
    if (inputRef.current) inputRef.current.value = ""
  }

  const handleRemoveImage = (index: number) => {
    setImages((prev) => {
      const target = prev[index]
      if (target) URL.revokeObjectURL(target.previewUrl)
      return prev.filter((_, i) => i !== index)
    })
  }

  const onSubmit = handleSubmit(async (values) => {
    try {
      await mutation.mutateAsync({
        contactEmail: values.contactEmail,
        content: values.content,
        images: images.map((img) => img.file),
      })

      await openAlert({
        variant: "success",
        title: "문의가 접수되었어요",
        description:
          "영업일 기준 1~2일 내로 입력하신 이메일로 답변을 보내드립니다.",
      })
      router.push("/")
    } catch (error) {
      openAlert({
        variant: "warning",
        title: "문의 등록에 실패했습니다.",
        description:
          error instanceof Error ? error.message : "다시 시도해주세요.",
      })
    }
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Text as="h1" typography="h2-bold">
          무엇을 도와드릴까요?
        </Text>
        <Text
          as="p"
          typography="body3-regular"
          className="text-muted-foreground mt-1 leading-[1.6]"
        >
          문의 내용을 작성해주시면 입력하신 이메일로 답변을 보내드립니다.
        </Text>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        {/* 이메일 */}
        <div className="flex flex-col gap-1.5">
          <Text as="label" typography="body3-medium" htmlFor="contactEmail">
            답변 받을 이메일 <span className="text-destructive">*</span>
          </Text>
          <Input
            id="contactEmail"
            type="email"
            autoComplete="email"
            placeholder="example@email.com"
            aria-describedby={
              errors.contactEmail ? "contactEmail-error" : undefined
            }
            {...register("contactEmail")}
          />
          {errors.contactEmail && (
            <Text
              id="contactEmail-error"
              as="p"
              typography="caption2-medium"
              className="text-destructive"
            >
              {errors.contactEmail.message}
            </Text>
          )}
        </div>

        {/* 본문 */}
        <div className="flex flex-col gap-1.5">
          <Text as="label" typography="body3-medium" htmlFor="content">
            문의 내용 <span className="text-destructive">*</span>
          </Text>
          <textarea
            id="content"
            rows={6}
            placeholder="문의하실 내용을 자세히 입력해주세요."
            aria-describedby={errors.content ? "content-error" : undefined}
            className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:ring-[3px]"
            {...register("content")}
          />
          {errors.content && (
            <Text
              id="content-error"
              as="p"
              typography="caption2-medium"
              className="text-destructive"
            >
              {errors.content.message}
            </Text>
          )}
        </div>

        {/* 이미지 첨부 */}
        <div className="flex flex-col gap-1.5">
          <Text
            as="span"
            typography="body3-medium"
            className="text-muted-foreground"
          >
            첨부 이미지 (선택, 최대 {MAX_IMAGES}장)
          </Text>
          <div className="flex flex-wrap gap-2">
            {images.map((image, index) => (
              <div
                key={image.previewUrl}
                className="border-border group relative size-20 overflow-hidden rounded-md border"
              >
                <img
                  src={image.previewUrl}
                  alt={image.file.name}
                  className="size-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  aria-label="이미지 제거"
                  className="absolute top-1 right-1 rounded-full bg-black/60 p-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}
            {images.length < MAX_IMAGES && (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                aria-label={`이미지 첨부 (${images.length}/${MAX_IMAGES})`}
                className="border-border text-muted-foreground hover:border-primary hover:text-primary flex size-20 flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed transition-colors"
              >
                <ImagePlus className="size-5" />
                <span className="text-[10px]">
                  {images.length}/{MAX_IMAGES}
                </span>
              </button>
            )}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpg,image/jpeg,image/png"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* 안내 박스 — 모바일과 동일한 톤 */}
        <div className="bg-muted flex gap-2 rounded-xl p-4">
          <Lightbulb className="text-muted-foreground mt-0.5 size-4 shrink-0" />
          <Text
            as="p"
            typography="caption1-medium"
            className="text-muted-foreground leading-[1.6]"
          >
            쪽집게를 사용하면서 불편했던 점, 개선했으면 좋을 점, 있었으면 하는
            기능 등을 작성해주셔도 좋습니다! 사용자분들의 소중한 피드백을
            반영해서 더 나은 쪽집게가 될 수 있도록 노력하겠습니다.
          </Text>
        </div>

        {/* 제출 버튼 */}
        <Button type="submit" className="w-full" disabled={mutation.isPending}>
          <Text as="span" typography="body3-medium">
            {mutation.isPending ? "제출 중..." : "문의 제출"}
          </Text>
        </Button>
      </form>
    </div>
  )
}
