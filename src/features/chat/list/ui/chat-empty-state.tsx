"use client"

import { Inbox, SearchX } from "lucide-react"

import { Text } from "@/shared/ui/text"

type Props = {
  variant: "no-rooms" | "no-results"
}

export function ChatEmptyState({ variant }: Props) {
  const Icon = variant === "no-rooms" ? Inbox : SearchX
  const title = variant === "no-rooms" ? "아직 채팅방이 없어요" : "검색 결과가 없습니다"
  const description =
    variant === "no-rooms"
      ? "의뢰가 매칭되면 여기에서 전문가와 대화할 수 있어요."
      : "다른 키워드 또는 탭을 시도해보세요."

  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
      <Icon className="text-muted-foreground/50 mb-4 h-12 w-12" />
      <Text typography="body1-bold" className="text-foreground mb-1">
        {title}
      </Text>
      <Text typography="caption1-medium" className="text-muted-foreground">
        {description}
      </Text>
    </div>
  )
}
