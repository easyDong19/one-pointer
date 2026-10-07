import type { Page } from "playwright"

/**
 * 캡처 시나리오 정의.
 * 모든 데이터는 MSW 목업 서버(mocks/)에서 오며, ID 는 mocks/world.ts 의 SCENARIO 를 따른다.
 *
 * 결과: docs/screenshots/<feature>/<name>.<viewport>.png
 */
export type Viewport = "desktop" | "mobile"

export type Scenario = {
  feature: "explore" | "chat" | "review" | "mypage"
  name: string
  path: string
  /** 클라이언트/전문가 모드 (localStorage `one-pointer-role`) */
  role?: "client" | "expert"
  /** 비로그인 상태로 캡처 (mock_session=guest) */
  guest?: boolean
  /** 페이지 전체 스크롤 캡처 여부 (기본: 첫 화면만) */
  fullPage?: boolean
  viewports?: Viewport[]
  /** 페이지 로드 후 다이얼로그 열기 등 추가 동작 */
  action?: (page: Page, viewport: Viewport) => Promise<void>
}

/** 채팅 버블(합의서/작업물)을 눌러 상세 다이얼로그를 연다 */
const openBubble = (text: string) => async (page: Page) => {
  await page.getByText(text).last().click()
  await page.getByRole("dialog").waitFor({ state: "visible" })
  // 자동 포커스된 닫기 버튼의 포커스 링 제거
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur())
}

export const scenarios: Scenario[] = [
  // ─── 01. 탐색 + 의뢰 ────────────────────────────────────────────────────────
  { feature: "explore", name: "home", path: "/", fullPage: true },
  // README 갤러리용 첫 화면
  { feature: "explore", name: "home-top", path: "/", viewports: ["desktop"] },
  { feature: "explore", name: "category", path: `/category/${encodeURIComponent("영상")}` },
  { feature: "explore", name: "search", path: `/search?keyword=${encodeURIComponent("원포인트")}` },
  { feature: "explore", name: "expert-detail", path: "/experts/202", fullPage: true },
  { feature: "explore", name: "ticket-new", path: "/tickets/new", fullPage: true },
  { feature: "explore", name: "ticket-detail", path: "/tickets/302", fullPage: true },
  { feature: "explore", name: "proposal-detail", path: "/proposals/402", fullPage: true },

  // ─── 02. 채팅 상담 플로우 ───────────────────────────────────────────────────
  { feature: "chat", name: "chat-list", path: "/chat" },
  { feature: "chat", name: "chat-room", path: "/chat/room-301" },
  {
    feature: "chat",
    name: "chat-room-top",
    path: "/chat/room-301",
    // 채팅방은 최신 메시지로 자동 스크롤되므로, 진행 단계·의뢰 카드가 보이는 상단으로 되돌린다
    action: async (page) => {
      await page.evaluate(() => window.scrollTo(0, 0))
    },
  },
  {
    feature: "chat",
    name: "agreement-dialog",
    path: "/chat/room-301",
    action: openBubble("합의서 확인하기"),
  },
  {
    feature: "chat",
    name: "delivery-review-dialog",
    path: "/chat/room-301",
    action: openBubble("작업물 확인하기"),
  },
  { feature: "chat", name: "chat-room-expert", path: "/chat/room-311", role: "expert" },

  // ─── 03. 리뷰 ──────────────────────────────────────────────────────────────
  { feature: "review", name: "review-detail", path: "/reviews/801", fullPage: true },
  { feature: "review", name: "review-detail-top", path: "/reviews/801", viewports: ["desktop"] },
  { feature: "review", name: "review-filter", path: "/reviews/801/filter" },
  { feature: "review", name: "my-reviews", path: "/mypage/reviews", role: "expert" },

  // ─── 04. 마이페이지 + 알림 ──────────────────────────────────────────────────
  { feature: "mypage", name: "mypage-client", path: "/mypage", role: "client", fullPage: true },
  { feature: "mypage", name: "mypage-expert", path: "/mypage", role: "expert", fullPage: true },
  { feature: "mypage", name: "my-tickets", path: "/mypage/tickets" },
  { feature: "mypage", name: "earnings", path: "/mypage/earnings", role: "expert", fullPage: true },
  { feature: "mypage", name: "portfolios", path: "/mypage/portfolios", role: "expert" },
  { feature: "mypage", name: "notifications", path: "/notifications" },
  { feature: "mypage", name: "login", path: "/login", guest: true },
]
