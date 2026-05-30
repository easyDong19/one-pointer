"use client"

import { useEffect, useMemo, useRef } from "react"
import { ImagePlus, X } from "lucide-react"

import { Input } from "@/shared/ui/input"
import { Text } from "@/shared/ui/text"
import { cn } from "@/shared/lib/utils"

import { LEVEL_OPTIONS } from "../../lib/ticket-create.constants"
import {
  TICKET_CREATE_MAX_IMAGES,
  useTicketCreateForm,
} from "../../model/use-ticket-create-form"
import { StepCard } from "../step-card"

const TITLE_MAX = 80
const ACCEPT_TYPES = "image/jpeg,image/jpg,image/png,image/webp"

/**
 * Step 2 — 모바일 Step2ContentWidget 와 동일:
 * - 제목 (max 80, counter 우측 정렬)
 * - 상세 내용 (textarea 6 rows)
 * - 이미지 첨부 (max 3, local preview)
 * - 현재 실력 (3 chip 선택)
 */
export function StepContent() {
  const title = useTicketCreateForm((s) => s.title)
  const content = useTicketCreateForm((s) => s.content)
  const localImages = useTicketCreateForm((s) => s.localImages)
  const existingImageUrls = useTicketCreateForm((s) => s.existingImageUrls)
  const level = useTicketCreateForm((s) => s.level)
  const setField = useTicketCreateForm((s) => s.setField)
  const addLocalImage = useTicketCreateForm((s) => s.addLocalImage)
  const removeLocalImage = useTicketCreateForm((s) => s.removeLocalImage)
  const removeExistingImage = useTicketCreateForm((s) => s.removeExistingImage)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const totalImageCount = existingImageUrls.length + localImages.length
  const remainingSlots = TICKET_CREATE_MAX_IMAGES - totalImageCount

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    files.slice(0, Math.max(0, remainingSlots)).forEach(addLocalImage)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  return (
    <StepCard
      title="의뢰 내용을 작성하세요"
      subtitle="전문가가 제안서를 보내려면 구체적인 정보가 필요합니다."
    >
      <div className="flex flex-col gap-6">
        <Field label="제목" required>
          <Input
            value={title}
            onChange={(e) => setField("title", e.target.value.slice(0, TITLE_MAX))}
            placeholder="예) 쪽집게 같은 어플을 만들고 싶어요."
            className="h-11"
          />
          <div className="mt-1 text-right">
            <Text
              typography="caption2-medium"
              className="text-muted-foreground tabular-nums"
            >
              {title.length} / {TITLE_MAX}
            </Text>
          </div>
        </Field>

        <Field label="상세 내용" required>
          <textarea
            value={content}
            onChange={(e) => setField("content", e.target.value)}
            rows={6}
            placeholder={
              "어떤 것을 요청하고 싶은지 자세히 적어주세요.\n\n상세 내용을 기반으로 전문가가 제안서를 보내드려요."
            }
            className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-md border bg-background px-3 py-2.5 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:ring-[3px]"
          />
        </Field>

        <Field label="이미지 첨부">
          <Text typography="caption2-medium" className="text-muted-foreground -mt-1.5 mb-2">
            최대 {TICKET_CREATE_MAX_IMAGES}장까지 첨부할 수 있습니다.
          </Text>
          <div className="flex flex-wrap gap-2">
            {existingImageUrls.map((url) => (
              <ExistingImageTile
                key={url}
                url={url}
                onRemove={() => removeExistingImage(url)}
              />
            ))}
            {localImages.map((file, idx) => (
              <ImageTile key={idx} file={file} onRemove={() => removeLocalImage(idx)} />
            ))}
            {remainingSlots > 0 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="border-border bg-muted text-muted-foreground hover:border-primary hover:text-primary flex size-20 flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed transition-colors"
              >
                <ImagePlus className="size-5" />
                <Text typography="caption2-medium" className="tabular-nums">
                  {totalImageCount}/{TICKET_CREATE_MAX_IMAGES}
                </Text>
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPT_TYPES}
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
        </Field>

        <Field label="현재 실력">
          <div className="flex flex-wrap gap-2">
            {LEVEL_OPTIONS.map((opt) => {
              const selected = level === opt.value
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setField("level", opt.value)}
                  className={cn(
                    "rounded-full border-2 px-4 py-2 transition-colors",
                    selected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:border-primary/40",
                  )}
                >
                  <Text typography="caption1-medium">{opt.label}</Text>
                </button>
              )
            })}
          </div>
        </Field>
      </div>
    </StepCard>
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
    <div className="flex flex-col gap-2">
      <Text as="label" typography="body3-bold" className="flex items-baseline gap-0.5">
        {label}
        {required && <span className="text-destructive">*</span>}
      </Text>
      {children}
    </div>
  )
}

function ExistingImageTile({ url, onRemove }: { url: string; onRemove: () => void }) {
  return (
    <div className="border-border relative size-20 overflow-hidden rounded-md border">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt="" className="size-full object-cover" />
      <button
        type="button"
        onClick={onRemove}
        aria-label="삭제"
        className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-black/70 text-white transition-opacity hover:bg-black/85"
      >
        <X className="size-3" strokeWidth={3} />
      </button>
    </div>
  )
}

function ImageTile({ file, onRemove }: { file: File; onRemove: () => void }) {
  // 파일에서 파생되는 blob URL — useMemo 로 생성하고 effect 는 cleanup(revoke)만 담당.
  const url = useMemo(() => URL.createObjectURL(file), [file])
  useEffect(() => () => URL.revokeObjectURL(url), [url])

  return (
    <div className="border-border relative size-20 overflow-hidden rounded-md border">
      {url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="size-full object-cover" />
      )}
      <button
        type="button"
        onClick={onRemove}
        aria-label="삭제"
        className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-black/70 text-white transition-opacity hover:bg-black/85"
      >
        <X className="size-3" strokeWidth={3} />
      </button>
    </div>
  )
}
