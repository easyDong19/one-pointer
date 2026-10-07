import type { z } from "zod/v4"
import type {
  expertInfoSchema,
  myProposalDetailSchema,
  myProposalSchema,
  proposalDetailSchema,
  proposalSummarySchema,
} from "@/entities/proposal/api/proposal.schema"
import { asset } from "../lib/assets"
import { localDate, localDateTime } from "../lib/time"
import { CLIENTS, ME, expertById } from "../world"
import { ticketMeta } from "./ticket"

/**
 * 제안서(proposal) 픽스처.
 *
 * SCENARIO ID: 401(HERO 선택), 402~404(GUITAR 대기), 405(LOGO 완료), 411~413(ME 전문가 시점).
 * 이 파일 전용 보조 ID: 406/407(ME 보조 의뢰 305/306), 414/415(ME 전문가 시점 추가),
 * 421~423(선택 시 자동 거절된 다른 제안).
 */

type ProposalDetailFixture = z.input<typeof proposalDetailSchema>
type ProposalSummaryFixture = z.input<typeof proposalSummarySchema>
type MyProposalFixture = z.input<typeof myProposalSchema>
type MyProposalDetailFixture = z.input<typeof myProposalDetailSchema>
type ExpertInfoFixture = z.input<typeof expertInfoSchema>

type Status = NonNullable<ProposalDetailFixture["status"]>
type Method = "ONLINE" | "OFFLINE" | "BOTH"
type Duration = "THIRTY_MIN" | "ONE_HOUR" | "ONE_HALF_HOUR" | "TWO_HOUR" | "NEGOTIABLE"

export const PROPOSAL_CREATED_ID = 430

const H = 60
const D = 60 * 24

// ─── 전문가 상세 (제안서 expertInfo 용) ───────────────────────────────────────

type ExpertExtra = {
  careerPeriod: string
  activityMethod: Method
  detailIntroduction: string
  certifications: { name: string; issuer: string }[]
  portfolios: { type: string; labels: string[]; description: string }[]
}

const EXPERT_EXTRA: Record<number, ExpertExtra> = {
  201: {
    careerPeriod: "3년",
    activityMethod: "ONLINE",
    detailIntroduction:
      "프리미어 프로 기반 컷편집과 자막 디자인을 주로 합니다. 브이로그 · 인터뷰 · 숏폼까지, 편집 의도를 함께 설명해 드리는 걸 좋아해요.",
    certifications: [{ name: "Adobe Certified Professional - Premiere Pro", issuer: "Adobe" }],
    portfolios: [
      {
        type: "영상 편집",
        labels: ["여행 브이로그", "인터뷰 자막"],
        description: "여행 브이로그 · 인터뷰 영상 자막 작업",
      },
    ],
  },
  202: {
    careerPeriod: "5년",
    activityMethod: "ONLINE",
    detailIntroduction:
      "구독자 10만 이상 채널 4곳의 브이로그를 정기 편집하고 있어요. 잔잔한 감성 브이로그의 컷 호흡과 색보정이 강점입니다.",
    certifications: [
      { name: "Adobe Certified Professional - Premiere Pro", issuer: "Adobe" },
      { name: "DaVinci Resolve Certified User", issuer: "Blackmagic Design" },
    ],
    portfolios: [
      {
        type: "브이로그",
        labels: ["일상 브이로그", "카페 브이로그"],
        description: "감성 일상 브이로그 편집 모음",
      },
      { type: "색보정", labels: ["Before / After"], description: "아이폰 원본 색보정 비교" },
    ],
  },
  203: {
    careerPeriod: "8년",
    activityMethod: "BOTH",
    detailIntroduction:
      "실용음악과 기타 전공, 핑거스타일 입문자 레슨만 8년째예요. 한 번의 레슨으로 고칠 습관 하나, 가져갈 루틴 하나를 확실히 드립니다.",
    certifications: [{ name: "실용음악 학사 (기타 전공)", issuer: "서울예술대학교" }],
    portfolios: [
      {
        type: "레슨",
        labels: ["핑거스타일 레슨", "연습 루틴표"],
        description: "핑거스타일 입문 레슨 · 연습 루틴표 예시",
      },
    ],
  },
  204: {
    careerPeriod: "4년",
    activityMethod: "OFFLINE",
    detailIntroduction: "재활 필라테스 자격 보유. 직장인 거북목 · 골반 불균형 교정을 주로 봅니다.",
    certifications: [{ name: "PMA 필라테스 지도자 자격", issuer: "PMA" }],
    portfolios: [],
  },
  205: {
    careerPeriod: "6년",
    activityMethod: "ONLINE",
    detailIntroduction:
      "소상공인 브랜드 아이덴티티를 60곳 넘게 작업했어요. 직접 그린 시안을 살리면서 실제로 쓰기 좋은 로고로 다듬어 드립니다.",
    certifications: [{ name: "시각디자인기사", issuer: "한국산업인력공단" }],
    portfolios: [
      {
        type: "로고",
        labels: ["베이커리 로고", "카페 BI"],
        description: "동네 카페 · 베이커리 BI 작업",
      },
    ],
  },
  206: {
    careerPeriod: "7년",
    activityMethod: "ONLINE",
    detailIntroduction:
      "외국계 기업 인사팀 출신 영어 코치입니다. 실제 면접관 시선으로 답변 구조와 표현을 잡아드려요. 취미로 어쿠스틱 기타도 10년째 치고 있어요.",
    certifications: [
      { name: "TESOL", issuer: "University of Toronto" },
      { name: "OPIc AL", issuer: "ACTFL" },
    ],
    portfolios: [],
  },
  207: {
    careerPeriod: "3년",
    activityMethod: "OFFLINE",
    detailIntroduction:
      "용산에서 작은 베이킹 공방을 운영해요. 마카롱 · 레터링 케이크 원데이 클래스 전문입니다.",
    certifications: [{ name: "제과기능사", issuer: "한국산업인력공단" }],
    portfolios: [
      { type: "베이킹", labels: ["마카롱", "레터링 케이크"], description: "공방 클래스 작품" },
    ],
  },
  208: {
    careerPeriod: "5년",
    activityMethod: "BOTH",
    detailIntroduction:
      "인물 사진 작가 겸 라이트룸 보정 강사입니다. 주말엔 인디밴드 세션 기타리스트로도 활동하고 있어요.",
    certifications: [{ name: "Lightroom Classic 공인 강사", issuer: "Adobe" }],
    portfolios: [
      {
        type: "사진 보정",
        labels: ["프로필 보정", "여행 사진 톤"],
        description: "인물 · 여행 사진 보정",
      },
    ],
  },
}

