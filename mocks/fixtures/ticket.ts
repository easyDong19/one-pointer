import type { z } from "zod/v4"
import type {
  myTicketSchema,
  ticketDetailSchema,
  ticketFeedItemSchema,
} from "@/entities/ticket/api/ticket.schema"
import type { bannerSchema } from "@/entities/banner/api/banner.schema"
import { asset } from "../lib/assets"
import { localDate, localDateTime } from "../lib/time"
import { CLIENTS, ME, subCategoryById } from "../world"

/**
 * 의뢰(ticket) 픽스처.
 *
 * - 시각은 요청 시점 기준 상대값이라 `buildTickets()` 를 매 요청마다 호출한다.
 * - world.ts 의 SCENARIO ID(301~303, 311~314) + 공개 피드(315~329) + 이 파일 전용 보조 의뢰
 *   (304~309: 마이페이지 탭/직접요청 목록을 채우기 위한 ME 관련 의뢰) 로 구성.
 */

export type TicketDetailFixture = z.input<typeof ticketDetailSchema>
export type TicketFeedFixture = z.input<typeof ticketFeedItemSchema>
export type MyTicketFixture = z.input<typeof myTicketSchema>
export type BannerFixture = z.input<typeof bannerSchema>

type Status = TicketDetailFixture["status"]
type Level = TicketDetailFixture["level"]
type Unit = NonNullable<TicketDetailFixture["estimatedDurationUnit"]>

const MINUTES_PER_DAY = 60 * 24

/** 이 파일에서만 쓰는 보조 ID (world.ts 는 수정하지 않는다) */
export const TICKET_EXTRA = {
  /** ME 의 모집중 의뢰 (제안 0건) */
  myOpenPilates: 304,
  /** ME 의 진행중 의뢰 — 제니스잉글리시(206) 매칭, proposal 406 */
  myInProgressEnglish: 305,
  /** ME 의 완료 의뢰 — 베이킹수아(207), proposal 407 */
  myCompletedBaking: 306,
  /** ME 가 포토태오(208) 에게 보낸 직접 요청 */
  mySentDirectRequest: 307,
  /** 러닝크루장 → ME(전문가) 직접 요청 */
  receivedDirectRequest: 308,
  /** 카페사장님 의뢰, ME 가 전문가로 완료 (proposal 415) */
  expertCompletedCafe: 309,
  /** POST /v1/api/ticket 응답용 신규 의뢰 ID */
  created: 330,
} as const

// ─── Seed 정의 ────────────────────────────────────────────────────────────────

type TicketSeed = {
  id: number
  clientId: number
  subCategoryId: number
  ticketType: "ONLINE" | "OFFLINE"
  title: string
  content: string
  level: Level
  /** null 이면 소요 시간 협의 */
  duration: [number, Unit] | null
  /** null 이면 가격 협의 */
  budget: [number, number] | null
  region?: string
  locationDetail?: string
  /** 마감까지 남은 일 (음수면 마감 지남) */
  deadlineInDays: number
  status: Status
  sourceType?: "TICKET_FEED" | "DIRECT_REQUEST"
  targetExpertId?: number
  matchedDaysAgo?: number
  createdMinutesAgo: number
  /** [오늘 기준 일 오프셋, "HH:mm"] */
  desiredDates?: [number, string][]
  /** 이미지 라벨 (asset cover 로 렌더) */
  images: string[]
  proposalCount: number
}

const H = 60
const D = MINUTES_PER_DAY

