"use client"

import { useEffect, useRef, useState } from "react"
import { ImagePlus, X } from "lucide-react"
import { Input } from "@/shared/ui/input"
import { Button } from "@/shared/ui/button"
import { Text } from "@/shared/ui/text"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/ui/dialog"
import { cn } from "@/shared/lib/utils"
import type { z } from "zod/v4"
import type { expertPortfolioSchema } from "@/entities/expert/api/expert.schema"

type Portfolio = z.infer<typeof expertPortfolioSchema>

export type PortfolioFormData = {
  type?: string
  description: string
  existingImageUrls: string[]
  newImages: File[]
}

type PortfolioFormDialogProps = {
  isOpen: boolean
  portfolio?: Portfolio
  onSubmit: (data: PortfolioFormData) => void
  onClose: () => void
}

type PendingImage = {
  file: File
  previewUrl: string
}

const MAX_IMAGES = 7

/**
 * 포트폴리오 추가/편집 다이얼로그.
 * 직접 마운트하지 말고 `@/features/mypage/portfolios` 의 `openPortfolioForm()` 으로 호출한다.
 */
export function PortfolioFormDialog({
  isOpen,
  portfolio,
  onSubmit,
  onClose,
}: PortfolioFormDialogProps) {
  const [type, setType] = useState(portfolio?.type ?? "")
  const [description, setDescription] = useState(portfolio?.description ?? "")
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>(
    portfolio?.imageUrls ?? [],
  )
  const [newImages, setNewImages] = useState<PendingImage[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  // 언마운트 시 남아있는 blob URL 모두 revoke (메모리 누수 방지).
  // newImages 의 변경에 따라 ref 갱신해 cleanup 시 최신값 참조.
  const newImagesRef = useRef<PendingImage[]>(newImages)
  useEffect(() => {
    newImagesRef.current = newImages
  }, [newImages])
  useEffect(() => {
    return () => {
      newImagesRef.current.forEach((img) => URL.revokeObjectURL(img.previewUrl))
    }
  }, [])

  const totalImages = existingImageUrls.length + newImages.length

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    const remaining = MAX_IMAGES - totalImages
    const additions: PendingImage[] = files.slice(0, remaining).map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }))
    setNewImages((prev) => [...prev, ...additions])
    if (inputRef.current) inputRef.current.value = ""
  }

  const handleRemoveExisting = (index: number) => {
    setExistingImageUrls((prev) => prev.filter((_, i) => i !== index))
  }

  const handleRemoveNew = (index: number) => {
    setNewImages((prev) => {
      const target = prev[index]
      if (target) URL.revokeObjectURL(target.previewUrl)
      return prev.filter((_, i) => i !== index)
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim()) return
    onSubmit({
      type: type || undefined,
      description,
      existingImageUrls,
      newImages: newImages.map((img) => img.file),
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {portfolio ? "포트폴리오 편집" : "포트폴리오 추가"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Text as="label" typography="caption2-medium">유형</Text>
            <Input
              value={type}
              onChange={(e) => setType(e.target.value)}
              placeholder="예: 서비스 후기, 작업물"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Text as="label" typography="caption2-medium">
              설명 <span className="text-destructive">*</span>
            </Text>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="포트폴리오에 대해 설명해주세요"
              className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:ring-[3px]"
            />
          </div>

          {/* 이미지 */}
          <div className="flex flex-col gap-1.5">
            <Text as="span" typography="caption2-medium" className="text-muted-foreground">
              이미지 ({totalImages}/{MAX_IMAGES})
            </Text>
            <div className="flex flex-wrap gap-2">
              {existingImageUrls.map((url, index) => (
                <div key={url} className="group relative size-20 overflow-hidden rounded-md border">
                  <img src={url} alt="" className="size-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveExisting(index)}
                    className="absolute top-0.5 right-0.5 rounded-full bg-black/60 p-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}

              {newImages.map((image, index) => (
                <div key={image.previewUrl} className="group relative size-20 overflow-hidden rounded-md border">
                  <img
                    src={image.previewUrl}
                    alt={image.file.name}
                    className="size-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveNew(index)}
                    className="absolute top-0.5 right-0.5 rounded-full bg-black/60 p-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}

              {totalImages < MAX_IMAGES && (
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className={cn(
                    "flex size-20 flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed transition-colors",
                    "border-border text-muted-foreground hover:border-primary hover:text-primary",
                  )}
                >
                  <ImagePlus className="size-5" />
                  <span className="text-[10px]">추가</span>
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button type="submit" disabled={!description.trim()}>
              저장
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
