"use client"

import { ChangeEvent, useRef, useState } from "react"
import { FileText, Image as ImageIcon, Plus } from "lucide-react"

import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover"
import { Text } from "@/shared/ui/text"
import { cn } from "@/shared/lib/utils"

type Props = {
  onPickImages: (files: File[]) => void
  onPickFile: (file: File) => void
  disabled?: boolean
}

/**
 * 입력창 좌측 + 버튼 → 사진/PDF 업로드 팝오버.
 * 실제 file input 은 hidden, 메뉴 항목 클릭으로 트리거.
 */
export function AttachmentMenu({ onPickImages, onPickFile, disabled }: Props) {
  const [open, setOpen] = useState(false)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) onPickImages(Array.from(files))
    event.target.value = ""
    setOpen(false)
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) onPickFile(file)
    event.target.value = ""
    setOpen(false)
  }

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            aria-label="파일 첨부"
            className={cn(
              "text-muted-foreground hover:bg-muted/50 hover:text-foreground flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors",
              disabled && "cursor-not-allowed opacity-50",
            )}
          >
            <Plus className="h-5 w-5" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" sideOffset={8} className="w-40 p-1">
          <MenuItem
            icon={<ImageIcon className="h-4 w-4" />}
            label="사진"
            onClick={() => imageInputRef.current?.click()}
          />
          <MenuItem
            icon={<FileText className="h-4 w-4" />}
            label="PDF 파일"
            onClick={() => fileInputRef.current?.click()}
          />
        </PopoverContent>
      </Popover>

      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={handleImageChange}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        hidden
        onChange={handleFileChange}
      />
    </>
  )
}

function MenuItem({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="hover:bg-muted/60 text-foreground flex w-full items-center gap-2 rounded-md px-2 py-2 text-left transition-colors"
    >
      <span className="text-muted-foreground">{icon}</span>
      <Text as="span" typography="caption1-medium">
        {label}
      </Text>
    </button>
  )
}