const SEEDS: TicketSeed[] = [
  // ─── HERO (ME 의뢰인) ─────────────────────────────────────────────────────
  {
    id: 301,
    clientId: ME.userId,
    subCategoryId: 21,
    ticketType: "ONLINE",
    title: "유튜브 브이로그 영상 편집 (10분 내외)",
    content: [
      "주말마다 찍어둔 일상 브이로그 원본이 40분 정도 있어요. 10분 내외로 컷편집하고 자막, BGM까지 넣어주실 분을 찾습니다.",
      "",
      "- 원본: 아이폰 4K 촬영, 클립 23개 (구글 드라이브로 공유드릴게요)",
      "- 톤: 잔잔하고 따뜻한 감성 (참고 채널은 채팅으로 보내드릴게요)",
      "- 자막: 말하는 부분 전체 + 포인트 자막 조금",
      "- BGM: 저작권 걱정 없는 무료 음원으로 부탁드려요",
      "",
      "편집하시면서 컷을 어떤 기준으로 자르는지, 자막 스타일은 어떻게 잡는지도 간단히 알려주시면 다음 영상부터는 혼자 해보려고 해요!",
    ].join("\n"),
    level: "BEGINNER",
    duration: [3, "DAY"],
    budget: [100_000, 200_000],
    deadlineInDays: -6,
    status: "DELIVERED",
    matchedDaysAgo: 5,
    createdMinutesAgo: 9 * D + 3 * H,
    images: ["브이로그 원본 캡처", "참고 썸네일 톤"],
    proposalCount: 3,
  },
  // ─── GUITAR (ME 의뢰인, 모집중) ───────────────────────────────────────────
  {
    id: 302,
    clientId: ME.userId,
    subCategoryId: 11,
    ticketType: "OFFLINE",
    title: "통기타 핑거스타일 원포인트 레슨",
    content: [
      "기타 독학 1년 차인데, 핑거스타일로 넘어가면서 완전히 막혔어요.",
      "",
      "- 지금 연습 중인 곡: 코타로 오시오 '황혼', 유튜브에서 받은 동요 메들리 편곡",
      "- 엄지로 베이스를 치면서 멜로디를 잡으면 박자가 따로 놀아요",
      "- 손톱 관리나 오른손 피킹 자세도 같이 봐주시면 좋겠어요",
      "",
      "한 번의 레슨으로 제 습관 중 꼭 고쳐야 할 것만 딱 짚어주시고, 혼자 연습할 루틴을 잡아주실 분을 찾습니다. 기타는 제 것 들고 갈게요!",
    ].join("\n"),
    level: "BEGINNER",
    duration: [2, "HOUR"],
    budget: [50_000, 80_000],
    region: "서울 마포구",
    locationDetail: "합정역 인근 연습실 (대관비는 제가 부담할게요)",
    deadlineInDays: 4,
    status: "OPEN",
    createdMinutesAgo: 26 * H,
    desiredDates: [
      [3, "19:00"],
      [5, "14:00"],
      [6, "10:30"],
    ],
    images: ["내 기타 · 연습 노트"],
    proposalCount: 3,
  },
  // ─── LOGO (ME 의뢰인, 완료) ───────────────────────────────────────────────
  {
    id: 303,
    clientId: ME.userId,
    subCategoryId: 41,
    ticketType: "ONLINE",
    title: "카페 로고 디자인 원포인트 피드백",
    content: [
      "동네에 작은 카페를 준비하고 있는데, 직접 그려본 로고 시안이 3개 있어요. 어떤 방향이 좋을지, 폰트와 색 조합은 어떻게 다듬으면 좋을지 전문가 피드백을 받고 싶습니다.",
      "",
      "- 카페 이름: 오후세시",
      "- 컨셉: 따뜻한 우드톤, 동네 사랑방 같은 느낌",
      "- 간판, 컵 슬리브, 인스타 프로필에 모두 쓸 예정이에요",
      "",
      "최종 파일 작업까지는 필요 없고, 시안 중 하나를 골라 수정 방향만 잡아주시면 됩니다.",
    ].join("\n"),
    level: "BEGINNER",
    duration: [2, "DAY"],
    budget: [50_000, 100_000],
    deadlineInDays: -24,
    status: "COMPLETED",
    matchedDaysAgo: 22,
    createdMinutesAgo: 27 * D,
    images: ["로고 시안 A", "로고 시안 B", "오후세시 무드보드"],
    proposalCount: 2,
  },
  // ─── ME 보조 의뢰 ─────────────────────────────────────────────────────────
  {
    id: TICKET_EXTRA.myOpenPilates,
    clientId: ME.userId,
    subCategoryId: 31,
    ticketType: "OFFLINE",
    title: "거북목 · 라운드숄더 교정 필라테스 1:1 체험",
    content: [
      "하루 10시간 넘게 앉아서 일하다 보니 거북목이 심해졌어요. 필라테스는 처음인데, 1회 레슨으로 제 자세를 진단받고 집에서 할 수 있는 스트레칭 루틴을 배우고 싶어요.",
      "",
      "- 기구 필라테스 / 매트 모두 괜찮아요",
      "- 평일 저녁이나 주말 오전 선호합니다",
    ].join("\n"),
    level: "BEGINNER",
    duration: [1, "HOUR"],
    budget: [40_000, 60_000],
    region: "서울 마포구",
    locationDetail: "공덕역 근처 스튜디오 희망",
    deadlineInDays: 6,
    status: "OPEN",
    createdMinutesAgo: 3 * H,
    desiredDates: [
      [4, "20:00"],
      [7, "10:00"],
    ],
    images: ["자세 체크 사진"],
    proposalCount: 0,
  },
  {
    id: TICKET_EXTRA.myInProgressEnglish,
    clientId: ME.userId,
    subCategoryId: 51,
    ticketType: "ONLINE",
    title: "외국계 기업 영어 면접 모의 인터뷰 1회",
    content: [
      "다음 주에 외국계 IT 기업 2차 영어 면접이 있어요. 실제 면접처럼 모의 인터뷰를 진행하고, 답변 구조와 표현을 피드백 받고 싶습니다.",
      "",
      "- 직무: 프론트엔드 개발자",
      "- 준비한 자기소개 / 경험 답변 스크립트 있어요",
      "- 녹화본을 받아서 다시 볼 수 있으면 좋겠어요",
    ].join("\n"),
    level: "INTERMEDIATE",
    duration: [1, "HOUR"],
    budget: [50_000, 80_000],
    deadlineInDays: -1,
    status: "IN_PROGRESS",
    matchedDaysAgo: 2,
    createdMinutesAgo: 4 * D,
    images: ["면접 답변 스크립트"],
    proposalCount: 1,
  },
  {
    id: TICKET_EXTRA.myCompletedBaking,
    clientId: ME.userId,
    subCategoryId: 61,
    ticketType: "OFFLINE",
    title: "마카롱 꼬끄가 자꾸 터져요 (원인 잡아주실 분)",
    content: [
      "마카롱을 다섯 번 구웠는데 매번 꼬끄가 갈라지고 피에가 안 올라와요. 머랭부터 마카로나주, 건조까지 옆에서 보시고 원인을 짚어주실 분 찾습니다.",
    ].join("\n"),
    level: "BEGINNER",
    duration: [2, "HOUR"],
    budget: [60_000, 90_000],
    region: "서울 용산구",
    locationDetail: "전문가님 공방 방문 희망",
    deadlineInDays: -40,
    status: "COMPLETED",
    matchedDaysAgo: 41,
    createdMinutesAgo: 45 * D,
    desiredDates: [[-38, "13:00"]],
    images: ["실패한 꼬끄 사진"],
    proposalCount: 1,
  },
  {
    id: TICKET_EXTRA.mySentDirectRequest,
    clientId: ME.userId,
    subCategoryId: 42,
    ticketType: "ONLINE",
    title: "프로필 사진 라이트룸 보정 + 나만의 프리셋 만들기",
    content: [
      "포토태오님 포트폴리오 보고 직접 요청드려요! 지인이 찍어준 프로필 사진 5장을 라이트룸으로 보정하는 과정을 보여주시고, 제 톤에 맞는 프리셋을 같이 만들고 싶어요.",
    ].join("\n"),
    level: "BEGINNER",
    duration: [1, "HOUR"],
    budget: [40_000, 70_000],
    deadlineInDays: 5,
    status: "OPEN",
    sourceType: "DIRECT_REQUEST",
    targetExpertId: 208,
    createdMinutesAgo: 5 * H,
    images: ["프로필 원본"],
    proposalCount: 0,
  },
  // ─── ME 가 전문가로 참여한 의뢰 ──────────────────────────────────────────
  {
    id: TICKET_EXTRA.receivedDirectRequest,
    clientId: CLIENTS[4].userId,
    subCategoryId: 21,
    ticketType: "ONLINE",
    title: "러닝크루 3주년 하이라이트 영상 편집 (3분)",
    content: [
      "크루원들이 1년 동안 찍은 대회·정기런 영상을 모아서 3분짜리 하이라이트로 만들고 싶어요. 원포인터님 포트폴리오에서 자막 디자인 보고 반해서 직접 요청드립니다!",
      "",
      "- 원본: 휴대폰 영상 약 60개 (총 2시간 분량)",
      "- 크루 로고 인트로 + 엔딩 크레딧 필요",
    ].join("\n"),
    level: "INTERMEDIATE",
    duration: [5, "DAY"],
    budget: [150_000, 250_000],
    deadlineInDays: 6,
    status: "OPEN",
    sourceType: "DIRECT_REQUEST",
    targetExpertId: ME.expertProfileId,
    createdMinutesAgo: 22 * H,
    images: ["크루 정기런 스틸컷"],
    proposalCount: 0,
  },
  {
    id: TICKET_EXTRA.expertCompletedCafe,
    clientId: CLIENTS[2].userId,
    subCategoryId: 21,
    ticketType: "ONLINE",
    title: "카페 오픈 1주년 기념 영상 컷편집",
    content: [
      "카페 1년 동안의 사진과 영상을 모아 1분 내외 기념 영상을 만들고 싶어요. 매장 TV와 인스타그램에 올릴 예정입니다.",
    ].join("\n"),
    level: "BEGINNER",
    duration: [3, "DAY"],
    budget: [80_000, 120_000],
    deadlineInDays: -30,
    status: "COMPLETED",
    matchedDaysAgo: 31,
    createdMinutesAgo: 34 * D,
    images: ["카페 1주년"],
    proposalCount: 3,
  },
  {
    id: 311,
    clientId: CLIENTS[0].userId,
    subCategoryId: 21,
    ticketType: "ONLINE",
    title: "제주 3박 4일 여행 브이로그 컷편집 + 자막",
    content: [
      "제주 여행 다녀와서 찍은 영상이 1시간 30분 정도 있어요. 15분 내외 여행 브이로그로 편집 부탁드립니다.",
      "",
      "- 날짜별로 챕터 나눠주세요 (Day 1 ~ Day 4)",
      "- 자막은 예능 느낌보다는 깔끔한 스타일 선호해요",
      "- 썸네일용 스틸컷도 3장 정도 뽑아주시면 감사하겠습니다",
    ].join("\n"),
    level: "BEGINNER",
    duration: [4, "DAY"],
    budget: [100_000, 150_000],
    deadlineInDays: -3,
    status: "IN_PROGRESS",
    matchedDaysAgo: 3,
    createdMinutesAgo: 8 * D,
    images: ["제주 협재 해변", "성산일출봉 클립"],
    proposalCount: 4,
  },
  {
    id: 312,
    clientId: CLIENTS[3].userId,
    subCategoryId: 21,
    ticketType: "ONLINE",
    title: "자기소개 영상 편집 (1분 30초, 자막 · BGM 포함)",
    content: [
      "채용 지원용 1분 30초 자기소개 영상을 찍었어요. 군더더기 컷 정리하고, 깔끔한 자막과 잔잔한 BGM을 넣어주실 분 구합니다.",
      "",
      "- 원본 3테이크, 각 3분 내외",
      "- 회사 제출용이라 과한 효과는 빼주세요",
    ].join("\n"),
    level: "BEGINNER",
    duration: [2, "DAY"],
    budget: [50_000, 80_000],
    deadlineInDays: 3,
    status: "OPEN",
    createdMinutesAgo: 20 * H,
    images: ["자기소개 촬영 스틸"],
    proposalCount: 2,
  },
  {
    id: 313,
    clientId: CLIENTS[1].userId,
    subCategoryId: 21,
    ticketType: "ONLINE",
    title: "기타 커버 영상 멀티캠 싱크 편집",
    content: [
      "정면 / 손 클로즈업 / 측면 카메라 3대로 기타 커버를 찍었어요. 오디오 싱크 맞춰서 화면 전환 들어간 커버 영상으로 만들어 주세요.",
    ].join("\n"),
    level: "INTERMEDIATE",
    duration: [3, "DAY"],
    budget: [70_000, 100_000],
    deadlineInDays: -15,
    status: "COMPLETED",
    matchedDaysAgo: 16,
    createdMinutesAgo: 19 * D,
    images: ["멀티캠 촬영 세팅"],
    proposalCount: 3,
  },
  {
    id: 314,
    clientId: CLIENTS[2].userId,
    subCategoryId: 21,
    ticketType: "ONLINE",
    title: "카페 홍보 릴스 영상 편집 (30초 × 3편)",
    content: [
      "지난번에 1주년 영상 맡겨드렸던 카페 사장입니다! 이번엔 신메뉴 홍보용 인스타 릴스 3편을 부탁드리고 싶어서 직접 요청드려요.",
      "",
      "- 편당 30초, 세로 9:16",
      "- 메뉴 제조 과정 클로즈업 위주",
      "- 트렌디한 자막 + 비트에 맞춘 컷 전환 원해요",
    ].join("\n"),
    level: "INTERMEDIATE",
    duration: [1, "WEEK"],
    budget: [150_000, 300_000],
    deadlineInDays: 5,
    status: "OPEN",
    sourceType: "DIRECT_REQUEST",
    targetExpertId: ME.expertProfileId,
    createdMinutesAgo: 3 * H + 20,
    images: ["신메뉴 크림라떼", "매장 분위기 컷"],
    proposalCount: 0,
  },
  // ─── 공개 피드 (315~329) ──────────────────────────────────────────────────
  {
    id: 315,
    clientId: CLIENTS[3].userId,
    subCategoryId: 12,
    ticketType: "OFFLINE",
    title: "친구 결혼식 축가 피아노 반주 원포인트 코칭",
    content:
      "3주 뒤 친구 결혼식에서 축가 반주를 맡았어요. 악보는 있는데 템포 유지랑 페달 쓰는 게 불안해서, 한 번 들어보시고 포인트만 잡아주셨으면 합니다.",
    level: "INTERMEDIATE",
    duration: [1, "HOUR"],
    budget: [60_000, 100_000],
    region: "서울 강남구",
    locationDetail: "신논현역 근처 피아노 연습실",
    deadlineInDays: 5,
    status: "OPEN",
    createdMinutesAgo: 40,
    desiredDates: [
      [2, "19:30"],
      [3, "20:00"],
    ],
    images: ["축가 악보"],
    proposalCount: 2,
  },
  {
    id: 316,
    clientId: CLIENTS[1].userId,
    subCategoryId: 13,
    ticketType: "ONLINE",
    title: "보컬 녹음본 피드백 받고 싶어요 (호흡 · 발성 위주)",
    content:
      "취미로 노래 커버를 올리고 있어요. 녹음본 3곡을 보내드리면 호흡이 짧아지는 구간이랑 고음에서 목 조이는 부분을 짚어주시고, 연습 방법을 알려주세요.",
    level: "BEGINNER",
    duration: [1, "HOUR"],
    budget: [30_000, 50_000],
    deadlineInDays: 2,
    status: "OPEN",
    createdMinutesAgo: 5 * H,
    images: ["홈레코딩 세팅"],
    proposalCount: 4,
  },
  {
    id: 317,
    clientId: CLIENTS[2].userId,
    subCategoryId: 22,
    ticketType: "OFFLINE",
    title: "스마트스토어 제품 촬영 조명 세팅 원포인트",
    content:
      "핸드메이드 캔들을 스마트스토어에서 팔고 있는데 사진이 너무 어둡게 나와요. 작업실에 있는 조명 2개랑 미러리스로 쓸 수 있는 세팅을 잡아주시면 좋겠어요.",
    level: "BEGINNER",
    duration: [2, "HOUR"],
    budget: [150_000, 250_000],
    region: "서울 성동구",
    locationDetail: "성수동 작업실 (출장 요청)",
    deadlineInDays: 7,
    status: "OPEN",
    createdMinutesAgo: 2 * D + 2 * H,
    desiredDates: [[8, "11:00"]],
    images: ["캔들 제품 샘플"],
    proposalCount: 3,
  },
  {
    id: 318,
    clientId: CLIENTS[0].userId,
    subCategoryId: 23,
    ticketType: "ONLINE",
    title: "애프터이펙트로 채널 인트로 타이틀 모션 만들기 1:1",
    content:
      "유튜브 채널 인트로에 쓸 5초짜리 타이틀 모션을 직접 만들어 보고 싶어요. 화면 공유로 키프레임, 이징, 텍스트 애니메이터 쓰는 법을 같이 따라 하면서 배우고 싶습니다.",
    level: "INTERMEDIATE",
    duration: [2, "HOUR"],
    budget: [80_000, 120_000],
    deadlineInDays: 9,
    status: "OPEN",
    createdMinutesAgo: 30 * H,
    images: ["인트로 레퍼런스"],
    proposalCount: 5,
  },
  {
    id: 319,
    clientId: CLIENTS[4].userId,
    subCategoryId: 32,
    ticketType: "OFFLINE",
    title: "요가 왕초보, 기본 자세 교정 1회 레슨",
    content:
      "유튜브 보면서 혼자 요가를 한 달 해봤는데 다운독 자세가 맞는지 모르겠어요. 기본 자세 5~6개만 제대로 잡아주실 분 찾아요.",
    level: "BEGINNER",
    duration: [1, "HOUR"],
    budget: [40_000, 60_000],
    region: "서울 송파구",
    locationDetail: "잠실역 인근 요가원 또는 공원",
    deadlineInDays: 1,
    status: "OPEN",
    createdMinutesAgo: 3 * D,
    desiredDates: [[2, "07:00"]],
    images: ["요가 매트"],
    proposalCount: 6,
  },
  {
    id: 320,
    clientId: CLIENTS[4].userId,
    subCategoryId: 33,
    ticketType: "OFFLINE",
    title: "하프마라톤 대비 러닝 자세 분석 + 페이스 전략",
    content:
      "다음 달 하프마라톤 첫 출전이에요. 여의도에서 같이 5km 정도 뛰면서 자세를 봐주시고, 대회 당일 페이스 전략까지 잡아주시면 좋겠습니다.",
    level: "INTERMEDIATE",
    duration: [1, "HOUR"],
    budget: [50_000, 80_000],
    region: "서울 영등포구",
    locationDetail: "여의도한강공원 물빛광장",
    deadlineInDays: 4,
    status: "OPEN",
    createdMinutesAgo: 9 * H,
    desiredDates: [
      [5, "07:00"],
      [6, "07:00"],
    ],
    images: ["한강 러닝 코스"],
    proposalCount: 2,
  },
  {
    id: 321,
    clientId: CLIENTS[0].userId,
    subCategoryId: 42,
    ticketType: "ONLINE",
    title: "여행 사진 라이트룸 보정 노하우 알려주세요",
    content:
      "여행 사진 색감이 늘 밋밋해요. 제 사진 10장 정도를 같이 보정하면서 HSL, 톤커브 쓰는 법을 배우고 싶어요.",
    level: "BEGINNER",
    duration: [1, "HOUR"],
    budget: [30_000, 50_000],
    deadlineInDays: 6,
    status: "OPEN",
    createdMinutesAgo: 14 * H,
    images: ["여행 사진 Before"],
    proposalCount: 3,
  },
  {
    id: 322,
    clientId: CLIENTS[3].userId,
    subCategoryId: 43,
    ticketType: "ONLINE",
    title: "포트폴리오용 앱 UI 디자인 리뷰 (피그마)",
    content:
      "UX/UI 디자이너 취업 준비 중이에요. 포트폴리오에 넣을 가계부 앱 화면 12장을 피그마로 공유드리면, 현업 시선으로 레이아웃과 컴포넌트 구조를 리뷰해 주세요.",
    level: "INTERMEDIATE",
    duration: [2, "HOUR"],
    budget: [100_000, 200_000],
    deadlineInDays: 8,
    status: "OPEN",
    createdMinutesAgo: 2 * D + 6 * H,
    images: ["가계부 앱 시안"],
    proposalCount: 4,
  },
  {
    id: 323,
    clientId: CLIENTS[3].userId,
    subCategoryId: 51,
    ticketType: "ONLINE",
    title: "영어 PT 면접 리허설 + 발표 피드백",
    content:
      "영어 PT 면접(10분 발표 + 5분 Q&A)을 앞두고 있어요. 실전처럼 리허설하고 발음, 전달력, 예상 질문 대응까지 피드백 받고 싶어요.",
    level: "ADVANCED",
    duration: [90, "MINUTE"],
    budget: [50_000, 80_000],
    deadlineInDays: 2,
    status: "OPEN",
    createdMinutesAgo: 7 * H,
    images: ["발표 슬라이드"],
    proposalCount: 3,
  },
  {
    id: 324,
    clientId: CLIENTS[1].userId,
    subCategoryId: 52,
    ticketType: "ONLINE",
    title: "일본 워홀 출국 전 일본어 회화 집중 점검",
    content:
      "JLPT N3는 있는데 막상 말하려고 하면 입이 안 떨어져요. 집 구하기, 아르바이트 면접 같은 실전 상황 롤플레이로 점검받고 싶습니다.",
    level: "INTERMEDIATE",
    duration: null,
    budget: null,
    deadlineInDays: 10,
    status: "OPEN",
    createdMinutesAgo: 4 * D,
    images: ["워홀 준비 노트"],
    proposalCount: 1,
  },
  {
    id: 325,
    clientId: CLIENTS[3].userId,
    subCategoryId: 62,
    ticketType: "OFFLINE",
    title: "자취생 일주일 밀프렙 원포인트 클래스",
    content:
      "매일 배달만 시켜 먹다가 식비가 감당이 안 돼요. 장보기 리스트부터 한 번에 5일 치 도시락 만드는 동선까지 배우고 싶어요. 재료비는 따로 드릴게요.",
    level: "BEGINNER",
    duration: [2, "HOUR"],
    budget: [40_000, 70_000],
    region: "서울 관악구",
    locationDetail: "신림역 근처 공유주방",
    deadlineInDays: 3,
    status: "OPEN",
    createdMinutesAgo: 50 * H,
    desiredDates: [[4, "11:00"]],
    images: ["밀프렙 도시락"],
    proposalCount: 2,
  },
  {
    id: 326,
    clientId: CLIENTS[0].userId,
    subCategoryId: 63,
    ticketType: "OFFLINE",
    title: "가죽 카드지갑 만들기 원포인트 (바느질 위주)",
    content:
      "가죽 공예 키트를 샀는데 새들 스티치가 자꾸 삐뚤어져요. 카드지갑 하나를 같이 완성하면서 바느질 요령을 배우고 싶어요.",
    level: "BEGINNER",
    duration: [3, "HOUR"],
    budget: [50_000, 90_000],
    region: "서울 종로구",
    locationDetail: "익선동 공방",
    deadlineInDays: 12,
    status: "OPEN",
    createdMinutesAgo: 5 * D,
    desiredDates: [[13, "14:00"]],
    images: ["가죽 공예 키트"],
    proposalCount: 1,
  },
  {
    id: 327,
    clientId: CLIENTS[2].userId,
    subCategoryId: 41,
    ticketType: "ONLINE",
    title: "베이커리 패키지 스티커 로고 리디자인 상담",
    content:
      "직접 만든 로고를 2년째 쓰고 있는데 인쇄하면 선이 뭉개져요. 작은 사이즈에서도 잘 보이도록 수정 방향을 잡아주세요.",
    level: "BEGINNER",
    duration: [1, "DAY"],
    budget: [70_000, 150_000],
    deadlineInDays: 6,
    status: "OPEN",
    createdMinutesAgo: 11 * H,
    images: ["패키지 스티커"],
    proposalCount: 2,
  },
  {
    id: 328,
    clientId: CLIENTS[4].userId,
    subCategoryId: 53,
    ticketType: "ONLINE",
    title: "중국 출장 전 비즈니스 중국어 표현 정리",
    content:
      "다음 달 상하이 출장에서 간단한 미팅 인사와 식사 자리 표현을 써야 해요. 자주 쓰는 표현 위주로 1회 집중 코칭 부탁드려요.",
    level: "BEGINNER",
    duration: [1, "HOUR"],
    budget: [40_000, 60_000],
    deadlineInDays: 7,
    status: "OPEN",
    createdMinutesAgo: 6 * D,
    images: ["출장 일정표"],
    proposalCount: 0,
  },
  {
    id: 329,
    clientId: CLIENTS[1].userId,
    subCategoryId: 61,
    ticketType: "OFFLINE",
    title: "생일 케이크 아이싱 · 레터링 원데이 원포인트",
    content:
      "엄마 생신 케이크를 직접 만들어 드리고 싶어요. 시트는 구울 수 있는데 아이싱이 울퉁불퉁하고 레터링이 어려워요.",
    level: "BEGINNER",
    duration: [3, "HOUR"],
    budget: [70_000, 100_000],
    region: "서울 용산구",
    locationDetail: "숙대입구역 근처 베이킹 공방",
    deadlineInDays: 2,
    status: "OPEN",
    createdMinutesAgo: 90,
    desiredDates: [[3, "15:00"]],
    images: ["레터링 케이크"],
    proposalCount: 1,
  },
]

