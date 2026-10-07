import type {
  expertDetailResponseSchema,
  expertListResponseSchema,
} from "@/entities/expert/api/expert.schema"
import type {
  clientDashboardResponseSchema,
  expertDashboardResponseSchema,
  myExpertProfileResponseSchema,
} from "@/entities/user/api/user.schema"
import type {
  earningsSummaryResponseSchema,
  transactionsResponseSchema,
} from "@/entities/earnings/api/earnings.schema"
import type {
  couponBalanceResponseSchema,
  couponPurchaseListResponseSchema,
  referralStatusResponseSchema,
} from "@/entities/coupon/api/coupon.schema"
import { asset } from "../lib/assets"
import type { EnvelopeData } from "../lib/respond"
import { daysAgo, localDateTime } from "../lib/time"
import { CATEGORIES, CLIENTS, EXPERTS, ME, SCENARIO, type Expert } from "../world"

/**
 * 전문가 · 마이페이지(대시보드/프로필/포트폴리오/자격증/정산) · 수익 · 이용권 픽스처.
 * 인물/평점/리뷰수/매칭수는 world.ts 의 EXPERTS 를 그대로 따른다.
 */

type ExpertDetailData = EnvelopeData<typeof expertDetailResponseSchema>
type ExpertSummaryData = EnvelopeData<typeof expertListResponseSchema>["content"][number]
type MyExpertProfileData = EnvelopeData<typeof myExpertProfileResponseSchema>
type ExpertDashboardData = EnvelopeData<typeof expertDashboardResponseSchema>
type ClientDashboardData = EnvelopeData<typeof clientDashboardResponseSchema>
type EarningsSummaryData = EnvelopeData<typeof earningsSummaryResponseSchema>
type TransactionData = EnvelopeData<typeof transactionsResponseSchema>["content"][number]
type CouponBalanceData = EnvelopeData<typeof couponBalanceResponseSchema>
type CouponPurchaseData = EnvelopeData<typeof couponPurchaseListResponseSchema>["content"][number]
type ReferralStatusData = EnvelopeData<typeof referralStatusResponseSchema>

type ActivityMethod = "OFFLINE" | "ONLINE" | "BOTH"
type Grade = "EARLY_BIRD" | "STANDARD" | "PREMIUM"
type BenefitType =
  | "PROFILE_AD"
  | "BUSINESS_AD"
  | "EARLY_BIRD_BADGE"
  | "FEE_DISCOUNT"
  | "PRIORITY_LISTING"
type Day = "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY"
/** 등록/수정 폼의 MORNING/AFTERNOON/EVENING 슬롯과 1:1 로 매칭되는 시간대 (time-slot-conversion.ts) */
type Slot = "MORNING" | "AFTERNOON" | "EVENING"

const SLOT_TIMES: Record<Slot, { startTime: string; endTime: string }> = {
  MORNING: { startTime: "09:00", endTime: "12:00" },
  AFTERNOON: { startTime: "12:00", endTime: "18:00" },
  EVENING: { startTime: "18:00", endTime: "22:00" },
}

type ProfileExtra = {
  /** 배너 이미지에 그려질 짧은 문구 (cover SVG 폭에 맞게 10자 내외) */
  bannerLabel: string
  subCategoryIds: number[]
  activityMethod: ActivityMethod
  careerPeriod: string
  grade: Grade
  benefits: BenefitType[]
  regions: string[]
  times: [Day, Slot][]
  detailIntroduction: string
  certifications: { name: string; issuer: string }[]
  portfolios: { type: string; description: string; images: string[] }[]
}

