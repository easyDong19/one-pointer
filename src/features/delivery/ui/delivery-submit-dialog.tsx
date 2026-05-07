"use client"

import { useRef, useState } from "react"
import { FileUp, ImagePlus, Loader2, X } from "lucide-react"
import { useParams } from "next/navigation"
import { toast } from "sonner"

import type { SubmitDeliveryRequest } from "@/entities/delivery/api/delivery.schema"

type DeliveryType = SubmitDeliveryRequest["deliveryType"]
import { uploadImages, uploadPdfs } from "@/entities/media/api/media.service"
import { Button } from "@/shared/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog"
import { Text } from "@/shared/ui/text"
import { cn } from "@/shared/lib/utils"

import { useDeliveryByTicketQuery } from "../model/use-delivery-by-ticket-query"
import { useResubmitDeliveryMutation } from "../model/use-resubmit-delivery-mutation"
import { useSubmitDeliveryMutation } from "../model/use-submit-delivery-mutation"

type Props = {
  isOpen: boolean
  ticketId: number
  mode: "submit" | "resubmit"
  deliveryId?: number
  onClose: () => void
}

type PendingFile = { file: File; preview?: string }

const MAX_IMAGES = 10
const MAX_FILES = 10

const DELIVERY_TYPE_OPTIONS: { value: DeliveryType; label: string }[] = [
  { value: "SERVICE_COMPLETE", label: "용역 완료" },
  { value: "FILE_DELIVERY", label: "파일 납품" },
]

