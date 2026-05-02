"use client"

import { ChatRoomLayout } from "@/features/chat/room/ui/chat-room-layout"
import { useChatRoomInit } from "@/features/chat/room/model/use-chat-room-init"

type Props = {
  roomId: string
}

export function ChatRoomContent({ roomId }: Props) {
  const { detail, isLoading, isError, isConnected } = useChatRoomInit(roomId)

  return (
    <ChatRoomLayout
      detail={detail}
      isLoading={isLoading}
      isError={isError}
      isConnected={isConnected}
    />
  )
}