const PROFILE_EXTRA: Record<number, ProfileExtra> = {
  201: {
    bannerLabel: "컷편집 · 자막",
    subCategoryIds: [21, 23],
    activityMethod: "BOTH",
    careerPeriod: "4년",
    grade: "EARLY_BIRD",
    benefits: ["EARLY_BIRD_BADGE", "FEE_DISCOUNT"],
    regions: ["서울 마포구", "서울 서대문구"],
    times: [
      ["MONDAY", "EVENING"],
      ["WEDNESDAY", "EVENING"],
      ["FRIDAY", "EVENING"],
      ["SATURDAY", "AFTERNOON"],
      ["SUNDAY", "AFTERNOON"],
    ],
    detailIntroduction: `안녕하세요, 프리미어 프로로 4년째 유튜브·브랜드 영상을 편집하고 있는 원포인터입니다.

촬영은 해뒀는데 어디서부터 잘라야 할지 막막하거나, 자막 스타일이 매번 달라 고민이신 분들께 "딱 그 한 가지"를 짚어드려요.

▸ 이런 분께 추천해요
· 컷편집 순서와 단축키 루틴을 잡고 싶은 분
· 채널 분위기에 맞는 자막 템플릿을 만들고 싶은 분
· 편집 시간을 절반으로 줄이고 싶은 분

▸ 진행 방식
원본 일부를 미리 받아 확인한 뒤 화면 공유로 1:1 진행합니다.
레슨이 끝나면 사용한 프리셋과 단축키 정리본을 함께 드려요.`,
    certifications: [
      { name: "Adobe Certified Professional - Premiere Pro", issuer: "Adobe" },
      { name: "GTQ 포토샵 1급", issuer: "한국생산성본부" },
      { name: "멀티미디어콘텐츠제작전문가", issuer: "한국산업인력공단" },
    ],
    portfolios: [
      {
        type: "유튜브 브이로그",
        description: "구독자 12만 여행 채널 정기 편집 — 컷편집 · 자막 · BGM 믹싱까지 담당",
        images: ["여행 브이로그", "자막 디자인", "BGM 믹싱"],
      },
      {
        type: "브랜드 숏폼",
        description: "로컬 카페 브랜드 인스타그램 릴스 6편 기획 · 편집",
        images: ["카페 릴스", "브랜드 숏폼"],
      },
      {
        type: "자막 템플릿",
        description: "예능형 자막 템플릿 30종 제작 및 프리셋 배포 (다운로드 2,000회+)",
        images: ["자막 템플릿 30종", "프리셋 미리보기", "모션 자막"],
      },
    ],
  },
  202: {
    bannerLabel: "브이로그 편집",
    subCategoryIds: [21, 22],
    activityMethod: "BOTH",
    careerPeriod: "5년",
    grade: "PREMIUM",
    benefits: ["PRIORITY_LISTING", "PROFILE_AD"],
    regions: ["서울 성동구", "서울 광진구"],
    times: [
      ["TUESDAY", "AFTERNOON"],
      ["TUESDAY", "EVENING"],
      ["THURSDAY", "AFTERNOON"],
      ["THURSDAY", "EVENING"],
      ["SATURDAY", "MORNING"],
      ["SATURDAY", "AFTERNOON"],
    ],
    detailIntroduction: `일상·여행 브이로그만 5년째 편집하고 있는 서연필름입니다.

브이로그는 "무엇을 버릴지"가 절반이에요. 30분짜리 원본을 10분으로 줄이면서도 흐름이 끊기지 않게 만드는 컷 구성, 감성 색보정, 자연스러운 BGM 전환을 중심으로 작업합니다.

▸ 작업 범위
· 컷편집 + 기본 자막 + BGM / 효과음
· 색보정 (LUT 제공 가능)
· 썸네일 시안 2종

▸ 작업 과정
1) 원본 공유 → 2) 컷 구성안 공유 → 3) 1차 편집본 → 4) 수정 1회 → 5) 최종본 전달
작업 중간중간 채팅으로 진행 상황을 공유드려요.`,
    certifications: [
      { name: "Adobe Certified Professional - Premiere Pro", issuer: "Adobe" },
      { name: "DaVinci Resolve Certified User", issuer: "Blackmagic Design" },
      { name: "방송영상 편집 실무 과정 수료", issuer: "한국콘텐츠진흥원" },
    ],
    portfolios: [
      {
        type: "브이로그 편집",
        description: "일상 브이로그 채널 3곳 정기 편집 (월 12편)",
        images: ["일상 브이로그", "컷 구성안", "썸네일 시안"],
      },
      {
        type: "여행 영상",
        description: "제주 한달살기 시리즈 8편 — 색보정 & 사운드 디자인",
        images: ["제주 한달살기", "색보정 비교"],
      },
      {
        type: "채널 인트로",
        description: "채널 인트로 모션 + 썸네일 템플릿 세트 제작",
        images: ["채널 인트로"],
      },
    ],
  },
  203: {
    bannerLabel: "핑거스타일 기타",
    subCategoryIds: [11],
    activityMethod: "OFFLINE",
    careerPeriod: "8년",
    grade: "STANDARD",
    benefits: [],
    regions: ["서울 마포구", "서울 서대문구"],
    times: [
      ["MONDAY", "EVENING"],
      ["TUESDAY", "EVENING"],
      ["THURSDAY", "EVENING"],
      ["SATURDAY", "AFTERNOON"],
    ],
    detailIntroduction: `홍대 근처 연습실에서 통기타 레슨을 하고 있는 현우입니다.

독학하다 막힌 딱 한 곡, 딱 한 주법만 같이 풀어도 실력이 확 올라가요. 코드 전환이 끊기는 이유, 핑거스타일에서 엄지가 흔들리는 이유를 직접 보고 바로 잡아드립니다.

▸ 레슨 가능 주제
· 코드 전환 / 스트로크 리듬
· 핑거스타일 입문 (Travis picking)
· 원하는 곡 1곡 편곡 & 완주

연습실에 레슨용 기타가 준비되어 있어 빈손으로 오셔도 괜찮아요.`,
    certifications: [
      { name: "실용음악 학사 (기타 전공)", issuer: "실용음악대학" },
      { name: "생활음악지도사 1급", issuer: "한국생활음악협회" },
    ],
    portfolios: [
      {
        type: "핑거스타일 커버",
        description: "'캐논 변주곡' 핑거스타일 편곡 커버 영상",
        images: ["핑거스타일 커버", "편곡 악보"],
      },
      {
        type: "레슨 기록",
        description: "기타 입문자 4주 만에 첫 곡 완주 — 레슨 노트 공유",
        images: ["레슨 노트"],
      },
      {
        type: "공연",
        description: "홍대 어쿠스틱 라이브 클럽 정기 공연 (2019~)",
        images: ["어쿠스틱 라이브", "공연 셋리스트"],
      },
    ],
  },
  204: {
    bannerLabel: "자세 교정 필라테스",
    subCategoryIds: [31],
    activityMethod: "OFFLINE",
    careerPeriod: "6년",
    grade: "STANDARD",
    benefits: ["BUSINESS_AD"],
    regions: ["경기 성남시", "서울 송파구"],
    times: [
      ["MONDAY", "MORNING"],
      ["WEDNESDAY", "MORNING"],
      ["FRIDAY", "MORNING"],
      ["SATURDAY", "MORNING"],
    ],
    detailIntroduction: `거북목, 라운드숄더, 골반 틀어짐 — 책상 앞에 오래 앉는 분들의 자세를 1:1로 봐드리는 필라테스 강사 민지입니다.

한 번의 레슨이라도 내 몸의 습관을 정확히 알면 혼자서도 교정할 수 있어요. 체형 체크 후 집에서 할 수 있는 루틴 3가지를 꼭 챙겨드립니다.

▸ 진행
체형 사진 체크(10분) → 소도구 필라테스(40분) → 홈 루틴 정리(10분)`,
    certifications: [
      { name: "국제 필라테스 지도자 자격 (STOTT PILATES)", issuer: "Merrithew" },
      { name: "생활스포츠지도사 2급 (보디빌딩)", issuer: "국민체육진흥공단" },
    ],
    portfolios: [
      {
        type: "자세 교정",
        description: "거북목 · 라운드숄더 4회 교정 프로그램 전후 비교",
        images: ["자세 교정 전후", "체형 분석"],
      },
      {
        type: "그룹 클래스",
        description: "판교 직장인 점심 필라테스 클래스 운영",
        images: ["점심 클래스"],
      },
    ],
  },
  205: {
    bannerLabel: "로고 · 브랜딩",
    subCategoryIds: [41, 43],
    activityMethod: "BOTH",
    careerPeriod: "7년",
    grade: "PREMIUM",
    benefits: ["PROFILE_AD", "PRIORITY_LISTING"],
    regions: ["서울 강남구", "서울 서초구"],
    times: [
      ["TUESDAY", "EVENING"],
      ["WEDNESDAY", "EVENING"],
      ["SATURDAY", "AFTERNOON"],
      ["SUNDAY", "AFTERNOON"],
    ],
    detailIntroduction: `브랜드 디자이너 준호입니다. 에이전시에서 7년간 F&B 브랜드 BI 작업을 해왔어요.

이미 만들어둔 로고가 "뭔가 아쉬운데 뭐가 문제인지 모르겠다"면, 한 번의 피드백으로 방향을 잡을 수 있어요. 자간·비율·컬러·활용성 네 가지 관점에서 구체적인 수정안을 드립니다.

▸ 피드백 결과물
· 수정 포인트 정리 PDF
· 개선 시안 1종 (AI 원본 제공)
· 간판 / 컵 / SNS 프로필 목업 적용 이미지`,
    certifications: [
      { name: "시각디자인기사", issuer: "한국산업인력공단" },
      { name: "Adobe Certified Professional - Illustrator", issuer: "Adobe" },
    ],
    portfolios: [
      {
        type: "카페 BI",
        description: "성수동 스페셜티 카페 BI 리뉴얼 — 로고 · 컵 · 간판",
        images: ["카페 BI 리뉴얼", "컵 목업", "간판 목업"],
      },
      {
        type: "브랜드 아이덴티티",
        description: "동네 베이커리 로고 · 패키지 · 스티커 통합 디자인",
        images: ["베이커리 로고", "패키지 디자인"],
      },
      {
        type: "로고 피드백",
        description: "1인 사업자 로고 원포인트 피드백 30건+ 진행",
        images: ["피드백 리포트"],
      },
    ],
  },
  206: {
    bannerLabel: "영어 면접 코칭",
    subCategoryIds: [51],
    activityMethod: "ONLINE",
    careerPeriod: "9년",
    grade: "PREMIUM",
    benefits: ["PRIORITY_LISTING"],
    regions: [],
    times: [
      ["MONDAY", "EVENING"],
      ["TUESDAY", "EVENING"],
      ["WEDNESDAY", "EVENING"],
      ["THURSDAY", "EVENING"],
      ["SUNDAY", "MORNING"],
    ],
    detailIntroduction: `외국계 기업 영어 면접과 프리토킹을 코칭하는 Jenny 입니다.

면접 직전 "내 답변이 자연스러운지" 한 번만 점검받아도 결과가 달라져요. 예상 질문 리스트를 함께 만들고, 실제 면접처럼 모의 인터뷰를 진행한 뒤 표현 하나하나를 다듬어 드립니다.

▸ 코칭 주제
· 자기소개 / 지원동기 / 경력 설명
· Behavioral question (STAR 기법)
· 연봉 협상 · 역질문 표현`,
    certifications: [
      { name: "CELTA", issuer: "Cambridge English" },
      { name: "TOEIC Speaking Level 8", issuer: "ETS" },
      { name: "TESOL Certificate", issuer: "TESOL International" },
    ],
    portfolios: [
      {
        type: "면접 코칭",
        description: "외국계 기업 영어 면접 코칭 합격 사례 40건+",
        images: ["모의 인터뷰", "답변 피드백"],
      },
      {
        type: "학습 자료",
        description: "주제별 프리토킹 스크립트 자료집 제작",
        images: ["프리토킹 자료집"],
      },
    ],
  },
  207: {
    bannerLabel: "홈베이킹 클래스",
    subCategoryIds: [61],
    activityMethod: "OFFLINE",
    careerPeriod: "3년",
    grade: "EARLY_BIRD",
    benefits: ["EARLY_BIRD_BADGE"],
    regions: ["서울 용산구"],
    times: [
      ["SATURDAY", "MORNING"],
      ["SATURDAY", "AFTERNOON"],
      ["SUNDAY", "AFTERNOON"],
    ],
    detailIntroduction: `용산에서 작은 디저트 공방을 운영하는 수아입니다.

집 오븐으로 구웠는데 자꾸 꺼지거나 갈라진다면, 원인은 대부분 온도와 반죽 상태에 있어요. 실패한 사진을 미리 보내주시면 원인부터 짚고, 함께 한 판을 구워봅니다.

▸ 클래스 메뉴
· 까눌레 · 휘낭시에 · 마들렌
· 레터링 케이크 기초 (아이싱 · 레터링)`,
    certifications: [
      { name: "제과기능사", issuer: "한국산업인력공단" },
      { name: "제빵기능사", issuer: "한국산업인력공단" },
    ],
    portfolios: [
      {
        type: "구움과자",
        description: "까눌레 · 휘낭시에 원데이 클래스 레시피",
        images: ["까눌레", "휘낭시에"],
      },
      {
        type: "레터링 케이크",
        description: "레터링 케이크 주문 제작 200건+",
        images: ["레터링 케이크"],
      },
    ],
  },
  208: {
    bannerLabel: "인물 사진 보정",
    subCategoryIds: [42],
    activityMethod: "BOTH",
    careerPeriod: "5년",
    grade: "STANDARD",
    benefits: [],
    regions: ["서울 종로구", "서울 중구"],
    times: [
      ["WEDNESDAY", "AFTERNOON"],
      ["FRIDAY", "AFTERNOON"],
      ["SATURDAY", "AFTERNOON"],
      ["SUNDAY", "MORNING"],
    ],
    detailIntroduction: `인물 사진을 주로 찍고 보정하는 포토태오입니다.

같은 사진도 보정 순서만 바꾸면 결과가 완전히 달라져요. 라이트룸 기본 톤 → 피부 → 색감 순서로, 내 사진에 바로 적용하면서 배우는 원포인트 레슨입니다.

▸ 레슨 후 드리는 것
· 레슨에서 만든 라이트룸 프리셋
· 보정 체크리스트 1장`,
    certifications: [
      { name: "사진기능사", issuer: "한국산업인력공단" },
      { name: "Adobe Certified Professional - Photoshop", issuer: "Adobe" },
    ],
    portfolios: [
      {
        type: "인물 보정",
        description: "프로필 사진 피부 · 톤 보정 비포 / 애프터",
        images: ["프로필 보정", "비포 애프터"],
      },
      {
        type: "라이트룸 프리셋",
        description: "필름 톤 라이트룸 프리셋 12종 제작",
        images: ["필름 톤 프리셋", "프리셋 적용 예시"],
      },
    ],
  },
}