/** 공개 피드 · 검색 · 카테고리에 노출되는 의뢰 (직접 요청/진행중/완료 제외) */
const FEED_IDS = [
  302, 304, 312, 315, 316, 317, 318, 319, 320, 321, 322, 323, 324, 325, 326, 327, 328, 329,
]

// ─── Builders ────────────────────────────────────────────────────────────────

const UNIT_LABEL: Record<Unit, string> = {
  MINUTE: "분",
  HOUR: "시간",
  DAY: "일",
  WEEK: "주",
  MONTH: "개월",
}

function durationLabel(duration: TicketSeed["duration"]): string {
  if (!duration) return "협의"
  const [value, unit] = duration
  if (unit === "MINUTE" && value >= 60) {
    const h = Math.floor(value / 60)
    const m = value % 60
    return m ? `${h}시간 ${m}분` : `${h}시간`
  }
  return `${value}${UNIT_LABEL[unit]}`
}

function deadlineOf(days: number): string {
  return `${localDate(days)}T23:59:59`
}

function buildDetail(seed: TicketSeed): TicketDetailFixture {
  const { category, subCategory } = subCategoryById(seed.subCategoryId)
  return {
    id: seed.id,
    clientId: seed.clientId,
    subCategoryId: seed.subCategoryId,
    categoryName: category.name,
    subCategoryName: subCategory.name,
    ticketType: seed.ticketType,
    title: seed.title,
    content: seed.content,
    level: seed.level,
    desiredDuration: durationLabel(seed.duration),
    estimatedDurationValue: seed.duration?.[0] ?? null,
    estimatedDurationUnit: seed.duration?.[1] ?? null,
    budgetType: seed.budget ? "RANGE" : "NEGOTIABLE",
    budgetMin: seed.budget?.[0] ?? null,
    budgetMax: seed.budget?.[1] ?? null,
    region: seed.region ?? null,
    locationDetail: seed.locationDetail ?? null,
    deadline: deadlineOf(seed.deadlineInDays),
    status: seed.status,
    sourceType: seed.sourceType ?? "TICKET_FEED",
    targetExpertId: seed.targetExpertId ?? null,
    matchedAt:
      seed.matchedDaysAgo != null ? localDateTime(-seed.matchedDaysAgo * MINUTES_PER_DAY) : null,
    createdAt: localDateTime(-seed.createdMinutesAgo),
    desiredDates: (seed.desiredDates ?? []).map(([offset, timeSlot], i) => ({
      id: seed.id * 10 + i + 1,
      date: localDate(offset),
      timeSlot,
    })),
    images: seed.images.map((label, i) => ({
      id: seed.id * 10 + i + 1,
      imageUrl: asset("cover", `ticket-${seed.id}-${i + 1}`, label),
      displayOrder: i + 1,
    })),
    proposalCount: seed.proposalCount,
  }
}

