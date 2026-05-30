"use client"

import { useEffect, useMemo, useRef } from "react"
import { ImagePlus, X } from "lucide-react"
import { Text } from "@/shared/ui/text"
import { cn } from "@/shared/lib/utils"

type PortfolioImageUploaderProps = {
  images: File[]
  onChange: (images: File[]) => void
  maxCount?: number
}

/**
 * 부모(react-hook-form 등)가 `File[]` 를 소유하는 컴포넌트.
 * 각 File 에 대한 blob preview URL 은 내부에서 캐싱·revoke 한다 (메모리 누수 방지).
 */
export function PortfolioImageUploader({
  images,
  onChange,
  maxCount = 7,
}: PortfolioImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  // images 로부터 파생되는 File → blob URL 매핑.
  // useMemo 로 생성하고, 매핑이 바뀌거나 언마운트될 때 effect cleanup 에서 revoke.
  const previews = useMemo(() => {
    const map = new Map<File, string>()
    images.forEach((file) => map.set(file, URL.createObjectURL(file)))
    return map
  }, [images])

  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [previews])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    const remaining = maxCount - images.length
    const newImages = [...images, ...files.slice(0, remaining)]
    onChange(newImages)
    // reset input
    if (inputRef.current) inputRef.current.value = ""
  }

  const handleRemove = (index: number) => {
    onChange(images.filter((_, i) => i !== index))
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Text as="span" typography="caption2-medium" className="text-muted-foreground">
        이미지 ({images.length}/{maxCount})
      </Text>

      <div className="flex flex-wrap gap-2">
        {images.map((file, index) => (
          <div key={`${file.name}-${index}`} className="group relative size-20 overflow-hidden rounded-md border">
            <img
              src={previews.get(file) ?? ""}
              alt={file.name}
              className="size-full object-cover"
            />
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="absolute top-0.5 right-0.5 rounded-full bg-black/60 p-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
            >
              <X className="size-3" />
            </button>
          </div>
        ))}

        {images.length < maxCount && (
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
  )
}