// ─── 빌더 ────────────────────────────────────────────────────────────────────

function seqOf(expert: Expert): number {
  return expert.expertProfileId - 200
}

function extraOf(expert: Expert): ProfileExtra {
  return PROFILE_EXTRA[expert.expertProfileId] ?? PROFILE_EXTRA[202]
}

function categoryGroups(subCategoryIds: number[]) {
  return CATEGORIES.flatMap((category) => {
    const subs = category.subCategories.filter((sub) => subCategoryIds.includes(sub.id))
    if (subs.length === 0) return []
    return [
      {
        majorCategoryName: category.name,
        majorCategoryIconUrl: asset("icon", `category-${category.id}`, category.emoji),
        subCategoryNames: subs.map((sub) => sub.name),
      },
    ]
  })
}

function subCategoryNames(subCategoryIds: number[]): string[] {
  return categoryGroups(subCategoryIds).flatMap((group) => group.subCategoryNames)
}

export function majorCategoryIdsOf(expert: Expert): number[] {
  const ids = extraOf(expert).subCategoryIds
  return CATEGORIES.filter((c) => c.subCategories.some((s) => ids.includes(s.id))).map((c) => c.id)
}

export function subCategoryIdsOf(expert: Expert): number[] {
  return extraOf(expert).subCategoryIds
}

