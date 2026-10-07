/**
 * MSW 목업 서버(:9090) 를 바라보는 Next dev 서버.
 * 실제 백엔드·PortOne 없이 전체 화면을 띄우기 위한 환경 변수를 주입한다.
 * (프로세스 env 가 .env.* 파일보다 우선하므로 로컬 .env.development 가 있어도 덮어쓴다)
 */
import { spawn } from "node:child_process"

const MOCK_ORIGIN = process.env.MOCK_ORIGIN ?? "http://localhost:9090"

const env = {
  ...process.env,
  BASE_URL: MOCK_ORIGIN,
  NEXT_PUBLIC_BASE_URL: MOCK_ORIGIN,
  NEXT_PUBLIC_WS_URL: MOCK_ORIGIN.replace(/^http/, "ws") + "/ws",
  NEXT_PUBLIC_PORTONE_STORE_ID: "store-mock",
  NEXT_PUBLIC_PORTONE_CHANNEL_KEY: "channel-key-mock",
  NEXT_PUBLIC_PAYMENT_REDIRECT_URL: "http://localhost:3000/payment/portone-result",
}

const child = spawn("next", ["dev", ...process.argv.slice(2)], {
  env,
  stdio: "inherit",
  shell: true,
})
child.on("exit", (code) => process.exit(code ?? 0))