function expertInfo(expertProfileId: number): ExpertInfoFixture {
  const expert = expertById(expertProfileId)
  const extra = EXPERT_EXTRA[expert.expertProfileId] ?? EXPERT_EXTRA[202]
  return {
    userId: expert.userId,
    expertProfileId: expert.expertProfileId,
    nickname: expert.nickname,
    profileImageUrl: expert.profileImageUrl,
    introduction: expert.headline,
    detailIntroduction: extra.detailIntroduction,
    careerPeriod: extra.careerPeriod,
    activityMethod: extra.activityMethod,
    authStatus: "APPROVED",
    certifications: extra.certifications.map((c, i) => ({
      id: expert.expertProfileId * 10 + i + 1,
      ...c,
    })),
    portfolios: extra.portfolios.map((p, i) => ({
      id: expert.expertProfileId * 10 + i + 1,
      type: p.type,
      imageUrls: p.labels.map((label, j) =>
        asset("cover", `portfolio-${expert.expertProfileId}-${i + 1}-${j + 1}`, label),
      ),
      description: p.description,
    })),
  }
}

// ─── Seeds ───────────────────────────────────────────────────────────────────

type ProposalSeed = {
  id: number
  ticketId: number
  expertProfileId: number
  price: number
  proposedDuration: Duration
  method: Method
  locationProposal?: string
  onlineTool?: string
  appeal: string
  status: Status
  createdMinutesAgo: number
  /** [오늘 기준 일 오프셋, "HH:mm"] */
  availableDates?: [number, string][]
}