export function activityMethodOf(expert: Expert): ActivityMethod {
  return extraOf(expert).activityMethod
}

export function regionsOf(expert: Expert): string[] {
  return extraOf(expert).regions
}

export function buildExpertSummary(expert: Expert): ExpertSummaryData {
  const extra = extraOf(expert)
  return {
    expertProfileId: expert.expertProfileId,
    userId: expert.userId,
    nickname: expert.nickname,
    profileImageUrl: expert.profileImageUrl,
    introduction: expert.headline,
    averageRating: expert.rating,
    reviewCount: expert.reviewCount,
    matchCount: expert.matchCount,
    activityMethod: extra.activityMethod,
    grade: extra.grade,
    careerPeriod: extra.careerPeriod,
    categoryNames: subCategoryNames(extra.subCategoryIds),
    regions: extra.regions,
  }
}

export function buildExpertDetail(expert: Expert): ExpertDetailData {
  const seq = seqOf(expert)
  const extra = extraOf(expert)
  return {
    expertProfileId: expert.expertProfileId,
    userId: expert.userId,
    nickname: expert.nickname,
    profileImageUrl: expert.profileImageUrl,
    bannerImageUrl: asset("cover", `expert-banner-${seq}`, extra.bannerLabel),
    introduction: expert.headline,
    detailIntroduction: extra.detailIntroduction,
    careerPeriod: extra.careerPeriod,
    activityMethod: extra.activityMethod,
    authStatus: "APPROVED",
    grade: extra.grade,
    activeBenefits: extra.benefits.map((benefitType, idx) => ({
      id: 9000 + seq * 10 + idx,
      benefitType,
      status: "ACTIVE",
    })),
    categories: categoryGroups(extra.subCategoryIds),
    availableRegions: extra.regions,
    availableTimes: extra.times.map(([dayOfWeek, slot]) => ({ dayOfWeek, ...SLOT_TIMES[slot] })),
    certifications: extra.certifications.map((cert, idx) => ({
      id: 3000 + seq * 10 + idx,
      ...cert,
    })),
    portfolios: extra.portfolios.map((portfolio, idx) => ({
      id: 2000 + seq * 10 + idx,
      type: portfolio.type,
      description: portfolio.description,
      imageUrls: portfolio.images.map((label, imageIdx) =>
        asset("cover", `portfolio-${seq}-${idx}-${imageIdx}`, label),
      ),
    })),
    reviewSummary: {
      averageRating: expert.rating,
      reviewCount: expert.reviewCount,
      totalMatchCount: expert.matchCount,
    },
  }
}

