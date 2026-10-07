import type { Server } from "node:http"
import { WebSocketServer } from "ws"

/**
 * 채팅 실시간(STOMP over WebSocket) 최소 스텁.
 * CONNECT 에 CONNECTED 로만 응답해 클라이언트가 "연결됨" 상태가 되도록 한다.
 * 메시지 브로드캐스트는 하지 않는다 — 대화 내용은 REST(/messages) 히스토리로 보여준다.
 */
const NULL = "\0"

export function attachStompStub(server: Server): void {
  const wss = new WebSocketServer({ server, path: "/ws" })

  wss.on("connection", (socket) => {
    socket.on("message", (raw) => {
      const frame = raw.toString()
      const command = frame.split("\n", 1)[0]?.trim()
      if (command === "CONNECT" || command === "STOMP") {
        socket.send(`CONNECTED\nversion:1.2\nheart-beat:0,0\n\n${NULL}`)
      }
    })
  })
}