function buildFeedItem(seed: TicketSeed): TicketFeedFixture {
  const { category, subCategory } = subCategoryById(seed.subCategoryId)
  return {
    id: seed.id,
    majorCategoryName: category.name,
    subCategoryName: subCategory.name,
    ticketType: seed.ticketType,
    title: seed.title,
    budgetType: seed.budget ? "RANGE" : "NEGOTIABLE",
    budgetMin: seed.budget?.[0] ?? null,
    budgetMax: seed.budget?.[1] ?? null,
    desiredDuration: durationLabel(seed.duration),
    region: seed.region ?? null,
    locationDetail: seed.locationDetail ?? null,
    createdAt: localDateTime(-seed.createdMinutesAgo),
    proposalCount: seed.proposalCount,
    daysUntilDeadline: seed.deadlineInDays,
    thumbnailUrl: seed.images[0] ? asset("cover", `ticket-${seed.id}-1`, seed.images[0]) : null,
    new: seed.createdMinutesAgo < MINUTES_PER_DAY,
  }
}

function buildMyTicket(seed: TicketSeed): MyTicketFixture {
  const { subCategory } = subCategoryById(seed.subCategoryId)
  return {
    id: seed.id,
    ticketType: seed.ticketType,
    subCategoryName: subCategory.name,
    title: seed.title,
    proposalCount: seed.proposalCount,
    status: seed.status,
    createdAt: localDateTime(-seed.createdMinutesAgo),
    thumbnailUrl: seed.images[0] ? asset("cover", `ticket-${seed.id}-1`, seed.images[0]) : null,
  }
}