// ─── ME (전문가 201) ─────────────────────────────────────────────────────────

export const MY_EXPERT = EXPERTS.find((e) => e.expertProfileId === ME.expertProfileId) ?? EXPERTS[0]

export const MY_BANK_ACCOUNT = {
  bankCode: "090",
  accountNumber: "3333-12-4567890",
  accountHolder: ME.name,
}

export function buildMyExpertProfile(): MyExpertProfileData {
  // 내 프로필 응답에는 userId 가 없다 — 공개 상세에서 제외
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { userId: _userId, ...detail } = buildExpertDetail(MY_EXPERT)
  return { ...detail, bankAccount: MY_BANK_ACCOUNT }
}

// ─── 대시보드 ────────────────────────────────────────────────────────────────

const COMPLETED_AS_EXPERT = 50
const IN_PROGRESS_AS_EXPERT = 2

/** 정산 누적 (수익 화면 그래프 합보다 큰 "전체 기간" 누적) */
export const LIFETIME_NET_EARNINGS = 8_947_300

export const expertDashboard: ExpertDashboardData = {
  sentProposalCount: 3,
  inProgressTicketCount: IN_PROGRESS_AS_EXPERT,
  averageRating: MY_EXPERT.rating,
  totalEarnings: LIFETIME_NET_EARNINGS,
  pendingProposals: 3,
  inProgressTickets: IN_PROGRESS_AS_EXPERT,
  completedTickets: COMPLETED_AS_EXPERT,
}

