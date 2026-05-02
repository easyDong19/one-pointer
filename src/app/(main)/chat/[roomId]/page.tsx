import type { Metadata } from "next"

import { ChatRoomContent } from "./_components/chat-room-content"

type Props = {
  params: Promise<{ roomId: string }>
}

export const metadata: Metadata = {
  title: "채팅방",
}

export default async function ChatRoomPage({ params }: Props) {
  const { roomId } = await params
  return <ChatRoomContent roomId={roomId} />
}
