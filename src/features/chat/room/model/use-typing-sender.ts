"use client"

import { useCallback, useRef } from "react"

const THROTTLE_MS = 1500

/**
 * 입력 중일 때 STOMP `chat.typing` 을 throttle 해서 publish.
 * 사용자가 키 누를 때마다 send 하지 않고 1.5초당 최대 1번만 발사.
 */
export function useTypingSender(rawSendTyping: () => void) {
  const lastSentRef = useRef(0)

  return useCallback(() => {
    const now = Date.now()
    if (now - lastSentRef.current < THROTTLE_MS) return
    lastSentRef.current = now
    rawSendTyping()
  }, [rawSendTyping])
}