const SEEDS: ProposalSeed[] = [
  // ─── HERO 301 ─────────────────────────────────────────────────────────────
  {
    id: 401,
    ticketId: 301,
    expertProfileId: 202,
    price: 150_000,
    proposedDuration: "NEGOTIABLE",
    method: "ONLINE",
    onlineTool: "구글 드라이브 원본 공유 + 채팅으로 1차 컷 피드백",
    appeal: [
      "안녕하세요, 유튜브 브이로그만 5년째 편집하고 있는 서연필름입니다.",
      "",
      "잔잔한 감성 브이로그는 컷 호흡이 제일 중요해요. 원본을 확인한 뒤 1차 컷편집본을 먼저 공유드리고, 피드백을 반영해서 자막 · BGM · 색보정까지 마무리해 드릴게요.",
      "",
      "편집하면서 제가 컷을 자르는 기준과 프리미어 자막 템플릿도 함께 정리해서 드릴게요. 다음 영상부터는 혼자서도 충분히 하실 수 있을 거예요 :)",
    ].join("\n"),
    status: "SELECTED",
    createdMinutesAgo: 8 * D + 20 * H,
    availableDates: [
      [-8, "20:00"],
      [-7, "14:00"],
    ],
  },
  {
    id: 421,
    ticketId: 301,
    expertProfileId: 208,
    price: 180_000,
    proposedDuration: "NEGOTIABLE",
    method: "ONLINE",
    onlineTool: "구글 드라이브 + 줌 화면 공유",
    appeal:
      "사진 작가라 색감 보정에 자신 있습니다. 브이로그 전체 톤을 영화 같은 무드로 맞춰드릴게요. 편집 후 색보정 프리셋도 함께 드립니다.",
    status: "REJECTED",
    createdMinutesAgo: 8 * D + 9 * H,
  },
  {
    id: 422,
    ticketId: 301,
    expertProfileId: 205,
    price: 130_000,
    proposedDuration: "NEGOTIABLE",
    method: "ONLINE",
    onlineTool: "구글 드라이브 공유",
    appeal:
      "자막 디자인과 썸네일 작업을 같이 해드릴 수 있어요. 채널 톤에 맞는 자막 스타일 가이드를 만들어 드릴게요.",
    status: "REJECTED",
    createdMinutesAgo: 7 * D + 22 * H,
  },
  // ─── GUITAR 302 ───────────────────────────────────────────────────────────
  {
    id: 402,
    ticketId: 302,
    expertProfileId: 203,
    price: 60_000,
    proposedDuration: "ONE_HALF_HOUR",
    method: "OFFLINE",
    locationProposal: "합정역 3번 출구 앞 연습실 (예약은 제가 해둘게요)",
    appeal: [
      "안녕하세요, 핑거스타일만 8년째 가르치고 있는 현우입니다.",
      "",
      "말씀하신 '베이스와 멜로디가 따로 노는' 문제는 대부분 엄지 독립이 안 돼서 생겨요. 첫 30분은 지금 연주를 보면서 습관을 체크하고, 이후에는 엄지 독립 드릴 3가지와 '황혼' 도입부를 같이 쪼개서 연습해 볼게요.",
      "",
      "레슨이 끝나면 2주짜리 개인 연습 루틴표와 시범 영상을 보내드립니다. 손톱 관리 팁도 챙겨드릴게요!",
    ].join("\n"),
    status: "PENDING",
    createdMinutesAgo: 20 * H,
    availableDates: [
      [3, "19:00"],
      [5, "14:00"],
      [6, "10:30"],
    ],
  },
  {
    id: 403,
    ticketId: 302,
    expertProfileId: 206,
    price: 50_000,
    proposedDuration: "ONE_HOUR",
    method: "OFFLINE",
    locationProposal: "망원역 근처 스터디카페 룸",
    appeal: [
      "본업은 영어 코칭이지만, 대학 시절 어쿠스틱 밴드에서 기타를 맡았고 지금도 주말마다 핑거스타일 커버를 연습하고 있어요.",
      "",
      "입문 때 막혔던 지점을 저도 똑같이 겪어서, 눈높이에 맞춰 차근차근 설명드릴 수 있어요. 부담 없이 이야기 나누듯 진행해요!",
    ].join("\n"),
    status: "PENDING",
    createdMinutesAgo: 12 * H,
    availableDates: [[5, "14:00"]],
  },
  {
    id: 404,
    ticketId: 302,
    expertProfileId: 208,
    price: 70_000,
    proposedDuration: "TWO_HOUR",
    method: "OFFLINE",
    locationProposal: "홍대입구역 인근 제 작업실",
    appeal: [
      "사진 일을 하면서 인디밴드 세션 기타도 6년째 하고 있습니다.",
      "",
      "연주하시는 모습을 영상으로 찍어서 자세를 함께 보면서 교정해 드릴게요. 촬영본은 레슨 후 그대로 드려서 복습용으로 쓰실 수 있어요.",
    ].join("\n"),
    status: "PENDING",
    createdMinutesAgo: 4 * H,
    availableDates: [
      [3, "19:00"],
      [6, "10:30"],
    ],
  },
  // ─── LOGO 303 ─────────────────────────────────────────────────────────────
  {
    id: 405,
    ticketId: 303,
    expertProfileId: 205,
    price: 80_000,
    proposedDuration: "NEGOTIABLE",
    method: "ONLINE",
    onlineTool: "피그마 코멘트 + 화상 미팅 30분",
    appeal: [
      "브랜드 아이덴티티 작업을 6년째 하고 있는 디자인준호입니다.",
      "",
      "보내주신 시안 중 B안이 '동네 사랑방' 컨셉과 가장 잘 맞아 보여요. 피그마에 시안을 올려서 자간 · 굵기 · 컬러 팔레트 수정안을 코멘트로 남겨드리고, 간판 · 컵 슬리브 · 인스타 프로필 목업에 적용한 모습까지 보여드릴게요.",
      "",
      "마지막에 30분 화상 미팅으로 수정 방향을 함께 정리하면 바로 실행하실 수 있을 거예요.",
    ].join("\n"),
    status: "COMPLETED",
    createdMinutesAgo: 26 * D,
    availableDates: [[-23, "21:00"]],
  },
  {
    id: 423,
    ticketId: 303,
    expertProfileId: 208,
    price: 60_000,
    proposedDuration: "NEGOTIABLE",
    method: "ONLINE",
    onlineTool: "카카오톡 이미지 피드백",
    appeal: "로고를 실제 컵과 간판에 합성한 목업 사진으로 보여드리면서 피드백 드릴게요.",
    status: "REJECTED",
    createdMinutesAgo: 25 * D + 10 * H,
  },
  // ─── ME 보조 의뢰 305 / 306 ───────────────────────────────────────────────
  {
    id: 406,
    ticketId: 305,
    expertProfileId: 206,
    price: 70_000,
    proposedDuration: "ONE_HOUR",
    method: "ONLINE",
    onlineTool: "Zoom 화상 (녹화본 제공)",
    appeal:
      "외국계 IT 기업 인사팀에서 5년간 면접을 진행했어요. 프론트엔드 직무 단골 질문으로 실전처럼 진행하고, 녹화본과 답변별 피드백 시트를 드릴게요.",
    status: "SELECTED",
    createdMinutesAgo: 3 * D + 5 * H,
    availableDates: [[1, "21:00"]],
  },
  {
    id: 407,
    ticketId: 306,
    expertProfileId: 207,
    price: 75_000,
    proposedDuration: "TWO_HOUR",
    method: "OFFLINE",
    locationProposal: "용산구 한강로 베이킹수아 공방",
    appeal:
      "꼬끄가 갈라지는 건 대부분 머랭 상태나 건조 시간 문제예요. 공방에서 같은 재료로 한 판 같이 구우면서 원인을 바로 찾아드릴게요.",
    status: "COMPLETED",
    createdMinutesAgo: 43 * D,
    availableDates: [[-38, "13:00"]],
  },
  // ─── ME 가 전문가로 보낸 제안 ─────────────────────────────────────────────
  {
    id: 411,
    ticketId: 311,
    expertProfileId: ME.expertProfileId,
    price: 120_000,
    proposedDuration: "NEGOTIABLE",
    method: "ONLINE",
    onlineTool: "구글 드라이브 공유 + 채팅 피드백",
    appeal: [
      "여행 브이로그는 장소 전환이 많아서 챕터 구성이 핵심이에요. Day별 챕터 타이틀과 지도 애니메이션을 넣어 보기 편하게 구성해 드릴게요.",
      "",
      "썸네일용 스틸컷 3장도 색보정해서 함께 드립니다.",
    ].join("\n"),
    status: "SELECTED",
    createdMinutesAgo: 7 * D + 4 * H,
    availableDates: [[-6, "20:00"]],
  },
  {
    id: 412,
    ticketId: 312,
    expertProfileId: ME.expertProfileId,
    price: 60_000,
    proposedDuration: "NEGOTIABLE",
    method: "ONLINE",
    onlineTool: "구글 드라이브 공유",
    appeal: [
      "채용 제출용 영상은 '깔끔함'이 전부예요. 3테이크 중 가장 좋은 구간만 골라 이어 붙이고, 가독성 좋은 하단 자막과 잔잔한 BGM으로 정리해 드릴게요.",
      "",
      "수정은 2회까지 무료로 반영해 드립니다.",
    ].join("\n"),
    status: "PENDING",
    createdMinutesAgo: 18 * H,
    availableDates: [
      [1, "20:00"],
      [2, "20:00"],
    ],
  },
  {
    id: 413,
    ticketId: 313,
    expertProfileId: ME.expertProfileId,
    price: 90_000,
    proposedDuration: "NEGOTIABLE",
    method: "ONLINE",
    onlineTool: "구글 드라이브 공유",
    appeal:
      "멀티캠 싱크는 오디오 파형 기준으로 프레임 단위까지 맞춰드려요. 곡 구성에 맞춰 손 클로즈업 전환 타이밍을 잡아 드릴게요.",
    status: "COMPLETED",
    createdMinutesAgo: 18 * D,
  },
  {
    id: 414,
    ticketId: 318,
    expertProfileId: ME.expertProfileId,
    price: 100_000,
    proposedDuration: "TWO_HOUR",
    method: "ONLINE",
    onlineTool: "Zoom 화면 공유 (프로젝트 파일 제공)",
    appeal:
      "자막 모션 템플릿을 직접 만들어 쓰고 있어요. 키프레임 · 그래프 에디터 · 텍스트 애니메이터를 순서대로 따라 하면서 5초 인트로를 완성하고, 프로젝트 파일도 드릴게요.",
    status: "PENDING",
    createdMinutesAgo: 26 * H,
    availableDates: [
      [2, "21:00"],
      [4, "21:00"],
    ],
  },
  {
    id: 415,
    ticketId: 309,
    expertProfileId: ME.expertProfileId,
    price: 100_000,
    proposedDuration: "NEGOTIABLE",
    method: "ONLINE",
    onlineTool: "구글 드라이브 공유",
    appeal:
      "매장 TV용 가로 버전과 인스타그램용 세로 버전을 함께 만들어 드릴게요. 1년의 계절 변화가 느껴지도록 구성하겠습니다.",
    status: "COMPLETED",
    createdMinutesAgo: 33 * D,
  },
]