export const clientDashboard: ClientDashboardData = {
  availableCouponCount: 5,
  inProgressTicketCount: 1,
  completedMatchCount: 4,
  writtenReviewCount: 3,
  openTickets: 1,
  inProgressTickets: 1,
  completedTickets: 4,
  couponBalance: 5,
}

// ─── 수익 (Earnings) ─────────────────────────────────────────────────────────

/** 결제대행(PG) 수수료 3.5% 만 차감 — 중개 수수료 0% 정책 */
const PG_FEE_RATE = 0.035

const feeOf = (gross: number) => Math.round((gross * PG_FEE_RATE) / 10) * 10

type Period = "DAILY" | "WEEKLY" | "MONTHLY"

type Point = {
  label: string
  settledAmount: number
  pendingAmount: number
  transactionCount: number
}

const DAY_MS = 86_400_000

function parseDay(value: string | null, fallbackOffsetDays: number): Date {
  if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) return new Date(`${value}T00:00:00Z`)
  const now = new Date()
  const base = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  return new Date(base + fallbackOffsetDays * DAY_MS)
}

const md = (d: Date) => `${d.getUTCMonth() + 1}/${d.getUTCDate()}`

/** 오래된 → 최근 순으로 성장 곡선 (마지막 = 이번 달, 아직 진행 중) */
const MONTHLY_NET = [
  312_000, 386_000, 455_000, 521_000, 618_000, 742_000, 905_000, 1_064_000, 1_283_000,
]

function monthlyGraph(start: Date, end: Date): Point[] {
  const months: Date[] = []
  const cursor = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1))
  while (cursor <= end) {
    months.push(new Date(cursor))
    cursor.setUTCMonth(cursor.getUTCMonth() + 1)
  }
  return months.map((month, idx) => {
    const fromEnd = months.length - 1 - idx
    const base = MONTHLY_NET[Math.max(0, MONTHLY_NET.length - fromEnd)]
    // 이번 달은 아직 월초라 대부분 정산 대기(에스크로 보관 + 구매확정 대기), 지난 달은 일부만 정산 대기
    const total = fromEnd === 0 ? 705_400 : base
    const pending = fromEnd === 0 ? 512_700 : fromEnd === 1 ? 212_300 : 0
    return {
      label: `${month.getUTCMonth() + 1}월`,
      settledAmount: total - pending,
      pendingAmount: pending,
      transactionCount: Math.max(1, Math.round(total / 62_000)),
    }
  })
}

const WEEKLY_NET = [198_000, 241_000, 226_500, 287_000, 312_400, 268_000]

function weeklyGraph(start: Date, end: Date): Point[] {
  const weeks: Date[] = []
  for (let t = start.getTime(); t <= end.getTime(); t += 7 * DAY_MS) weeks.push(new Date(t))
  return weeks.map((week, idx) => {
    const fromEnd = weeks.length - 1 - idx
    const total = WEEKLY_NET[Math.max(0, WEEKLY_NET.length - 1 - fromEnd)]
    const pending =
      fromEnd === 0 ? Math.round(total * 0.75) : fromEnd === 1 ? Math.round(total * 0.3) : 0
    return {
      label: `${md(week)}~`,
      settledAmount: total - pending,
      pendingAmount: pending,
      transactionCount: Math.max(1, Math.round(total / 62_000)),
    }
  })
}

const DAILY_NET = [67_550, 0, 96_500, 48_250, 0, 115_800, 72_380, 38_600, 86_850]

function dailyGraph(start: Date, end: Date): Point[] {
  const days: Date[] = []
  for (let t = start.getTime(); t <= end.getTime(); t += DAY_MS) days.push(new Date(t))
  return days.map((day, idx) => {
    const fromEnd = days.length - 1 - idx
    const total = DAILY_NET[Math.max(0, DAILY_NET.length - 1 - fromEnd)]
    const pending = fromEnd <= 3 ? total : 0
    return {
      label: md(day),
      settledAmount: total - pending,
      pendingAmount: pending,
      transactionCount: total === 0 ? 0 : total > 90_000 ? 2 : 1,
    }
  })
}

