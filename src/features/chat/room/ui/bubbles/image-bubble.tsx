"use client"

import { cn } from "@/shared/lib/utils"

import { openImageViewer } from "../../lib/open-image-viewer"

type Props = {
  url: string
  isMine: boolean
}

export function ImageBubble({ url, isMine }: Props) {
  return (
    <button
      type="button"
      onClick={() => openImageViewer(url)}
      className={cn(
        "bg-muted overflow-hidden rounded-2xl",
        isMine ? "rounded-br-sm" : "rounded-bl-sm",
      )}
      aria-label="이미지 크게 보기"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt=""
        className="block max-h-[200px] max-w-[200px] object-cover md:max-h-[260px] md:max-w-[260px]"
      />
    </button>
  )
}
