/**
 * MSW 목업 데이터로 주요 화면을 캡처해 docs/screenshots/ 에 저장한다.
 *
 *   pnpm capture                 # 목업 서버 + Next dev 를 띄우고 전체 캡처 후 종료
 *   pnpm capture chat-room home  # 이름이 일치하는 시나리오만
 *
 * 이미 :9090(목업) / :3000(Next) 이 떠 있으면 그대로 재사용한다.
 */
import { spawn, type ChildProcess } from "node:child_process"
import { mkdir } from "node:fs/promises"
import path from "node:path"
import { chromium, type Browser, type BrowserContextOptions, type Page } from "playwright"
import { scenarios, type Scenario, type Viewport } from "./scenarios"

const APP_ORIGIN = "http://localhost:3000"
const MOCK_ORIGIN = "http://localhost:9090"
const OUT_DIR = path.resolve("docs/screenshots")

const VIEWPORTS: Record<Viewport, BrowserContextOptions> = {
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
  mobile: {
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  },
}

/** 캡처에 불필요한 요소 숨김 + 애니메이션 제거 (결과 이미지 안정화) */
const CAPTURE_CSS = `
  nextjs-portal, [data-sonner-toaster] { display: none !important; }
  /* 홈 푸터의 사업자 정보(실명·연락처)는 문서 이미지에 남기지 않는다 */
  footer { display: none !important; }
  *, *::before, *::after {
    animation-duration: 0s !important;
    animation-delay: 0s !important;
    transition: none !important;
    caret-color: transparent !important;
  }
`

async function isUp(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(2000) })
    return res.status < 500
  } catch {
    return false
  }
}

async function waitUntilUp(url: string, timeoutMs: number): Promise<void> {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    if (await isUp(url)) return
    await new Promise((r) => setTimeout(r, 1000))
  }
  throw new Error(`timeout waiting for ${url}`)
}

function start(script: string): ChildProcess {
  return spawn("pnpm", [script], { stdio: "ignore", detached: true })
}

async function ensureServers(): Promise<ChildProcess[]> {
  const started: ChildProcess[] = []
  if (!(await isUp(`${MOCK_ORIGIN}/v1/api/category`))) started.push(start("mock"))
  await waitUntilUp(`${MOCK_ORIGIN}/v1/api/category`, 30_000)
  if (!(await isUp(APP_ORIGIN))) started.push(start("dev:mock"))
  await waitUntilUp(APP_ORIGIN, 120_000)
  return started
}

async function settle(page: Page): Promise<void> {
  await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => {})
  await page.evaluate(async () => {
    await document.fonts.ready
    const pending = Array.from(document.images)
      .filter((img) => !img.complete)
      .map(
        (img) =>
          new Promise((resolve) => {
            img.addEventListener("load", resolve, { once: true })
            img.addEventListener("error", resolve, { once: true })
          }),
      )
    // lazy 이미지는 뷰포트 밖이면 영영 로드되지 않으므로 상한을 둔다
    await Promise.race([Promise.all(pending), new Promise((r) => setTimeout(r, 5000))])
  })
  // recharts 등 JS 애니메이션(기본 1.5s)이 끝날 때까지
  await page.waitForTimeout(1600)
}

type Issue = { scenario: string; viewport: Viewport; kind: string; detail: string }

async function capture(browser: Browser, scenario: Scenario, viewport: Viewport, issues: Issue[]) {
  const context = await browser.newContext({
    ...VIEWPORTS[viewport],
    locale: "ko-KR",
    reducedMotion: "reduce",
  })
  if (scenario.guest) {
    await context.addCookies([{ name: "mock_session", value: "guest", url: APP_ORIGIN }])
  }
  await context.addInitScript((role) => {
    localStorage.setItem("one-pointer-role", JSON.stringify({ state: { role }, version: 0 }))
  }, scenario.role ?? "client")

  const page = await context.newPage()
  const report = (kind: string, detail: string) => {
    // 비로그인 시나리오의 401 은 의도된 동작
    if (scenario.guest && /\b401\b/.test(detail)) return
    issues.push({ scenario: scenario.name, viewport, kind, detail })
  }
  page.on("pageerror", (err) => report("pageerror", err.message))
  page.on("console", (msg) => msg.type() === "error" && report("console", msg.text().slice(0, 300)))
  page.on("response", (res) => {
    if (res.url().startsWith(MOCK_ORIGIN) && res.status() >= 400) {
      report("http", `${res.status()} ${res.request().method()} ${res.url()}`)
    }
  })

  await page.goto(`${APP_ORIGIN}${scenario.path}`, { waitUntil: "domcontentloaded" })
  await page.addStyleTag({ content: CAPTURE_CSS })
  await settle(page)
  if (scenario.action) {
    await scenario.action(page, viewport)
    await settle(page)
  }

  const file = path.join(OUT_DIR, scenario.feature, `${scenario.name}.${viewport}.png`)
  await mkdir(path.dirname(file), { recursive: true })
  // 모바일은 하단 고정 네비가 중간에 찍히지 않도록 항상 첫 화면만
  const fullPage = viewport === "desktop" && (scenario.fullPage ?? false)
  await page.screenshot({ path: file, fullPage })
  console.log(`✓ ${path.relative(process.cwd(), file)}`)
  await context.close()
}

async function main() {
  const filters = process.argv.slice(2)
  const targets = filters.length
    ? scenarios.filter((s) => filters.some((f) => s.name.includes(f) || s.feature === f))
    : scenarios

  const started = await ensureServers()
  // 로컬 Chrome 우선, 없으면 Playwright 번들 Chromium (`pnpm exec playwright install chromium`)
  const browser = await chromium.launch({ channel: "chrome" }).catch(() => chromium.launch())
  const issues: Issue[] = []

  try {
    for (const scenario of targets) {
      for (const viewport of scenario.viewports ?? (["desktop", "mobile"] as const)) {
        await capture(browser, scenario, viewport, issues).catch((err: Error) =>
          report(issues, scenario, viewport, err),
        )
      }
    }
  } finally {
    await browser.close()
    for (const child of started) if (child.pid) process.kill(-child.pid)
  }

  if (issues.length) {
    console.log(`\n⚠ ${issues.length} issue(s)`)
    for (const i of issues) console.log(`  [${i.scenario}.${i.viewport}] ${i.kind}: ${i.detail}`)
  }
}

function report(issues: Issue[], scenario: Scenario, viewport: Viewport, err: Error) {
  issues.push({ scenario: scenario.name, viewport, kind: "capture-failed", detail: err.message })
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