const seedById = (id: number) => SEEDS.find((s) => s.id === id)

function clientNickname(clientId: number): string {
  if (clientId === ME.userId) return ME.nickname
  return CLIENTS.find((c) => c.userId === clientId)?.nickname ?? "의뢰인"
}

// ─── Builders ────────────────────────────────────────────────────────────────

function availableDates(seed: ProposalSeed) {
  return (seed.availableDates ?? []).map(([offset, timeSlot]) => ({
    availableDate: localDate(offset),
    timeSlot,
  }))
}

function buildDetail(seed: ProposalSeed): ProposalDetailFixture {
  const expert = expertById(seed.expertProfileId)
  return {
    id: seed.id,
    price: seed.price,
    proposedDuration: seed.proposedDuration,
    method: seed.method,
    locationProposal: seed.locationProposal ?? null,
    onlineTool: seed.onlineTool ?? null,
    appeal: seed.appeal,
    status: seed.status,
    createdAt: localDateTime(-seed.createdMinutesAgo),
    availableDates: availableDates(seed),
    expertInfo: expertInfo(seed.expertProfileId),
    ticketId: seed.ticketId,
    expertProfileId: expert.expertProfileId,
    expertNickname: expert.nickname,
    expertProfileImageUrl: expert.profileImageUrl,
  }
}

