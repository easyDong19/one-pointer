import "./src/shared/config/env"
import type { NextConfig } from "next"

/**
 * 전역 보안 헤더.
 * - 클릭재킹 방어: X-Frame-Options(구형) + CSP frame-ancestors(현대)
 * - HSTS: https 강제 (브라우저는 localhost 에는 적용하지 않음)
 * - MIME 스니핑/Referer 누수 방어
 *
 * 주의: 전체 CSP(script-src/connect-src 등)는 PortOne SDK·STOMP(WS)·외부 이미지
 * 호스트를 정확히 allowlist 해야 회귀가 없어 별도 작업으로 분리. 여기서는 프레이밍
 * 방어만 우선 적용한다.
 */
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
]

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ]
  },
}

export default nextConfig