const seedById = (id: number) => SEEDS.find((s) => s.id === id)
const seedsByIds = (ids: number[]) => ids.map(seedById).filter((s): s is TicketSeed => s != null)

// ─── Public API ──────────────────────────────────────────────────────────────

export function findTicketDetail(id: number): TicketDetailFixture | null {
  const seed = seedById(id)
  return seed ? buildDetail(seed) : null
}

/** 의뢰 존재 여부 + 기본 메타 (다른 픽스처가 제목/카테고리 참조할 때) */
export function ticketMeta(id: number) {
  const seed = seedById(id)
  if (!seed) return null
  const { category, subCategory } = subCategoryById(seed.subCategoryId)
  return {
    id: seed.id,
    clientId: seed.clientId,
    title: seed.title,
    content: seed.content,
    ticketType: seed.ticketType,
    level: seed.level,
    categoryName: category.name,
    subCategoryName: subCategory.name,
    desiredDuration: durationLabel(seed.duration),
    budgetType: seed.budget ? ("RANGE" as const) : ("NEGOTIABLE" as const),
    budgetMin: seed.budget?.[0] ?? null,
    budgetMax: seed.budget?.[1] ?? null,
    region: seed.region ?? null,
    locationDetail: seed.locationDetail ?? null,
    status: seed.status,
    deadline: deadlineOf(seed.deadlineInDays),
    createdAt: localDateTime(-seed.createdMinutesAgo),
  }
}