export function buildEarningsSummary(params: URLSearchParams): EarningsSummaryData {
  const rawPeriod = params.get("period")
  const period: Period = rawPeriod === "DAILY" || rawPeriod === "WEEKLY" ? rawPeriod : "MONTHLY"
  const defaultSpan = period === "DAILY" ? -7 : period === "WEEKLY" ? -28 : -183
  const start = parseDay(params.get("startDate"), defaultSpan)
  const end = parseDay(params.get("endDate"), 0)

  const graph =
    period === "DAILY"
      ? dailyGraph(start, end)
      : period === "WEEKLY"
        ? weeklyGraph(start, end)
        : monthlyGraph(start, end)

  const settledAmount = graph.reduce((sum, p) => sum + p.settledAmount, 0)
  const pendingAmount = graph.reduce((sum, p) => sum + p.pendingAmount, 0)
  const totalNetEarnings = settledAmount + pendingAmount
  const totalFee = feeOf(totalNetEarnings / (1 - PG_FEE_RATE))

  return {
    bankAccount: MY_BANK_ACCOUNT,
    totalNetEarnings,
    settledAmount,
    pendingAmount,
    totalFee,
    totalFees: totalFee,
    earningsGraph: graph,
    period,
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  }
}

const EXTRA_CLIENTS = [
  "신혼부부민트",
  "브이로그꿈나무",
  "홈카페러",
  "게임하는준",
  "여행가는소희",
  "리뷰하는제이",
]

const clientName = (idx: number) => {
  const all = [...CLIENTS.map((c) => c.nickname), ...EXTRA_CLIENTS]
  return all[idx % all.length]
}

type TxSeed = {
  paymentId: number
  ticketId: number
  title: string
  client: string
  amount: number
  paidDaysAgo: number
  /** null → 아직 구매확정 전 (에스크로 보관 중) */
  confirmedDaysAgo: number | null
  /** null → 아직 정산 전 */
  settledDaysAgo: number | null
}

/**
 * 전문가 사이드 의뢰 제목 — 티켓 픽스처와 맞추기 위해 핸드오프 리포트에 함께 명시한다.
 * 311: 진행 중 (에스크로 결제 완료, 정산 대기) / 313: 완료 → 정산 완료
 */
export const EXPERT_SIDE_TICKET_TITLES = {
  311: "제주 3박 4일 여행 브이로그 컷편집 + 자막",
  313: "기타 커버 영상 멀티캠 싱크 편집",
} as const

const TX_SEEDS: TxSeed[] = [
  {
    paymentId: 611,
    ticketId: SCENARIO.expertSide.ticketIds[0],
    title: EXPERT_SIDE_TICKET_TITLES[311],
    client: clientName(0),
    amount: 120_000,
    paidDaysAgo: 2,
    confirmedDaysAgo: null,
    settledDaysAgo: null,
  },
  {
    paymentId: 624,
    ticketId: 324,
    title: "프리미어 프로 자막 템플릿 만들기 레슨",
    client: clientName(4),
    amount: 55_000,
    paidDaysAgo: 4,
    confirmedDaysAgo: 1,
    settledDaysAgo: null,
  },
  {
    paymentId: 623,
    ticketId: 323,
    title: "웨딩 스냅 하이라이트 영상 편집 피드백",
    client: clientName(5),
    amount: 90_000,
    paidDaysAgo: 6,
    confirmedDaysAgo: 3,
    settledDaysAgo: null,
  },
  {
    paymentId: 613,
    ticketId: SCENARIO.expertSide.ticketIds[2],
    title: EXPERT_SIDE_TICKET_TITLES[313],
    client: clientName(1),
    amount: 90_000,
    paidDaysAgo: 9,
    confirmedDaysAgo: 6,
    settledDaysAgo: 3,
  },
  {
    paymentId: 622,
    ticketId: 322,
    title: "인스타 릴스 편집 루틴 잡기 (1회)",
    client: clientName(6),
    amount: 45_000,
    paidDaysAgo: 13,
    confirmedDaysAgo: 11,
    settledDaysAgo: 8,
  },
  {
    paymentId: 621,
    ticketId: 321,
    title: "온라인 강의 영상 컷편집 단축키 코칭",
    client: clientName(7),
    amount: 50_000,
    paidDaysAgo: 17,
    confirmedDaysAgo: 15,
    settledDaysAgo: 12,
  },
  {
    paymentId: 620,
    ticketId: 320,
    title: "제품 리뷰 영상 색보정 원포인트",
    client: clientName(10),
    amount: 65_000,
    paidDaysAgo: 22,
    confirmedDaysAgo: 19,
    settledDaysAgo: 16,
  },
  {
    paymentId: 619,
    ticketId: 319,
    title: "브이로그 BGM · 효과음 정리 레슨",
    client: clientName(1),
    amount: 40_000,
    paidDaysAgo: 27,
    confirmedDaysAgo: 25,
    settledDaysAgo: 22,
  },
  {
    paymentId: 618,
    ticketId: 318,
    title: "유튜브 인트로 자막 애니메이션 만들기",
    client: clientName(8),
    amount: 80_000,
    paidDaysAgo: 34,
    confirmedDaysAgo: 31,
    settledDaysAgo: 28,
  },
  {
    paymentId: 617,
    ticketId: 317,
    title: "가족 여행 영상 편집 기초 (프리미어 입문)",
    client: clientName(9),
    amount: 50_000,
    paidDaysAgo: 41,
    confirmedDaysAgo: 38,
    settledDaysAgo: 35,
  },
  {
    paymentId: 616,
    ticketId: 316,
    title: "게임 하이라이트 영상 편집 피드백",
    client: clientName(8),
    amount: 45_000,
    paidDaysAgo: 48,
    confirmedDaysAgo: 46,
    settledDaysAgo: 43,
  },
  {
    paymentId: 615,
    ticketId: 315,
    title: "카페 홍보 영상 컷편집 + 자막",
    client: clientName(2),
    amount: 85_000,
    paidDaysAgo: 56,
    confirmedDaysAgo: 53,
    settledDaysAgo: 50,
  },
]

