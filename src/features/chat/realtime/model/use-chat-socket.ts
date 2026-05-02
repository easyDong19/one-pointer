"use client"

import type { Client, StompSubscription } from "@stomp/stompjs"
import { useCallback, useEffect, useRef, useState } from "react"

import {
  chatMessageSchema,
  sendMessageRequestSchema,
  typingEventSchema,
  type ChatMessage,
  type SendMessageRequest,
  type TypingEvent,
} from "@/entities/chat/api/chat.schema"
import { createChatSocket } from "@/shared/api/ws/stomp-client"

const SEND_DESTINATION = "/app/chat.send"
const TYPING_DESTINATION = "/app/chat.typing"

const subscribeMessages = (roomId: string) => `/topic/chat/${roomId}`
const subscribeTyping = (roomId: string) => `/topic/chat/${roomId}/typing`

export type UseChatSocketOptions = {
  /** 빈 문자열·null 이면 연결하지 않는다 (방 미선택 상태) */
  roomId: string | null
  onMessage: (message: ChatMessage) => void
  onTyping?: (event: TypingEvent) => void
  /** 인증 미완료 등으로 연결을 막아야 할 때 false */
  enabled?: boolean
}

export type UseChatSocketReturn = {
  isConnected: boolean
  send: (payload: SendMessageRequest) => void
  sendTyping: () => void
}

/**
 * 한 채팅방의 STOMP 구독 + 메시지/타이핑 송수신.
 *
 * 인증은 핸드셰이크 시 브라우저가 HttpOnly 쿠키를 자동 첨부 (REST 와 동일).
 * 별도의 토큰 주입 없음.
 */
export function useChatSocket({
  roomId,
  onMessage,
  onTyping,
  enabled = true,
}: UseChatSocketOptions): UseChatSocketReturn {
  const clientRef = useRef<Client | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  const onMessageRef = useRef(onMessage)
  const onTypingRef = useRef(onTyping)
  useEffect(() => {
    onMessageRef.current = onMessage
    onTypingRef.current = onTyping
  })

  useEffect(() => {
    if (!enabled || !roomId) return

    let messageSub: StompSubscription | null = null
    let typingSub: StompSubscription | null = null

    const client = createChatSocket({
      onConnect: () => {
        setIsConnected(true)

        messageSub = client.subscribe(subscribeMessages(roomId), (frame) => {
          try {
            const parsed = chatMessageSchema.safeParse(JSON.parse(frame.body))
            if (parsed.success) onMessageRef.current(parsed.data)
            else console.warn("[chat-socket] message parse failed", parsed.error)
          } catch (error) {
            console.warn("[chat-socket] message JSON error", error)
          }
        })

        typingSub = client.subscribe(subscribeTyping(roomId), (frame) => {
          if (!onTypingRef.current) return
          try {
            const parsed = typingEventSchema.safeParse(JSON.parse(frame.body))
            if (parsed.success) onTypingRef.current(parsed.data)
          } catch (error) {
            console.warn("[chat-socket] typing JSON error", error)
          }
        })
      },
      onStompError: (frame) => {
        console.error("[chat-socket] STOMP error", frame.headers["message"], frame.body)
        setIsConnected(false)
      },
      onWebSocketClose: () => setIsConnected(false),
      onWebSocketError: (event) => {
        console.error("[chat-socket] WS error", event)
        setIsConnected(false)
      },
    })

    clientRef.current = client
    client.activate()

    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        client.deactivate()
      } else if (document.visibilityState === "visible" && !client.active) {
        client.activate()
      }
    }
    document.addEventListener("visibilitychange", handleVisibility)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility)
      messageSub?.unsubscribe()
      typingSub?.unsubscribe()
      client.deactivate()
      clientRef.current = null
      setIsConnected(false)
    }
  }, [roomId, enabled])

  const send = useCallback((payload: SendMessageRequest) => {
    const client = clientRef.current
    if (!client || !client.connected) return
    const validated = sendMessageRequestSchema.parse(payload)
    client.publish({
      destination: SEND_DESTINATION,
      body: JSON.stringify(validated),
    })
  }, [])

  const sendTyping = useCallback(() => {
    const client = clientRef.current
    if (!client || !client.connected || !roomId) return
    client.publish({
      destination: TYPING_DESTINATION,
      body: JSON.stringify({ roomId }),
    })
  }, [roomId])

  return { isConnected, send, sendTyping }
}