export type FeedQuery = {
  keyword?: string | null
  majorCategoryId?: number | null
  subCategoryId?: number | null
  region?: string | null
  ticketType?: string | null
  sortBy?: string | null
}

export function queryFeed(query: FeedQuery): TicketFeedFixture[] {
  const keyword = query.keyword?.trim().toLowerCase()
  const seeds = seedsByIds(FEED_IDS).filter((seed) => {
    const { category, subCategory } = subCategoryById(seed.subCategoryId)
    if (query.majorCategoryId && category.id !== query.majorCategoryId) return false
    if (query.subCategoryId && seed.subCategoryId !== query.subCategoryId) return false
    if (query.ticketType && seed.ticketType !== query.ticketType) return false
    if (query.region) {
      const wanted = query.region.replace(/\s*전체$/, "")
      if (!seed.region || !(seed.region.includes(wanted) || wanted.includes(seed.region)))
        return false
    }
    if (keyword) {
      const haystack = [seed.title, seed.content, category.name, subCategory.name]
        .join(" ")
        .toLowerCase()
      if (!keyword.split(/\s+/).every((word) => haystack.includes(word))) return false
    }
    return true
  })

  const sorted = [...seeds]
  switch (query.sortBy) {
    case "BUDGET_HIGH":
      sorted.sort((a, b) => (b.budget?.[1] ?? 0) - (a.budget?.[1] ?? 0))
      break
    case "DEADLINE_SOON":
      sorted.sort((a, b) => a.deadlineInDays - b.deadlineInDays)
      break
    default:
      sorted.sort((a, b) => a.createdMinutesAgo - b.createdMinutesAgo)
  }
  return sorted.map(buildFeedItem)
}

