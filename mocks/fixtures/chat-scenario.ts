import { MOCK_ORIGIN } from "../lib/assets"
import { CLIENTS, EXPERTS, ME, SCENARIO, subCategoryById, type Expert } from "../world"

/**
 * 채팅 · 합의 · 결제 · 작업물 · 분쟁 도메인 전용 시나리오 상수.
 * world.ts 의 공유 ID/인물을 그대로 쓰고, 이 도메인 그룹에만 필요한 ID(합의서/결제/분쟁 등)를 여기서 정의한다.
 */

const expertByProfile = (expertProfileId: number): Expert => {
  const found = EXPERTS.find((e) => e.expertProfileId === expertProfileId)
  if (!found) throw new Error(`[mock] unknown expert ${expertProfileId}`)
  return found
}

export const SEO_YEON = expertByProfile(SCENARIO.hero.expertProfileId) // 202 서연필름 (userId 102)
export const HYUN_WOO = expertByProfile(203) // 기타하는현우 (userId 103)
export const JUN_HO = expertByProfile(SCENARIO.logo.expertProfileId) // 205 디자인준호 (userId 105)
export const JENNY = expertByProfile(206) // 제니스잉글리시 (userId 106)
export const SU_A = expertByProfile(207) // 베이킹수아 (userId 107)
export const WEEKEND_VLOGGER = CLIENTS[0] // 주말브이로거 (userId 21)

export const expertCategoryNames = (e: Expert): string[] => [
  subCategoryById(e.subCategoryId).subCategory.name,
]

/** 이 도메인 그룹의 의뢰 · 거래 ID 맵 */
export const DEALS = {
  /** HERO — ME(의뢰인) ↔ 서연필름, 산출물 검수 대기 */
  hero: {
    ticketId: SCENARIO.hero.ticketId, // 301
    roomId: SCENARIO.hero.roomId, // room-301
    title: "유튜브 브이로그 영상 편집 (10분 내외)",
    agreementId: SCENARIO.hero.agreementId, // 501
    paymentId: SCENARIO.hero.paymentId, // 601
    deliveryId: SCENARIO.hero.deliveryId, // 701
    price: 150_000,
    maxRevisions: 2,
    deadlineDayOffset: 2,
  },
  /** GUITAR — ME(의뢰인) 모집중 의뢰, 제안 전문가들과 사전 문의 채팅 */
  guitar: {
    ticketId: SCENARIO.guitar.ticketId, // 302
    roomIdHyunWoo: "room-302",
    roomIdJenny: "room-302-206",
    title: "통기타 핑거스타일 원포인트 레슨",
  },
  /** LOGO — ME(의뢰인) ↔ 디자인준호, 거래 완료 + 리뷰 공개 */
  logo: {
    ticketId: SCENARIO.logo.ticketId, // 303
    roomId: SCENARIO.logo.roomId, // room-303
    title: "카페 로고 디자인 원포인트 피드백",
    agreementId: 503,
    paymentId: 603,
    deliveryId: 703,
    reviewId: SCENARIO.logo.reviewId, // 801
    price: 80_000,
  },
  /** DISPUTE — ME(의뢰인) ↔ 베이킹수아, 마감 초과 → 환불 거절 → 분쟁 → 전액 환불 */
  dispute: {
    ticketId: 310,
    roomId: "room-310",
    title: "디저트 카페 신메뉴 레시피 컨설팅 (마카롱 3종)",
    agreementId: 509,
    paymentId: 609,
    refundId: 951,
    disputeId: 901,
    price: 55_000,
  },
  /** EXPERT SIDE — 주말브이로거(의뢰인) ↔ ME(전문가), 작업 진행중 */
  expertSide: {
    ticketId: SCENARIO.expertSide.ticketIds[0], // 311
    roomId: "room-311",
    title: "제주 3박 4일 여행 브이로그 컷편집 + 자막",
    proposalId: SCENARIO.expertSide.proposalIds[0], // 411
    agreementId: 511,
    paymentId: 611,
    price: 120_000,
    maxRevisions: 1,
    deadlineDayOffset: 3,
  },
} as const

export const MY_USER_ID = ME.userId

// ─── 시각 ────────────────────────────────────────────────────────────────────

const KST_OFFSET = 9 * 60 * 60_000

/**
 * "오늘(KST) 기준 dayOffset 일째 HH:MM(KST)" 의 ISO-Z 문자열.
 * 지난 날짜의 대화는 시각을 고정해 날짜 구분선/시간 라벨이 매번 자연스럽게 나오게 한다.
 */
export function kstAt(dayOffset: number, hh: number, mm: number): string {
  const nowKst = new Date(Date.now() + KST_OFFSET)
  const utc =
    Date.UTC(
      nowKst.getUTCFullYear(),
      nowKst.getUTCMonth(),
      nowKst.getUTCDate() + dayOffset,
      hh,
      mm,
    ) - KST_OFFSET
  return new Date(utc).toISOString()
}

/** 합의서 마감일 — 웹 `toServerDeadline` 과 같은 `YYYY-MM-DDT23:59:00` (KST, 오프셋 없음) */
export function deadlineAt(dayOffset: number): string {
  const nowKst = new Date(Date.now() + KST_OFFSET)
  const d = new Date(
    Date.UTC(nowKst.getUTCFullYear(), nowKst.getUTCMonth(), nowKst.getUTCDate() + dayOffset),
  )
  return `${d.toISOString().slice(0, 10)}T23:59:00`
}

/** "10월 10일" (KST) */
export function kstDateLabel(dayOffset: number): string {
  const nowKst = new Date(Date.now() + KST_OFFSET)
  const d = new Date(
    Date.UTC(nowKst.getUTCFullYear(), nowKst.getUTCMonth(), nowKst.getUTCDate() + dayOffset),
  )
  return `${d.getUTCMonth() + 1}월 ${d.getUTCDate()}일`
}

/** "20261005" (KST) — 주문번호용 */
export function kstDateCompact(dayOffset: number): string {
  return deadlineAt(dayOffset).slice(0, 10).replace(/-/g, "")
}

// ─── 파일 URL ────────────────────────────────────────────────────────────────

/** 채팅 FILE 메시지 · 작업물 첨부 · 분쟁 증빙용 파일 URL (목업 서버가 직접 서빙) */
export function mockFile(fileName: string): string {
  return `${MOCK_ORIGIN}/mock-files/${encodeURIComponent(fileName)}`
}

export const won = (amount: number) => `${amount.toLocaleString("ko-KR")}원`
