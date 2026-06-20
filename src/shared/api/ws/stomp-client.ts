import { Client, type IFrame, type StompConfig } from "@stomp/stompjs"
import { env } from "@/shared/config/env"

/**
 * STOMP / WebSocket 연결 팩토리.
 *
 * 인증은 **HttpOnly 세션 쿠키** 로 처리한다 (브라우저가 ws 핸드셰이크에
 * 자동으로 쿠키를 첨부 — REST 와 동일). 따라서 별도의 Authorization 헤더가
 * 필요 없다. 서버는 핸드셰이크 시점에 쿠키를 검증한다.
 *
 * 모바일과 다른 점: 모바일은 디스크 token + Bearer 헤더, 웹은 쿠키 자동.
 */

const DEFAULT_RECONNECT_DELAY_MS = 5000
const DEFAULT_HEARTBEAT_MS = 10000

export type ChatSocketHandlers = {
  onConnect?: (frame: IFrame) => void
  onStompError?: (frame: IFrame) => void
  onWebSocketClose?: () => void
  onWebSocketError?: (event: Event) => void
}

export type CreateChatSocketOptions = ChatSocketHandlers & {
  /** 절대 URL. 미지정 시 NEXT_PUBLIC_WS_URL · NEXT_PUBLIC_BASE_URL 에서 파생 */
  wsUrl?: string
  reconnectDelayMs?: number
  heartbeatMs?: number
  debug?: boolean
}

/**
 * NEXT_PUBLIC_WS_URL 이 명시돼 있으면 그것을, 아니면 NEXT_PUBLIC_BASE_URL 의
 * origin 을 추출해 ws:// 또는 wss:// 로 변환한 뒤 `/ws` 를 붙여 사용.
 *
 * 예) BASE_URL = "https://api-dev.one-pointer.store/v1" → "wss://api-dev.one-pointer.store/ws"
 */
export function resolveWsUrl(): string {
  const explicit = env.NEXT_PUBLIC_WS_URL
  if (explicit) return explicit

  const baseUrl = env.NEXT_PUBLIC_BASE_URL
  if (!baseUrl) {
    throw new Error("[stomp-client] NEXT_PUBLIC_BASE_URL is not configured")
  }

  const url = new URL(baseUrl)
  const wsProtocol = url.protocol === "https:" ? "wss:" : "ws:"
  return `${wsProtocol}//${url.host}/ws`
}

export function createChatSocket(options: CreateChatSocketOptions = {}): Client {
  const wsUrl = options.wsUrl ?? resolveWsUrl()
  const debug = options.debug ?? process.env.NODE_ENV === "development"

  const config: StompConfig = {
    brokerURL: wsUrl,
    reconnectDelay: options.reconnectDelayMs ?? DEFAULT_RECONNECT_DELAY_MS,
    heartbeatIncoming: options.heartbeatMs ?? DEFAULT_HEARTBEAT_MS,
    heartbeatOutgoing: options.heartbeatMs ?? DEFAULT_HEARTBEAT_MS,
    onConnect: options.onConnect,
    onStompError: options.onStompError,
    onWebSocketClose: options.onWebSocketClose,
    onWebSocketError: options.onWebSocketError,
    debug: debug ? (msg) => console.debug("[stomp]", msg) : () => {},
  }

  return new Client(config)
}
