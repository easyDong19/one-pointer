"use client"

import { useMemo } from "react"
import { MessageSquare } from "lucide-react"

import { countByTab } from "@/features/chat/list/lib/chat-filter"
import { useChatRoomsQuery } from "@/features/chat/list/model/use-chat-rooms-query"
import { Text } from "@/shared/ui/text"

/**
 * 데스크탑 `/chat` 진입 시 main panel 에 표시되는 안내.
 * 모바일에서는 layout 이 main 을 hidden 처리하므로 노출되지 않는다.
 *
 * sidebar 와 같은 queryKey 를 사용 — react-query 가 dedupe 해서 추가 fetch 없음.
 *
 * 정책: docs/design/desktop-chat-ux.md §7
 */
export function ChatNoSelection() {
  const query = useChatRoomsQuery()
  const inProgressCount = useMemo(() => {
    const all = query.data?.pages.flatMap((p) => p.rooms) ?? []
    return countByTab("IN_PROGRESS", all)
  }, [query.data])

  return (
    <div className="bg-muted/20 flex min-h-[calc(100dvh-3.5rem)] flex-col items-center justify-center px-6 py-20 text-center">
      <MessageSquare
        className="text-muted-foreground/30 mb-6 h-12 w-12"
        strokeWidth={1.5}
      />
      <Text typography="body1-bold" className="text-foreground mb-2">
        대화를 선택해주세요
      </Text>
      <Text
        typography="caption1-medium"
        className="text-muted-foreground max-w-xs"
      >
        왼쪽 목록에서 채팅방을 선택하면
        <br />
        여기에서 대화를 이어갈 수 있어요
      </Text>
      {inProgressCount > 0 && (
        <Text
          as="div"
          typography="caption2-medium"
          className="text-muted-foreground mt-8 tabular-nums"
        >
          · 진행중 {inProgressCount}개 ·
        </Text>
      )}
    </div>
  )
}
