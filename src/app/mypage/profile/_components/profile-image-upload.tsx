"use client"

import { useRef } from "react"
import { Camera, X } from "lucide-react"
import { Text } from "@/shared/ui/text"

type ProfileImageUploadProps = {
  currentImageUrl: string | null
  previewUrl: string | null
  nickname: string
  onFileSelect: (file: File) => void
  onRemove: () => void
}

export function ProfileImageUpload({
  currentImageUrl,
  previewUrl,
  nickname,
  onFileSelect,
  onRemove,
}: ProfileImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const displayUrl = previewUrl ?? currentImageUrl
  const initial = nickname?.[0] ?? "?"

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onFileSelect(file)
    }
    e.target.value = ""
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="relative size-24 overflow-hidden rounded-full"
        >
          {displayUrl ? (
            <img
              src={displayUrl}
              alt="프로필"
              className="size-full object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-gradient-to-br from-primary to-accent">
              <Text as="span" typography="h2-bold" className="text-white">
                {initial}
              </Text>
            </div>
          )}
        </button>

        {/* Camera badge */}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="absolute bottom-0 right-0 flex size-8 items-center justify-center rounded-full border-2 border-background bg-muted shadow-sm"
        >
          <Camera className="size-4 text-muted-foreground" />
        </button>

        {/* Remove button */}
        {displayUrl && (
          <button
            type="button"
            onClick={onRemove}
            className="absolute -right-1 -top-1 flex size-6 items-center justify-center rounded-full bg-destructive shadow-sm"
          >
            <X className="size-3 text-white" />
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  )
}
