"use client"

import { MessageSquareReply } from "lucide-react"

import type { ExpertReply } from "@/entities/review/api/review.schema"
import { Text } from "@/shared/ui/text"
import { formatDate } from "@/shared/lib/format"

type Props = {
  reply: ExpertReply
}

/** 리뷰 하단의 전문가 답변 카드. expertReply 가 있을 때만 호출자가 렌더. */
export function ReviewReply({ reply }: Props) {
  return (
    <section className="border-border bg-muted/20 space-y-2 rounded-xl border p-4">
      <div className="flex items-center gap-1.5">
        <MessageSquareReply className="text-primary h-4 w-4" />
        <Text typography="caption1-bold" className="text-foreground">
          전문가 답변
        </Text>
      </div>
      <Text
        as="p"
        typography="caption1-medium"
        className="text-foreground break-words whitespace-pre-wrap"
      >
        {reply.content}
      </Text>
      <Text
        as="div"
        typography="caption2-medium"
        className="text-muted-foreground tabular-nums"
      >
        {formatDate(reply.createdAt)}
      </Text>
    </section>
  )
}
