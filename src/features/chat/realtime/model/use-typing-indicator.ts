"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import type { TypingEvent } from "@/entities/chat/api/chat.schema"

const TYPING_TIMEOUT_MS = 3000

/**
 * 상대방의 타이핑 이벤트를 받아 3초간 표시하는 훅.
 * 내 userId 와 동일한 이벤트는 자기 자신이 보낸 것이므로 무시한다.
 *
 * 사용:
 *   const { typingUserId, onTyping } = useTypingIndicator(myUserId)
 *   useChatSocket({ roomId, onMessage, onTyping })
 */
export function useTypingIndicator(myUserId: number | null | undefined) {
  const [typingUserId, setTypingUserId] = useState<number | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const onTyping = useCallback(
    (event: TypingEvent) => {
      if (myUserId != null && event.userId === myUserId) return
      setTypingUserId(event.userId)
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setTypingUserId(null), TYPING_TIMEOUT_MS)
    },
    [myUserId],
  )

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    },
    [],
  )

  return { typingUserId, onTyping }
}