const DAY_MINUTES = 60 * 24

/** 구매확정 후 영업일 기준 3일 뒤 정산 */
const SETTLEMENT_DELAY_DAYS = 3

export function buildTransactions(status: string | null): TransactionData[] {
  return TX_SEEDS.map((seed): TransactionData => {
    const fee = feeOf(seed.amount)
    const isSettled = seed.settledDaysAgo != null
    const paidAt = localDateTime(-seed.paidDaysAgo * DAY_MINUTES - 95)
    return {
      paymentId: seed.paymentId,
      ticketTitle: seed.title,
      clientNickname: seed.client,
      originalAmount: seed.amount,
      fee,
      netAmount: seed.amount - fee,
      status: isSettled ? "SETTLED" : "PENDING",
      paidAt,
      confirmedAt:
        seed.confirmedDaysAgo != null
          ? localDateTime(-seed.confirmedDaysAgo * DAY_MINUTES - 40)
          : null,
      settledAt: isSettled ? localDateTime(-(seed.settledDaysAgo ?? 0) * DAY_MINUTES) : null,
      estimatedSettlementDate:
        seed.confirmedDaysAgo != null && !isSettled
          ? localDateTime((SETTLEMENT_DELAY_DAYS - seed.confirmedDaysAgo) * DAY_MINUTES)
          : null,
      id: seed.paymentId,
      ticketId: seed.ticketId,
      amount: seed.amount,
      createdAt: paidAt,
    }
  }).filter((tx) => !status || status === "ALL" || tx.status === status)
}

// ─── 이용권 (Coupon) ─────────────────────────────────────────────────────────

export const COUPON_PACKAGES = {
  TRIAL: { quantity: 1, price: 0 },
  BASIC: { quantity: 3, price: 9_900 },
  STANDARD: { quantity: 5, price: 14_900 },
  PREMIUM: { quantity: 10, price: 26_900 },
  CONTACT_SINGLE: { quantity: 1, price: 3_900 },
  CONTACT_BASIC: { quantity: 3, price: 9_900 },
  CONTACT_STANDARD: { quantity: 5, price: 14_900 },
  CONTACT_PREMIUM: { quantity: 10, price: 26_900 },
} as const

export const couponBalance: CouponBalanceData = {
  totalCount: clientDashboard.availableCouponCount,
  packageBreakdown: { WELCOME: 1, STANDARD: 3, EVENT: 1 },
}

export const DIRECT_REQUEST_COUPON_BALANCE = 2

export function buildCouponPurchases(): CouponPurchaseData[] {
  return [
    {
      id: 7103,
      packageType: "STANDARD",
      quantity: COUPON_PACKAGES.STANDARD.quantity,
      totalPrice: COUPON_PACKAGES.STANDARD.price,
      paymentMethod: "KAKAO_PAY",
      status: "PAID",
      createdAt: daysAgo(12),
    },
    {
      id: 7102,
      packageType: "CONTACT_BASIC",
      quantity: COUPON_PACKAGES.CONTACT_BASIC.quantity,
      totalPrice: COUPON_PACKAGES.CONTACT_BASIC.price,
      paymentMethod: "TOSS",
      status: "PAID",
      createdAt: daysAgo(27),
    },
    {
      id: 7101,
      packageType: "BASIC",
      quantity: COUPON_PACKAGES.BASIC.quantity,
      totalPrice: COUPON_PACKAGES.BASIC.price,
      paymentMethod: "CARD",
      status: "PAID",
      createdAt: daysAgo(64),
    },
  ]
}

export const referralStatus: ReferralStatusData = {
  referralCode: "ONEPT-7K2Q",
  referredUserCount: 3,
  totalReward: 3,
}