export function popularTickets(): TicketFeedFixture[] {
  return seedsByIds(FEED_IDS)
    .filter((seed) => seed.clientId !== ME.userId)
    .sort((a, b) => b.proposalCount - a.proposalCount || a.createdMinutesAgo - b.createdMinutesAgo)
    .slice(0, 10)
    .map(buildFeedItem)
}

/** GET /ticket/my — 모집중 탭 (TicketResponse 배열) */
export function myRecruitingTickets(): TicketDetailFixture[] {
  return seedsByIds([TICKET_EXTRA.myOpenPilates, 302]).map(buildDetail)
}

export function myInProgressTickets(): MyTicketFixture[] {
  return seedsByIds([301, TICKET_EXTRA.myInProgressEnglish]).map(buildMyTicket)
}

export function myCompletedTickets(): MyTicketFixture[] {
  return seedsByIds([303, TICKET_EXTRA.myCompletedBaking]).map(buildMyTicket)
}

export function sentDirectRequests(): MyTicketFixture[] {
  return seedsByIds([TICKET_EXTRA.mySentDirectRequest]).map(buildMyTicket)
}

export function receivedDirectRequests(): MyTicketFixture[] {
  return seedsByIds([314, TICKET_EXTRA.receivedDirectRequest]).map(buildMyTicket)
}

