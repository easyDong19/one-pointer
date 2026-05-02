"use client"

import { MessageSquareText } from "lucide-react"

import { Text } from "@/shared/ui/text"

export function MyReviewsEmpty() {
  return (
    <div className="border-border bg-muted/20 flex min-h-[280px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-12">
      <MessageSquareText className="text-muted-foreground/40" size={48} />
      <Text as="p" typography="body2-bold" className="text-foreground">
        아직 작성된 리뷰가 없어요
      </Text>
      <Text
        as="p"
        typography="caption1-medium"
        className="text-muted-foreground"
      >
        의뢰가 완료되면 채팅이 자동으로 리뷰가 됩니다
      </Text>
    </div>
  )
}
