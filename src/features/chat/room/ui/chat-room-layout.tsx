"use client"

import { Loader2 } from "lucide-react"

import type { ChatRoomDetail } from "@/entities/chat/api/chat.schema"
import { Text } from "@/shared/ui/text"

import { BannerPlaceholder } from "./banner-placeholder"
import { ChatInputPlaceholder } from "./chat-input-placeholder"
import { ChatRoomHeader } from "./chat-room-header"
import { MessageList } from "./message-list"
import { ProgressStepper } from "./progress-stepper"

type Props = {
  detail: ChatRoomDetail | undefined
  isLoading: boolean
  isError: boolean
  isConnected: boolean
  myUserId: number | null
}

/**
 * 채팅방 conversation panel 컨테이너.
 *
 * - 데스크탑: `max-w-3xl mx-auto` (Notion 본문 정렬)
 * - 입력 sticky bottom 을 위해 `min-h` 로 viewport 보장
 * - 모바일은 chat/layout.tsx 의 main 슬롯이 viewport 전체를 차지
 *
 * 정책: docs/design/desktop-chat-ux.md §8
 */
export function ChatRoomLayout({
  detail,
  isLoading,
  isError,
  isConnected,
  myUserId,
}: Props) {
  if (isLoading) {
    return <CenteredState content={<Loader2 className="text-primary h-8 w-8 animate-spin" />} />
  }

  if (isError || !detail) {
    return (
      <CenteredState
        content={
          <div className="text-center">
            <Text typography="body1-bold" className="text-foreground mb-1">
              채팅방을 불러오지 못했어요
            </Text>
            <Text typography="caption1-medium" className="text-muted-foreground">
              잠시 후 다시 시도해주세요.
            </Text>
          </div>
        }
      />
    )
  }

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-3xl flex-col">
      <ChatRoomHeader opponent={detail.opponent} />
      <ProgressStepper progress={detail.ticketProgress} />
      <BannerPlaceholder banner={detail.banner} />
      <MessageList
        messages={detail.messages ?? []}
        myUserId={myUserId}
        ticketProgress={detail.ticketProgress}
      />
      <ChatInputPlaceholder isConnected={isConnected} />
    </div>
  )
}

function CenteredState({ content }: { content: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-3xl items-center justify-center px-6">
      {content}
    </div>
  )
}