function buildSummary(seed: ProposalSeed): ProposalSummaryFixture {
  const expert = expertById(seed.expertProfileId)
  return {
    id: seed.id,
    expertProfileId: expert.expertProfileId,
    expertNickname: expert.nickname,
    expertProfileImageUrl: expert.profileImageUrl,
    price: seed.price,
    proposedDuration: seed.proposedDuration,
    method: seed.method,
    status: seed.status,
    ticketId: seed.ticketId,
    createdAt: localDateTime(-seed.createdMinutesAgo),
  }
}

function buildMyProposal(seed: ProposalSeed): MyProposalFixture {
  const ticket = ticketMeta(seed.ticketId)
  return {
    id: seed.id,
    ticketTitle: ticket?.title ?? null,
    subCategoryName: ticket?.subCategoryName ?? null,
    ticketType: ticket?.ticketType ?? null,
    clientNickname: ticket ? clientNickname(ticket.clientId) : null,
    status: seed.status,
    price: seed.price,
    // 웹 카드(MyProposalCard)가 createdAt 을 가공 없이 그대로 출력하므로 날짜만 내린다.
    createdAt: localDate(-Math.floor(seed.createdMinutesAgo / D)),
  }
}

function buildMyProposalDetail(seed: ProposalSeed): MyProposalDetailFixture {
  const ticket = ticketMeta(seed.ticketId)
  return {
    id: seed.id,
    price: seed.price,
    proposedDuration: seed.proposedDuration,
    method: seed.method,
    locationProposal: seed.locationProposal ?? null,
    onlineTool: seed.onlineTool ?? null,
    appeal: seed.appeal,
    status: seed.status,
    createdAt: localDateTime(-seed.createdMinutesAgo),
    availableDates: availableDates(seed),
    ticketInfo: ticket
      ? {
          ticketId: ticket.id,
          title: ticket.title,
          content: ticket.content,
          ticketType: ticket.ticketType,
          subCategoryName: ticket.subCategoryName,
          level: ticket.level,
          desiredDuration: ticket.desiredDuration,
          budgetType: ticket.budgetType,
          budgetMin: ticket.budgetMin,
          budgetMax: ticket.budgetMax,
          region: ticket.region,
          locationDetail: ticket.locationDetail,
          ticketStatus: ticket.status,
          clientNickname: clientNickname(ticket.clientId),
          deadline: ticket.deadline,
          createdAt: ticket.createdAt,
        }
      : null,
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function findProposalDetail(id: number): ProposalDetailFixture | null {
  const seed = seedById(id)
  return seed ? buildDetail(seed) : null
}

export function findMyProposalDetail(id: number): MyProposalDetailFixture | null {
  const seed = seedById(id)
  if (!seed || seed.expertProfileId !== ME.expertProfileId) return null
  return buildMyProposalDetail(seed)
}

export function proposalsByTicket(ticketId: number): ProposalSummaryFixture[] {
  return SEEDS.filter((s) => s.ticketId === ticketId)
    .sort((a, b) => b.createdMinutesAgo - a.createdMinutesAgo)
    .map(buildSummary)
}

const mine = () =>
  SEEDS.filter((s) => s.expertProfileId === ME.expertProfileId).sort(
    (a, b) => a.createdMinutesAgo - b.createdMinutesAgo,
  )

export function myInProgressProposals(): MyProposalFixture[] {
  return mine()
    .filter((s) => s.status === "PENDING" || s.status === "SELECTED")
    .map(buildMyProposal)
}

export function myCompletedProposals(): MyProposalFixture[] {
  return mine()
    .filter((s) => s.status !== "PENDING" && s.status !== "SELECTED")
    .map(buildMyProposal)
}

/** POST /proposal — 요청 본문을 반영한 신규 제안 (ME 전문가 시점) */
export function createdProposal(body: Record<string, unknown>): ProposalDetailFixture {
  const ticketId = typeof body.ticketId === "number" ? body.ticketId : 312
  const ticket = ticketMeta(ticketId)
  const durations: Duration[] = [
    "THIRTY_MIN",
    "ONE_HOUR",
    "ONE_HALF_HOUR",
    "TWO_HOUR",
    "NEGOTIABLE",
  ]
  const proposedDuration = durations.find((d) => d === body.proposedDuration) ?? "NEGOTIABLE"
  const dates = Array.isArray(body.availableDates)
    ? body.availableDates
        .filter(
          (d): d is { availableDate: string; timeSlot: string } =>
            typeof d === "object" &&
            d != null &&
            typeof (d as Record<string, unknown>).availableDate === "string" &&
            typeof (d as Record<string, unknown>).timeSlot === "string",
        )
        .map((d) => ({ availableDate: d.availableDate, timeSlot: d.timeSlot }))
    : []
  return {
    ...buildDetail({
      id: PROPOSAL_CREATED_ID,
      ticketId,
      expertProfileId: ME.expertProfileId,
      price: typeof body.price === "number" ? body.price : 50_000,
      proposedDuration,
      method: ticket?.ticketType ?? "ONLINE",
      locationProposal:
        typeof body.locationProposal === "string" ? body.locationProposal : undefined,
      onlineTool: typeof body.onlineTool === "string" ? body.onlineTool : undefined,
      appeal: typeof body.appeal === "string" ? body.appeal : "",
      status: "PENDING",
      createdMinutesAgo: 0,
    }),
    availableDates: dates,
  }
}

/** 제안 수락 → 채팅방 ID (`room-{ticketId}` 규칙, world.ts SCENARIO 와 동일) */
export function chatRoomIdForProposal(proposalId: number): string {
  const seed = seedById(proposalId)
  return `room-${seed?.ticketId ?? proposalId}`
}

/** 다른 도메인에서 참고할 수 있는 합의 금액 (제안 금액 = 합의 기준가) */
export const PROPOSAL_PRICES = Object.fromEntries(SEEDS.map((s) => [s.id, s.price])) as Record<
  number,
  number
>
