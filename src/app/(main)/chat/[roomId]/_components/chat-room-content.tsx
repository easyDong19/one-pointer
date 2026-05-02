"use client"

import { ChatRoomLayout } from "@/features/chat/room/ui/chat-room-layout"
import { useChatRoomInit } from "@/features/chat/room/model/use-chat-room-init"
import { useMessageCompose } from "@/features/chat/room/model/use-message-compose"
import { useTypingSender } from "@/features/chat/room/model/use-typing-sender"

type Props = {
  roomId: string
}

export function ChatRoomContent({ roomId }: Props) {
  const init = useChatRoomInit(roomId)
  const compose = useMessageCompose(roomId, init.send)
  const sendTyping = useTypingSender(init.sendTyping)

  return (
    <ChatRoomLayout
      detail={init.detail}
      isLoading={init.isLoading}
      isError={init.isError}
      isConnected={init.isConnected}
      myUserId={init.myUserId}
      typingUserId={init.typingUserId}
      isUploading={compose.isUploading}
      onSendText={compose.sendText}
      onPickImages={compose.sendImages}
      onPickFile={compose.sendFile}
      onTyping={sendTyping}
    />
  )
}
