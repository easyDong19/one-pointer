"use client"

import { EyeOff } from "lucide-react"

import { Text } from "@/shared/ui/text"

/**
 * 리뷰 스냅샷에서 visibility !== PUBLIC 메시지 자리에 표시되는 placeholder.
 * 의뢰인 또는 시스템이 비공개로 가린 메시지 — 누가 가렸는지 표시할지는 향후 결정.
 */
export function PrivateMessagePlaceholder() {
  return (
    <div className="my-1 flex justify-center">
      <div className="bg-muted/60 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5">
        <EyeOff className="text-muted-foreground h-3 w-3" />
        <Text
          as="span"
          typography="caption2-medium"
          className="text-muted-foreground"
        >
          비공개로 설정된 메시지
        </Text>
      </div>
    </div>
  )
}