export function DeliverySubmitDialog({
  isOpen,
  ticketId,
  mode,
  deliveryId,
  onClose,
}: Props) {
  const params = useParams<{ roomId: string }>()
  const roomId = params.roomId

  const existingQuery = useDeliveryByTicketQuery(
    mode === "resubmit" ? ticketId : null,
  )
  const submitMutation = useSubmitDeliveryMutation(roomId)
  const resubmitMutation = useResubmitDeliveryMutation(roomId)

  const [deliveryType, setDeliveryType] = useState<DeliveryType>("SERVICE_COMPLETE")
  const [memo, setMemo] = useState("")
  const [images, setImages] = useState<PendingFile[]>([])
  const [files, setFiles] = useState<PendingFile[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const imageInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const existingDelivery = existingQuery.data
  const effectiveType =
    mode === "resubmit" && existingDelivery
      ? existingDelivery.deliveryType
      : deliveryType

  const isSubmitting =
    submitMutation.isPending || resubmitMutation.isPending || isUploading

  const needsAttachment = effectiveType === "FILE_DELIVERY"
  const hasAttachments = images.length > 0 || files.length > 0
  const canSubmit =
    memo.trim().length > 0 &&
    (!needsAttachment || hasAttachments) &&
    !isSubmitting

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? [])
    const remaining = MAX_IMAGES - images.length
    if (remaining <= 0) {
      toast.error(`이미지는 최대 ${MAX_IMAGES}장까지 첨부할 수 있어요`)
      return
    }
    const toAdd = picked.slice(0, remaining)
    setImages((prev) => [
      ...prev,
      ...toAdd.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      })),
    ])
    e.target.value = ""
  }

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? [])
    const remaining = MAX_FILES - files.length
    if (remaining <= 0) {
      toast.error(`파일은 최대 ${MAX_FILES}개까지 첨부할 수 있어요`)
      return
    }
    const toAdd = picked.slice(0, remaining)
    setFiles((prev) => [...prev, ...toAdd.map((file) => ({ file }))])
    e.target.value = ""
  }

  const removeImage = (index: number) => {
    setImages((prev) => {
      const removed = prev[index]
      if (removed?.preview) URL.revokeObjectURL(removed.preview)
      return prev.filter((_, i) => i !== index)
    })
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return

    try {
      setIsUploading(true)

      const [imageUrls, pdfUrls] = await Promise.all([
        images.length > 0
          ? uploadImages(
              images.map((i) => i.file),
              "DELIVERY",
            )
          : ([] as string[]),
        files.length > 0
          ? uploadPdfs(files.map((f) => f.file))
          : ([] as string[]),
      ])

      const attachments = [
        ...imageUrls.map((url, i) => ({
          fileType: "IMAGE" as const,
          fileUrl: url,
          originalFileName: images[i].file.name,
          fileSize: images[i].file.size,
        })),
        ...pdfUrls.map((url, i) => ({
          fileType: "FILE" as const,
          fileUrl: url,
          originalFileName: files[i].file.name,
          fileSize: files[i].file.size,
        })),
      ]

      setIsUploading(false)

      if (mode === "resubmit" && deliveryId != null) {
        await resubmitMutation.mutateAsync({
          deliveryId,
          input: {
            memo: memo.trim(),
            attachments: attachments.length > 0 ? attachments : undefined,
          },
        })
      } else {
        await submitMutation.mutateAsync({
          ticketId,
          deliveryType: effectiveType,
          memo: memo.trim(),
          attachments: attachments.length > 0 ? attachments : undefined,
        })
      }

      onClose()
    } catch {
      setIsUploading(false)
    }
  }

  const isLoadingExisting = mode === "resubmit" && existingQuery.isLoading

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl md:p-8">
        <DialogHeader>
          <DialogTitle>
            {mode === "resubmit" ? "수정본 제출" : "작업물 제출"}
          </DialogTitle>
        </DialogHeader>

        {isLoadingExisting ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="text-primary h-8 w-8 animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {mode === "resubmit" && existingDelivery?.revisionMessage && (
              <div className="bg-muted rounded-lg p-3">
                <Text typography="caption2-medium" className="text-muted-foreground mb-1">
                  수정 요청 사유
                </Text>
                <Text typography="caption1-medium" className="text-foreground">
                  {existingDelivery.revisionMessage}
                </Text>
              </div>
            )}

            {mode === "submit" ? (
              <Field label="납품 유형" required>
                <div className="flex gap-2">
                  {DELIVERY_TYPE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setDeliveryType(opt.value)}
                      className={cn(
                        "flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors",
                        deliveryType === opt.value
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border text-muted-foreground hover:bg-accent",
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </Field>
            ) : (
              <Field label="납품 유형">
                <Text typography="body2-medium" className="text-foreground">
                  {effectiveType === "SERVICE_COMPLETE" ? "용역 완료" : "파일 납품"}
                </Text>
              </Field>
            )}

            <Field label="메모" required>
              <textarea
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                rows={4}
                placeholder="작업 내용이나 전달 사항을 적어주세요"
                className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:ring-[3px]"
              />
            </Field>

            <Field label={`이미지 (${images.length}/${MAX_IMAGES})`}>
              <div className="flex flex-wrap gap-2">
                {images.map((img, i) => (
                  <div key={i} className="group relative h-20 w-20 overflow-hidden rounded-lg border">
                    <img
                      src={img.preview}
                      alt={img.file.name}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-0.5 right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {images.length < MAX_IMAGES && (
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className="border-border text-muted-foreground hover:bg-accent flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-lg border border-dashed transition-colors"
                  >
                    <ImagePlus className="h-5 w-5" />
                    <span className="text-[10px]">추가</span>
                  </button>
                )}
              </div>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImagePick}
              />
            </Field>

            <Field label={`파일 (${files.length}/${MAX_FILES})`}>
              <div className="flex flex-col gap-1.5">
                {files.map((f, i) => (
                  <div
                    key={i}
                    className="border-border flex items-center justify-between rounded-md border px-3 py-2"
                  >
                    <Text typography="caption1-medium" className="text-foreground truncate">
                      {f.file.name}
                    </Text>
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="text-muted-foreground hover:text-foreground ml-2 shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {files.length < MAX_FILES && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="border-border text-muted-foreground hover:bg-accent flex items-center justify-center gap-2 rounded-md border border-dashed px-3 py-2 transition-colors"
                  >
                    <FileUp className="h-4 w-4" />
                    <span className="text-sm">파일 추가</span>
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                multiple
                className="hidden"
                onChange={handleFilePick}
              />
            </Field>

            {needsAttachment && !hasAttachments && (
              <Text typography="caption2-medium" className="text-destructive">
                파일 납품은 이미지 또는 파일을 1개 이상 첨부해야 해요
              </Text>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                취소
              </Button>
              <Button type="submit" disabled={!canSubmit}>
                {isUploading
                  ? "업로드 중..."
                  : submitMutation.isPending || resubmitMutation.isPending
                    ? "제출 중..."
                    : mode === "resubmit"
                      ? "수정본 제출"
                      : "작업물 제출"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Text as="label" typography="caption2-medium">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Text>
      {children}
    </div>
  )
}
