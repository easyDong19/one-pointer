import { createMiddleware } from "@mswjs/http-middleware"
import express from "express"
import { handlers } from "./handlers"
import { attachStompStub } from "./lib/stomp"

/**
 * 독립 MSW 목업 서버.
 * Next 의 SSR(serverFetch) 과 브라우저(clientFetch) 가 모두 이 서버를 BASE_URL 로 바라보므로
 * 앱 코드를 건드리지 않고 전체 화면을 목업 데이터로 렌더링할 수 있다.
 *
 *   pnpm mock          # http://localhost:9090
 *   pnpm dev:mock      # BASE_URL 을 목업 서버로 돌린 Next dev 서버
 */
const PORT = Number(process.env.MOCK_PORT ?? 9090)

const app = express()

app.use((req, res, next) => {
  const origin = req.headers.origin
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin)
    res.setHeader("Access-Control-Allow-Credentials", "true")
    res.setHeader("Vary", "Origin")
  }
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS")
    res.setHeader(
      "Access-Control-Allow-Headers",
      req.headers["access-control-request-headers"] ?? "content-type",
    )
    res.status(204).end()
    return
  }
  next()
})

app.use(createMiddleware(...handlers))

app.use((req, res) => {
  console.warn(`[mock] unhandled ${req.method} ${req.originalUrl}`)
  res.status(404).json({ success: false, message: "Mock not found", data: null })
})

const server = app.listen(PORT, () => {
  console.log(`[mock] listening on http://localhost:${PORT} (${handlers.length} handlers)`)
})
attachStompStub(server)
