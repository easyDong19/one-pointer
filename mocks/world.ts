import { asset } from "./lib/assets"

/**
 * 모든 도메인 픽스처가 공유하는 "하나의 세계관".
 * 티켓 ↔ 제안서 ↔ 채팅방 ↔ 합의 ↔ 결제 ↔ 산출물 ↔ 리뷰가 같은 ID 로 엮여야
 * 화면 간 이동이 자연스럽고 캡처 내용이 일관된다. 도메인 픽스처는 여기 ID/인물만 참조한다.
 */

// ─── 로그인 사용자 (의뢰인이면서 전문가 등록도 된 BOTH) ───────────────────────────

export const ME = {
  userId: 1,
  expertProfileId: 201,
  email: "hello@onepointer.dev",
  name: "김원포",
  nickname: "원포인터",
  profileImageUrl: asset("avatar", "me", "원"),
} as const

// ─── 전문가 ──────────────────────────────────────────────────────────────────

export type Expert = {
  userId: number
  expertProfileId: number
  nickname: string
  headline: string
  categoryId: number
  subCategoryId: number
  rating: number
  reviewCount: number
  matchCount: number
  region: string
  profileImageUrl: string
}

const expert = (
  seq: number,
  nickname: string,
  headline: string,
  categoryId: number,
  subCategoryId: number,
  rating: number,
  reviewCount: number,
  matchCount: number,
  region: string,
): Expert => ({
  userId: 100 + seq,
  expertProfileId: 200 + seq,
  nickname,
  headline,
  categoryId,
  subCategoryId,
  rating,
  reviewCount,
  matchCount,
  region,
  profileImageUrl: asset("avatar", `expert-${seq}`, nickname),
})

/** EXPERTS[0] 은 ME 본인의 전문가 프로필 (expertProfileId 201) */
export const EXPERTS: Expert[] = [
  expert(1, "원포인터", "프리미어 프로 컷편집 · 자막 디자인", 2, 21, 4.9, 38, 52, "서울 마포구"),
  expert(2, "서연필름", "유튜브 브이로그 편집 5년차", 2, 21, 4.8, 124, 210, "서울 성동구"),
  expert(
    3,
    "기타하는현우",
    "통기타 코드 · 핑거스타일 원포인트",
    1,
    11,
    4.9,
    87,
    140,
    "서울 마포구",
  ),
  expert(4, "필라테스민지", "자세 교정 1:1 필라테스", 3, 31, 4.7, 56, 98, "경기 성남시"),
  expert(5, "디자인준호", "로고 · 브랜드 아이덴티티", 4, 41, 4.8, 73, 115, "서울 강남구"),
  expert(6, "제니스잉글리시", "영어 면접 · 프리토킹 코칭", 5, 51, 4.9, 102, 188, "온라인"),
  expert(7, "베이킹수아", "홈베이킹 · 디저트 클래스", 6, 61, 4.6, 41, 63, "서울 용산구"),
  expert(8, "포토태오", "인물 사진 보정 · 라이트룸", 4, 42, 4.7, 66, 91, "서울 종로구"),
]

export const expertById = (expertProfileId: number) =>
  EXPERTS.find((e) => e.expertProfileId === expertProfileId) ?? EXPERTS[1]

// ─── 카테고리 ────────────────────────────────────────────────────────────────

export const CATEGORIES = [
  {
    id: 1,
    name: "음악",
    emoji: "🎸",
    description: "악기 · 보컬 · 작곡",
    subCategories: [
      { id: 11, name: "기타" },
      { id: 12, name: "피아노" },
      { id: 13, name: "보컬" },
    ],
  },
  {
    id: 2,
    name: "영상",
    emoji: "🎬",
    description: "편집 · 촬영 · 모션그래픽",
    subCategories: [
      { id: 21, name: "영상 편집" },
      { id: 22, name: "촬영" },
      { id: 23, name: "모션그래픽" },
    ],
  },
  {
    id: 3,
    name: "운동",
    emoji: "🧘",
    description: "필라테스 · 요가 · PT",
    subCategories: [
      { id: 31, name: "필라테스" },
      { id: 32, name: "요가" },
      { id: 33, name: "러닝" },
    ],
  },
  {
    id: 4,
    name: "디자인",
    emoji: "🎨",
    description: "로고 · 보정 · UI",
    subCategories: [
      { id: 41, name: "로고 디자인" },
      { id: 42, name: "사진 보정" },
      { id: 43, name: "UI 디자인" },
    ],
  },
  {
    id: 5,
    name: "외국어",
    emoji: "🗣️",
    description: "회화 · 면접 · 첨삭",
    subCategories: [
      { id: 51, name: "영어 회화" },
      { id: 52, name: "일본어" },
      { id: 53, name: "중국어" },
    ],
  },
  {
    id: 6,
    name: "라이프",
    emoji: "🧁",
    description: "베이킹 · 요리 · 공예",
    subCategories: [
      { id: 61, name: "베이킹" },
      { id: 62, name: "요리" },
      { id: 63, name: "공예" },
    ],
  },
] as const

export function subCategoryById(subCategoryId: number) {
  for (const category of CATEGORIES) {
    const sub = category.subCategories.find((s) => s.id === subCategoryId)
    if (sub) return { category, subCategory: sub }
  }
  return { category: CATEGORIES[1], subCategory: CATEGORIES[1].subCategories[0] }
}

// ─── 핵심 시나리오 ID ────────────────────────────────────────────────────────
//
// HERO  : ME(의뢰인) 가 올린 "브이로그 영상 편집" 의뢰 → 서연필름(202) 제안 선택 → 채팅에서
//         합의 확정 → 에스크로 결제 → 산출물 제출(검수 대기). 채팅 화면의 모든 버블이 등장한다.
// GUITAR: ME 가 올린 "통기타 원포인트 레슨" 의뢰 — 모집중(OPEN), 제안서 3건 도착.
// LOGO  : 디자인준호(205) 와 완료된 "카페 로고" 의뢰 — 리뷰(채팅 스냅샷 공개) 작성됨.
// EXPERT: ME 가 전문가로서 제안서를 보낸 / 직접 요청 받은 의뢰.

export const SCENARIO = {
  hero: {
    ticketId: 301,
    proposalId: 401,
    roomId: "room-301",
    agreementId: 501,
    paymentId: 601,
    deliveryId: 701,
    expertProfileId: 202,
  },
  guitar: {
    ticketId: 302,
    proposalIds: [402, 403, 404],
    expertProfileIds: [203, 206, 208],
  },
  logo: {
    ticketId: 303,
    proposalId: 405,
    roomId: "room-303",
    reviewId: 801,
    expertProfileId: 205,
  },
  /** ME 가 전문가로서 제안한 다른 사람의 의뢰 */
  expertSide: {
    ticketIds: [311, 312, 313],
    proposalIds: [411, 412, 413],
    directRequestTicketId: 314,
  },
} as const

/** 공개 의뢰 피드에 노출되는 다른 의뢰인들의 의뢰 (311~320) */
export const CLIENTS = [
  { userId: 21, nickname: "주말브이로거", profileImageUrl: asset("avatar", "client-21", "주") },
  { userId: 22, nickname: "기타입문자", profileImageUrl: asset("avatar", "client-22", "기") },
  { userId: 23, nickname: "카페사장님", profileImageUrl: asset("avatar", "client-23", "카") },
  { userId: 24, nickname: "취준생J", profileImageUrl: asset("avatar", "client-24", "J") },
  { userId: 25, nickname: "러닝크루장", profileImageUrl: asset("avatar", "client-25", "러") },
]