/** POST /ticket — 요청 본문을 반영한 신규 의뢰 */
export function createdTicket(body: Record<string, unknown>): TicketDetailFixture {
  const base = buildDetail(seedById(302)!)
  const subCategoryId =
    typeof body.subCategoryId === "number" ? body.subCategoryId : base.subCategoryId
  const { category, subCategory } = subCategoryById(subCategoryId)
  return {
    ...base,
    ...pickTicketFields(body),
    id: TICKET_EXTRA.created,
    subCategoryId,
    categoryName: category.name,
    subCategoryName: subCategory.name,
    status: "OPEN",
    sourceType: body.directRequest === true ? "DIRECT_REQUEST" : "TICKET_FEED",
    proposalCount: 0,
    createdAt: localDateTime(0),
    deadline: deadlineOf(7),
    desiredDates: Array.isArray(body.desiredDates)
      ? body.desiredDates
          .filter(
            (d): d is { date: string; timeSlot: string } =>
              typeof d === "object" &&
              d != null &&
              typeof (d as Record<string, unknown>).date === "string" &&
              typeof (d as Record<string, unknown>).timeSlot === "string",
          )
          // 실측: POST 응답의 신규 행은 id 가 null
          .map((d) => ({ id: null, date: d.date, timeSlot: d.timeSlot }))
      : [],
    images: Array.isArray(body.imageUrls)
      ? body.imageUrls
          .filter((url): url is string => typeof url === "string")
          .map((imageUrl, i) => ({ id: null, imageUrl, displayOrder: i + 1 }))
      : [],
  }
}

/** PUT /ticket/:id — 기존 의뢰에 수정 본문을 덮어쓴 결과 */
export function updatedTicket(id: number, body: Record<string, unknown>): TicketDetailFixture {
  const base = findTicketDetail(id) ?? buildDetail(seedById(302)!)
  return { ...base, ...pickTicketFields(body), id }
}

function pickTicketFields(body: Record<string, unknown>): Partial<TicketDetailFixture> {
  const out: Partial<TicketDetailFixture> = {}
  if (typeof body.title === "string" && body.title) out.title = body.title
  if (typeof body.content === "string" && body.content) out.content = body.content
  if (body.ticketType === "ONLINE" || body.ticketType === "OFFLINE")
    out.ticketType = body.ticketType
  if (typeof body.budgetMin === "number") out.budgetMin = body.budgetMin
  if (typeof body.budgetMax === "number") out.budgetMax = body.budgetMax
  if (body.budgetType === "RANGE" || body.budgetType === "NEGOTIABLE")
    out.budgetType = body.budgetType
  if (typeof body.region === "string") out.region = body.region
  if (typeof body.locationDetail === "string") out.locationDetail = body.locationDetail
  if (body.level === "BEGINNER" || body.level === "INTERMEDIATE" || body.level === "ADVANCED")
    out.level = body.level
  if ("estimatedDurationValue" in body || "estimatedDurationUnit" in body) {
    const value =
      typeof body.estimatedDurationValue === "number" ? body.estimatedDurationValue : null
    const unit =
      (Object.keys(UNIT_LABEL) as Unit[]).find((u) => u === body.estimatedDurationUnit) ?? null
    out.estimatedDurationValue = value
    out.estimatedDurationUnit = unit
    out.desiredDuration = durationLabel(value != null && unit ? [value, unit] : null)
  }
  return out
}

// ─── Banner ──────────────────────────────────────────────────────────────────

export const BANNERS: BannerFixture[] = [
  {
    id: 1,
    imageUrl: asset("banner", "banner-first-ticket", "첫 의뢰 수수료 0원 · 지금 등록하세요"),
    linkUrl: "/tickets/new",
    sortOrder: 1,
  },
  {
    id: 2,
    imageUrl: asset("banner", "banner-video", "브이로그 편집, 전문가에게 한 번에"),
    linkUrl: "/category/영상",
    sortOrder: 2,
  },
  {
    id: 3,
    imageUrl: asset("banner", "banner-music", "기타 · 피아노 원포인트 레슨 모음"),
    linkUrl: "/category/음악",
    sortOrder: 3,
  },
  {
    id: 4,
    imageUrl: asset("banner", "banner-expert", "내 재능으로 시작하는 원포인트 수익"),
    linkUrl: "/mypage/expert-register",
    sortOrder: 4,
  },
]
