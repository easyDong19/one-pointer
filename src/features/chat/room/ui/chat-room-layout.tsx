"use client"

import { Loader2 } from "lucide-react"

import type { ChatRoomDetail } from "@/entities/chat/api/chat.schema"
import { BannerDispatcher } from "@/features/chat/banner/ui/banner-dispatcher"
import { openAgreementDetail } from "@/features/agreement/lib/open-agreement-detail"
import { Text } from "@/shared/ui/text"

import { ChatInput } from "./chat-input"
import { ChatRoomHeader } from "./chat-room-header"
import { MessageList } from "./message-list"
import { ProgressStepper } from "./progress-stepper"
import { TypingIndicator } from "./typing-indicator"

type Props = {
  roomId: string
  detail: ChatRoomDetail | undefined
  isLoading: boolean
  isError: boolean
  isConnected: boolean
  myUserId: number | null
  typingUserId: number | null
  isUploading: boolean
  onSendText: (text: string) => void
  onPickImages: (files: File[]) => void
  onPickFile: (file: File) => void
  onTyping: () => void
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
  roomId,
  detail,
  isLoading,
  isError,
  isConnected,
  myUserId,
  typingUserId,
  isUploading,
  onSendText,
  onPickImages,
  onPickFile,
  onTyping,
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

  const opponentNickname = detail.opponent?.nickname ?? null
  const opponentUserId = detail.opponent?.userId ?? null
  const isTypingVisible =
    typingUserId != null &&
    (opponentUserId == null || typingUserId === opponentUserId)

  const ticketId = detail.ticketProgress?.ticketId ?? null
  const myRole = detail.myRole ?? null

  const handleAgreementClick =
    ticketId != null ? () => openAgreementDetail({ ticketId, myRole }) : undefined

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-3xl flex-col">
      <ChatRoomHeader
        opponent={detail.opponent}
        banner={detail.banner}
        myRole={detail.myRole}
        ticketId={ticketId}
      />
      <ProgressStepper progress={detail.ticketProgress} />
      <BannerDispatcher
        banner={detail.banner}
        roomId={roomId}
        myRole={detail.myRole}
        ticketStatus={detail.ticketProgress?.currentStatus}
      />
      <MessageList
        messages={detail.messages ?? []}
        myUserId={myUserId}
        ticketProgress={detail.ticketProgress}
        onAgreementClick={handleAgreementClick}
      />
      <TypingIndicator visible={isTypingVisible} nickname={opponentNickname} />
      <ChatInput
        isConnected={isConnected}
        isUploading={isUploading}
        onSendText={onSendText}
        onPickImages={onPickImages}
        onPickFile={onPickFile}
        onTyping={onTyping}
      />
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
