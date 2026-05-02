"use client"

import { Text } from "@/shared/ui/text"
import { cn } from "@/shared/lib/utils"

type Props = {
  content: string
}

/**
 * 중앙 정렬 시스템 안내 메시지.
 * "리뷰" 또는 "보호" 단어 포함 시 primary-light 배경 (공지 톤), 그 외 muted.
 */
export function SystemBubble({ content }: Props) {
  const isHighlight = content.includes("리뷰") || content.includes("보호")

  return (
    <div className="my-2 flex justify-center">
      <div
        className={cn(
          "max-w-[80%] rounded-full px-3 py-1.5",
          isHighlight ? "bg-primary-light" : "bg-muted",
        )}
      >
        <Text
          as="span"
          typography="caption2-medium"
          className={cn(
            "text-center",
            isHighlight ? "text-primary" : "text-muted-foreground",
          )}
        >
          {content}
        </Text>
      </div>
    </div>
  )
}
