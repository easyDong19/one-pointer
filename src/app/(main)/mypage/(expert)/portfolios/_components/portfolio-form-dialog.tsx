"use client"

import { useState, useRef } from "react"
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
import type { portfolioSchema } from "@/entities/user/api/user.schema"

type Portfolio = z.infer<typeof portfolioSchema>

type PortfolioFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  portfolio?: Portfolio
  onSubmit: (data: {
    type?: string
    description: string
    existingImageUrls: string[]
    newImages: File[]
  }) => void
  isPending: boolean
}

const MAX_IMAGES = 7

export function PortfolioFormDialog({
  open,
  onOpenChange,
  portfolio,
  onSubmit,
  isPending,
}: PortfolioFormDialogProps) {
  const [type, setType] = useState(portfolio?.type ?? "")
  const [description, setDescription] = useState(portfolio?.description ?? "")
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>(
    portfolio?.imageUrls ?? [],
  )
  const [newImages, setNewImages] = useState<File[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const totalImages = existingImageUrls.length + newImages.length

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    const remaining = MAX_IMAGES - totalImages
    setNewImages((prev) => [...prev, ...files.slice(0, remaining)])
    if (inputRef.current) inputRef.current.value = ""
  }

  const handleRemoveExisting = (index: number) => {
    setExistingImageUrls((prev) => prev.filter((_, i) => i !== index))
  }

  const handleRemoveNew = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim()) return
    onSubmit({
      type: type || undefined,
      description,
      existingImageUrls,
      newImages,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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

              {newImages.map((file, index) => (
                <div key={`new-${index}`} className="group relative size-20 overflow-hidden rounded-md border">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
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
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              취소
            </Button>
            <Button type="submit" disabled={isPending || !description.trim()}>
              {isPending ? "저장 중..." : "저장"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
