import type { z } from "zod/v4"
import type {
  filteringViewResponseSchema,
  messageTypeSchema,
  messageVisibilitySchema,
  myReviewListResponseSchema,
  myReviewSummaryResponseSchema,
  reviewDetailResponseSchema,
  reviewFeedListResponseSchema,
  reviewStatusSchema,
} from "@/entities/review/api/review.schema"
import { asset } from "../lib/assets"
import type { EnvelopeData } from "../lib/respond"
import { localDate } from "../lib/time"
import { CLIENTS, EXPERTS, ME, SCENARIO, expertById } from "../world"

/**
 * 리뷰 = "완료된 거래의 채팅 스냅샷 공개".
 * 각 리뷰는 짧은 대화 스크립트(Step[]) 로 정의하고, 상세 / 피드 미리보기 / 필터링 뷰 /
 * 내 리뷰 카드는 모두 같은 스크립트에서 파생한다 — 화면 간 메시지 내용이 항상 일치한다.
 *
 * 시각은 오프셋 없는 LocalDateTime(`2026-10-01T14:05:00`) 으로 낸다. 브라우저 TZ 와 무관하게
 * "오후 2:05" 처럼 의도한 벽시계 시각이 그대로 찍히도록.
 */

type MessageType = z.infer<typeof messageTypeSchema>
type Visibility = z.infer<typeof messageVisibilitySchema>
type ReviewStatus = z.infer<typeof reviewStatusSchema>
type Sender = "CLIENT" | "EXPERT" | "SYSTEM"

type ReviewDetailData = EnvelopeData<typeof reviewDetailResponseSchema>
type ReviewFeedData = EnvelopeData<typeof reviewFeedListResponseSchema>["content"][number]
type MyReviewCardData = EnvelopeData<typeof myReviewListResponseSchema>["content"][number]
type FilteringViewData = EnvelopeData<typeof filteringViewResponseSchema>
type MyReviewSummaryData = EnvelopeData<typeof myReviewSummaryResponseSchema>

// ─── 시각 헬퍼 ───────────────────────────────────────────────────────────────

const MINUTE = 60_000

/** N일 전(KST) 의 HH:MM — 오프셋 없는 LocalDateTime 의 epoch(naive-UTC) 값 */
function wallClock(daysAgo: number, hhmm: string): number {
  return Date.parse(`${localDate(-daysAgo)}T${hhmm}:00Z`)
}

function formatWall(ms: number): string {
  return new Date(ms).toISOString().slice(0, 19)
}

const at = (daysAgo: number, hhmm: string) => formatWall(wallClock(daysAgo, hhmm))

// ─── 대화 스크립트 DSL ───────────────────────────────────────────────────────

type Line = {
  sender: Sender
  type: MessageType
  content: string
  attachmentUrl: string | null
  visibility: Visibility
}
type Jump = { jump: { daysAgo: number; time: string } }
type Step = Line | Jump

const line = (
  sender: Sender,
  type: MessageType,
  content: string,
  attachmentUrl: string | null = null,
  visibility: Visibility = "PUBLIC",
): Line => ({ sender, type, content, attachmentUrl, visibility })

const day = (daysAgo: number, time: string): Jump => ({ jump: { daysAgo, time } })
const c = (text: string) => line("CLIENT", "TEXT", text)
const e = (text: string) => line("EXPERT", "TEXT", text)
const sys = (text: string) => line("SYSTEM", "SYSTEM", text)
const cImg = (seed: string, label: string) =>
  line("CLIENT", "IMAGE", "사진", asset("cover", seed, label))
const eImg = (seed: string, label: string) =>
  line("EXPERT", "IMAGE", "사진", asset("cover", seed, label))
const cFile = (name: string, seed: string) =>
  line("CLIENT", "FILE", name, asset("cover", seed, name))
const eFile = (name: string, seed: string) =>
  line("EXPERT", "FILE", name, asset("cover", seed, name))
const agree = (summary: string) => line("EXPERT", "AGREEMENT", summary)
const deliver = (summary: string) => line("EXPERT", "DELIVERY", summary)
/** 발신자가 필터링 단계에서 직접 가린 메시지 */
const hiddenBySender = (l: Line): Line => ({ ...l, visibility: "HIDDEN_BY_SENDER" })
/** 연락처 등 시스템이 자동으로 가린 메시지 */
const hiddenBySystem = (l: Line): Line => ({ ...l, visibility: "HIDDEN_BY_SYSTEM" })

/** 메시지 간 간격(분) — 결정적이지만 자연스러운 리듬 */
const GAPS = [3, 6, 2, 8, 4, 11, 2, 5, 7, 3]

type Client = { clientId: number; nickname: string; profileImageUrl: string }

const client = (c: { userId: number; nickname: string; profileImageUrl: string }): Client => ({
  clientId: c.userId,
  nickname: c.nickname,
  profileImageUrl: c.profileImageUrl,
})

const extraClient = (userId: number, nickname: string, initial: string): Client => ({
  clientId: userId,
  nickname,
  profileImageUrl: asset("avatar", `client-${userId}`, initial),
})

const ME_CLIENT: Client = {
  clientId: ME.userId,
  nickname: ME.nickname,
  profileImageUrl: ME.profileImageUrl,
}
const [주말브이로거, 기타입문자, 카페사장님, 취준생J, 러닝크루장] = CLIENTS.map(client)
const 퇴근후기타 = extraClient(26, "퇴근후기타", "퇴")
const 망원동집사 = extraClient(27, "망원동집사", "망")
const 새내기PD = extraClient(28, "새내기PD", "P")
const 주말베이커 = extraClient(29, "주말베이커", "베")
const 필름감성 = extraClient(30, "필름감성", "필")
const 이직준비중 = extraClient(31, "이직준비중", "이")
const 거북목탈출 = extraClient(32, "거북목탈출", "거")
const 소품샵운영자 = extraClient(33, "소품샵운영자", "소")
const 브랜드막내 = extraClient(34, "브랜드막내", "브")

type ReviewSeed = {
  reviewId: number
  expertProfileId: number
  client: Client
  /** 시나리오 티켓만 지정 — 상세 헤더의 의뢰 카드가 /tickets/{id} 로 링크된다 */
  ticketId?: number
  ticketTitle: string
  ticketType: "ONLINE" | "OFFLINE"
  status: ReviewStatus
  rating: number | null
  /** 공개(또는 스냅샷 생성) 시점 — N일 전 */
  publishedDaysAgo: number
  helpfulCount: number
  metrics: { averageResponseMinutes: number; firstResponseMinutes: number }
  reply?: { content: string; daysAgo: number }
  steps: Step[]
}

// ─── 리뷰 원본 ───────────────────────────────────────────────────────────────

const LOGO = SCENARIO.logo

/** LOGO 시나리오 — ME(의뢰인) ↔ 디자인준호. 쇼케이스 메인 리뷰. */
const LOGO_REVIEW: ReviewSeed = {
  reviewId: LOGO.reviewId,
  expertProfileId: LOGO.expertProfileId,
  client: ME_CLIENT,
  ticketId: LOGO.ticketId,
  ticketTitle: "카페 로고 디자인 원포인트 피드백",
  ticketType: "ONLINE",
  status: "PUBLISHED",
  rating: 5,
  publishedDaysAgo: 3,
  helpfulCount: 12,
  metrics: { averageResponseMinutes: 6, firstResponseMinutes: 4 },
  reply: {
    content:
      "로고는 결국 '작게 봤을 때도 살아 있는가'가 핵심인데, 그걸 바로 체감해주셔서 저도 작업하는 내내 즐거웠어요. 카페 오픈하면 꼭 커피 마시러 들를게요! ☕",
    daysAgo: 2,
  },
  steps: [
    day(9, "20:10"),
    sys(
      "디자인준호님과 대화가 시작되었어요. 안전한 거래를 위해 결제는 원포인터 안에서 진행해주세요.",
    ),
    c(
      "안녕하세요! 동네에서 작은 카페를 준비하고 있는데, 직접 만든 로고 시안을 한 번 봐주실 수 있을까요?",
    ),
    cImg("logo-draft-a", "내가 만든 시안 A"),
    e(
      "안녕하세요 원포인터님 :) 시안 잘 봤어요. 컵 실루엣 안에 이니셜을 넣은 아이디어가 정말 좋네요.",
    ),
    e(
      "다만 SNS 프로필이나 컵 홀더처럼 작게 쓰일 때 선이 뭉개질 수 있어서, 획 두께랑 여백을 같이 손보면 좋을 것 같아요.",
    ),
    c("아 맞아요… 스티커로 뽑아보니까 글자가 거의 안 보이더라고요 😅"),
    hiddenBySender(c("가게는 망원동 포은로 23길 쪽이에요. 주변 분위기도 참고가 될까 해서요!")),
    agree("로고 원포인트 피드백 1회 · 수정 가이드 + 리터칭 시안 1종 · 45,000원"),
    sys("합의가 확정되었어요. 결제가 완료되면 작업이 시작됩니다."),
    day(8, "14:20"),
    e("작업 들어가기 전에 하나만 여쭤볼게요. 카페 컨셉을 한 단어로 표현하면 뭘까요?"),
    c("'느긋한 아침'이요. 따뜻하고 손글씨 느낌이 났으면 좋겠어요."),
    e("좋아요. 그럼 각진 세리프보다는 둥근 손글씨 계열로 방향을 잡아볼게요."),
    hiddenBySender(e("비슷한 톤으로 작업한 사례는 제 개인 포트폴리오 사이트에 더 있어요.")),
    day(6, "11:05"),
    eImg("logo-revision", "리터칭 시안"),
    e(
      "원래 시안의 컵 실루엣은 살리고, 이니셜 획을 1.5배 두껍게 + 김 모양을 단순화했어요. 16px 에서도 형태가 또렷하게 남아요.",
    ),
    c("와… 같은 로고인데 훨씬 단단해 보여요! 김 모양 단순화한 게 진짜 신의 한 수네요."),
    deliver("최종 가이드 PDF · 컬러 팔레트 3종 · 사이즈별 테스트 시트"),
    c(
      "이유까지 하나하나 설명해주셔서, 다음에 메뉴판 만들 때는 혼자서도 적용해볼 수 있을 것 같아요. 정말 감사합니다!",
    ),
    e("오픈 미리 축하드려요! 간판 시안 나오면 언제든 다시 불러주세요 🙌"),
    sys("작업이 완료되었어요. 대화 내용은 필터링을 거쳐 리뷰로 공개됩니다."),
  ],
}

/** ME 가 의뢰인으로 작성한 나머지 리뷰 (마이페이지 리뷰 관리) */
const MY_CLIENT_REVIEWS: ReviewSeed[] = [
  {
    reviewId: 802,
    expertProfileId: 204,
    client: ME_CLIENT,
    ticketTitle: "허리 통증 완화 1:1 필라테스 원포인트",
    ticketType: "OFFLINE",
    status: "FILTERING",
    rating: null,
    publishedDaysAgo: 1,
    helpfulCount: 0,
    metrics: { averageResponseMinutes: 9, firstResponseMinutes: 5 },
    steps: [
      day(4, "08:10"),
      c("앉아서 일하다 보니 허리가 자주 아파요. 1회 레슨으로도 도움이 될까요?"),
      e("그럼요! 통증 패턴만 알면 집에서 할 수 있는 루틴을 딱 잡아드릴 수 있어요."),
      c("오래 앉아 있으면 오른쪽 아래가 뻐근하고, 아침에 특히 심해요."),
      agree("허리 통증 완화 1:1 레슨 50분 · 분당 스튜디오 · 50,000원"),
      c(
        "스튜디오가 회사 근처라 퇴근하고 바로 갈 수 있겠어요. 회사가 판교역 2번 출구 바로 앞이거든요.",
      ),
      day(2, "19:30"),
      e("오늘 고생 많으셨어요! 골반 정렬 동작 3가지만 꼭 기억해주세요."),
      eFile("허리_루틴_체크리스트.pdf", "back-routine"),
      c("레슨 받고 처음으로 아침에 허리가 덜 뻐근하게 일어났어요 😊"),
      sys("작업이 완료되었어요. 리뷰 공개 전에 필터링을 진행해주세요."),
    ],
  },
  {
    reviewId: 803,
    expertProfileId: 206,
    client: ME_CLIENT,
    ticketTitle: "영어 PT 발표 리허설 피드백",
    ticketType: "ONLINE",
    status: "WAITING_RATING",
    rating: null,
    publishedDaysAgo: 2,
    helpfulCount: 0,
    metrics: { averageResponseMinutes: 11, firstResponseMinutes: 6 },
    steps: [
      day(9, "21:30"),
      c("다음 주에 해외 파트너사 앞에서 영어 발표가 있어요. 리허설 한 번 봐주실 수 있을까요?"),
      e("좋아요! 슬라이드랑 스크립트 먼저 공유해주시면 미리 읽어둘게요."),
      cFile("Q4_partner_pitch.pdf", "pitch-deck"),
      agree("영어 발표 리허설 60분 + 피드백 노트 · 55,000원"),
      day(7, "20:00"),
      e(
        "오프닝 첫 문장을 질문형으로 바꾸면 청중 집중도가 훨씬 올라가요. 숫자는 한 슬라이드에 하나만!",
      ),
      deliver("리허설 피드백 노트 · 수정 스크립트 · 예상 Q&A 10선"),
      c("발표 무사히 끝났어요! 질의응답도 덕분에 자신 있게 했어요 🙏"),
    ],
  },
  {
    reviewId: 804,
    expertProfileId: 208,
    client: ME_CLIENT,
    ticketTitle: "브랜드 프로필 사진 라이트룸 보정 피드백",
    ticketType: "ONLINE",
    status: "PUBLISHED",
    rating: 4,
    publishedDaysAgo: 23,
    helpfulCount: 3,
    metrics: { averageResponseMinutes: 14, firstResponseMinutes: 9 },
    steps: [
      day(26, "22:00"),
      c("카페 SNS 에 올릴 프로필 사진을 직접 보정해봤는데 뭔가 어색해요."),
      cImg("profile-raw", "내 보정본"),
      e("색온도가 너무 차가워서 그래요. 피부톤 기준으로 화이트밸런스부터 다시 잡아볼게요."),
      agree("프로필 사진 보정 피드백 · 프리셋 1종 · 25,000원"),
      day(25, "20:10"),
      eImg("profile-retouch", "보정 수정안"),
      deliver("보정 프리셋 · 전후 비교 이미지"),
      c("같은 사진인데 인상이 훨씬 부드러워졌어요. 감사합니다!"),
    ],
  },
  {
    reviewId: 805,
    expertProfileId: 207,
    client: ME_CLIENT,
    ticketTitle: "카페 디저트 휘낭시에 원데이 클래스",
    ticketType: "OFFLINE",
    status: "PUBLISHED",
    rating: 5,
    publishedDaysAgo: 38,
    helpfulCount: 6,
    metrics: { averageResponseMinutes: 8, firstResponseMinutes: 3 },
    reply: {
      content: "카페 오픈 너무 축하드려요! 시그니처 휘낭시에 꼭 먹으러 갈게요 :)",
      daysAgo: 37,
    },
    steps: [
      day(41, "13:00"),
      c("카페 오픈을 준비 중인데, 휘낭시에를 시그니처 메뉴로 넣고 싶어요."),
      e("좋아요! 한 번에 많이 구워도 맛이 일정한 배합으로 알려드릴게요."),
      agree("휘낭시에 원데이 클래스 3시간 · 용산 공방 · 70,000원"),
      day(39, "18:30"),
      cImg("financier", "완성한 휘낭시에"),
      c("브라운버터 향이 진짜 미쳤어요… 이걸로 시그니처 밀어볼게요!"),
      e("오픈하면 꼭 놀러갈게요 ☕️"),
    ],
  },
]

/** 전문가별 공개 리뷰 (전문가 상세 > 리뷰 탭). ME 가 전문가(201) 로 받은 리뷰 포함. */
const EXPERT_REVIEWS: ReviewSeed[] = [
  // ── 201 원포인터 (ME) — 영상 컷편집 · 자막 ──
  {
    reviewId: 811,
    expertProfileId: 201,
    client: 기타입문자,
    ticketTitle: "기타 커버 영상 멀티캠 싱크 편집",
    ticketType: "ONLINE",
    status: "PUBLISHED",
    rating: 5,
    publishedDaysAgo: 4,
    helpfulCount: 6,
    metrics: { averageResponseMinutes: 7, firstResponseMinutes: 3 },
    reply: { content: "첫 커버 영상 업로드 축하드려요! 다음 곡도 기대할게요 🎸", daysAgo: 4 },
    steps: [
      day(8, "21:12"),
      c("안녕하세요! 기타 커버 영상을 처음 올려보려는데, 편집하고 나니 너무 지루해 보여서요 ㅠㅠ"),
      e("안녕하세요 :) 원본 한 번 보내주시면 어디서 템포가 처지는지 같이 볼게요."),
      cFile("벚꽃엔딩_커버_원본.mp4", "guitar-raw"),
      agree("컷 편집 피드백 1회 + 자막 템플릿 1종 · 30,000원"),
      day(7, "19:40"),
      e("인트로 12초를 4초로 줄이고, 코드가 바뀌는 타이밍에 맞춰 점프컷을 넣어봤어요."),
      eImg("premiere-timeline", "타임라인 비교"),
      c("와 같은 영상인데 훨씬 몰입돼요… 자막 폰트도 너무 예뻐요!"),
      deliver("편집 프로젝트 파일 · 자막 프리셋(.mogrt) · 셀프 체크리스트"),
      c("다음 영상은 체크리스트 보면서 혼자 해볼게요. 친절하게 알려주셔서 감사합니다 🙏"),
    ],
  },
  {
    reviewId: 812,
    expertProfileId: 201,
    client: 주말브이로거,
    ticketTitle: "제주 여행 브이로그 자막 디자인 피드백",
    ticketType: "ONLINE",
    status: "PUBLISHED",
    rating: 5,
    publishedDaysAgo: 11,
    helpfulCount: 4,
    metrics: { averageResponseMinutes: 9, firstResponseMinutes: 5 },
    steps: [
      day(14, "13:05"),
      c("제주 여행 브이로그인데 자막이 너무 심심해 보여서 의뢰드려요."),
      e("캡처 몇 장만 보여주시면 톤부터 맞춰볼게요!"),
      cImg("jeju-vlog", "자막 캡처"),
      hiddenBySystem(c("편하시면 010-2384-5521 로 연락 주셔도 돼요")),
      e(
        "채팅으로도 충분해요 :) 화면이 밝은 편이라 흰 자막에 얇은 그림자만 넣어도 가독성이 확 올라갈 거예요.",
      ),
      agree("자막 스타일 가이드 + 프리셋 3종 · 25,000원"),
      day(13, "20:30"),
      deliver("자막 프리셋 3종 · 적용 전후 비교 영상"),
      c("적용만 했는데 영상이 확 달라졌어요! 구독자분들이 자막 바뀐 거 바로 알아보셨어요 ㅎㅎ"),
    ],
  },
  {
    reviewId: 813,
    expertProfileId: 201,
    client: 러닝크루장,
    ticketTitle: "러닝크루 모집 숏폼 컷편집",
    ticketType: "ONLINE",
    status: "PUBLISHED",
    rating: 4,
    publishedDaysAgo: 19,
    helpfulCount: 2,
    metrics: { averageResponseMinutes: 14, firstResponseMinutes: 8 },
    steps: [
      day(22, "10:20"),
      c("러닝크루 모집용 숏폼을 만들고 싶은데, 30초 안에 분위기가 잘 안 담겨요."),
      e("숏폼은 첫 2초가 전부라서, 가장 역동적인 컷을 맨 앞으로 빼는 게 좋아요."),
      agree("숏폼 30초 컷편집 피드백 · 20,000원"),
      day(21, "18:45"),
      e("비트에 맞춰 컷을 0.5초 단위로 잘라봤어요. BGM 볼륨도 살짝 낮췄습니다."),
      c("오 훨씬 좋네요! 크루 로고가 마지막에 조금만 더 오래 나오면 좋겠어요."),
      e("넵 엔딩 로고 1.5초 늘려서 다시 드릴게요!"),
      deliver("최종 숏폼 · 9:16 / 1:1 두 가지 비율"),
      c("덕분에 이번 주에만 신규 크루 7명 들어왔어요 🏃"),
    ],
  },
  {
    reviewId: 814,
    expertProfileId: 201,
    client: 취준생J,
    ticketTitle: "면접용 자기소개 영상 컷 점검",
    ticketType: "ONLINE",
    status: "PUBLISHED",
    rating: 5,
    publishedDaysAgo: 27,
    helpfulCount: 9,
    metrics: { averageResponseMinutes: 6, firstResponseMinutes: 2 },
    reply: { content: "서류 합격 너무 축하드려요! 면접도 화이팅입니다 💪", daysAgo: 26 },
    steps: [
      day(30, "22:10"),
      c("면접 제출용 자기소개 영상인데, 편집이 어색한 부분만 짚어주실 수 있을까요?"),
      e("그럼요! 1분 영상이면 오늘 안에 피드백 드릴 수 있어요."),
      agree("자기소개 영상 원포인트 피드백 · 15,000원"),
      e("말 사이 공백이 1초 넘는 곳이 6군데 있어요. 여기만 잘라도 훨씬 자신감 있어 보여요."),
      eImg("cut-points", "컷 포인트 표시"),
      c("와 이렇게 보니까 확실히 늘어지네요… 바로 수정해볼게요!"),
      deliver("컷 포인트 타임코드 정리 · 자막 수정본"),
      c("덕분에 서류 통과했어요!! 정말 감사합니다 🥹"),
    ],
  },

  // ── 202 서연필름 — 브이로그 편집 ──
  {
    reviewId: 821,
    expertProfileId: 202,
    client: 망원동집사,
    ticketTitle: "고양이 브이로그 첫 편집 원포인트",
    ticketType: "ONLINE",
    status: "PUBLISHED",
    rating: 5,
    publishedDaysAgo: 3,
    helpfulCount: 11,
    metrics: { averageResponseMinutes: 5, firstResponseMinutes: 2 },
    reply: { content: "냥이가 워낙 귀여워서 편집하는 내내 행복했어요 🐱", daysAgo: 2 },
    steps: [
      day(6, "20:00"),
      c("고양이 일상 브이로그를 시작했는데 너무 길고 지루해요 😿"),
      e("고양이 영상은 '리액션' 위주로 잘라내면 금방 살아나요! 원본이 어느 정도 길이예요?"),
      c("40분 찍은 걸 12분으로 줄였는데도 길어요…"),
      agree("브이로그 컷편집 피드백 1회 · 35,000원"),
      day(5, "15:30"),
      eImg("cat-vlog", "편집 전후 비교"),
      e("12분 → 4분 30초로 줄이고, 하품하는 순간에 줌인 + 효과음을 넣어봤어요."),
      c("ㅋㅋㅋ 하품 줌인 너무 귀여워요. 이 방식 그대로 다음 영상에 써볼게요!"),
      deliver("컷편집 가이드 · 효과음 추천 리스트"),
    ],
  },
  {
    reviewId: 822,
    expertProfileId: 202,
    client: 새내기PD,
    ticketTitle: "브이로그 색보정 · 컷 템포 피드백",
    ticketType: "ONLINE",
    status: "PUBLISHED",
    rating: 5,
    publishedDaysAgo: 9,
    helpfulCount: 7,
    metrics: { averageResponseMinutes: 8, firstResponseMinutes: 4 },
    steps: [
      day(12, "11:15"),
      c("색감이 칙칙하게 나와서 고민이에요. 컷 템포도 같이 봐주실 수 있나요?"),
      e("둘 다 가능해요! 촬영 기종이랑 촬영 설정 알려주세요."),
      c("아이폰 15 로 찍었고 따로 설정은 안 했어요."),
      agree("색보정 LUT + 컷 템포 피드백 · 40,000원"),
      day(11, "21:05"),
      e("하이라이트를 살짝 누르고 피부톤 위주로 보정한 LUT 를 만들어 드렸어요."),
      eImg("color-grade", "보정 전 / 후"),
      c("같은 영상 맞나요?? 완전 영화 같아요 😳"),
      deliver("커스텀 LUT 1종 · 보정 순서 가이드"),
    ],
  },
  {
    reviewId: 823,
    expertProfileId: 202,
    client: 주말브이로거,
    ticketTitle: "출근 브이로그 오프닝 시퀀스 피드백",
    ticketType: "ONLINE",
    status: "PUBLISHED",
    rating: 4,
    publishedDaysAgo: 17,
    helpfulCount: 3,
    metrics: { averageResponseMinutes: 12, firstResponseMinutes: 6 },
    steps: [
      day(20, "08:40"),
      c("오프닝이 늘 똑같아서 초반 이탈이 많아요. 3초짜리 오프닝 아이디어가 필요해요!"),
      e("채널 톤이 차분해서, 알람 소리 + 타이포 한 줄로 시작해보면 어떨까요?"),
      agree("오프닝 시퀀스 피드백 + 템플릿 · 30,000원"),
      day(19, "19:20"),
      deliver("오프닝 템플릿 2종 · 폰트 추천 리스트"),
      c("두 번째 템플릿 너무 마음에 들어요. 평균 시청 시간이 확실히 늘었어요!"),
      e("다행이에요! 채널 성장 응원할게요 :)"),
    ],
  },
  {
    reviewId: 824,
    expertProfileId: 202,
    client: 필름감성,
    ticketTitle: "여행 브이로그 BGM 싱크 맞추기",
    ticketType: "ONLINE",
    status: "PUBLISHED",
    rating: 5,
    publishedDaysAgo: 26,
    helpfulCount: 5,
    metrics: { averageResponseMinutes: 6, firstResponseMinutes: 3 },
    steps: [
      day(29, "16:00"),
      c("BGM 이랑 컷이 따로 노는 느낌이에요. 박자에 맞추는 요령이 궁금해요."),
      e("마커 찍는 법부터 알려드릴게요! 프리미어 쓰시죠?"),
      c("네 프리미어요!"),
      agree("BGM 싱크 원포인트 레슨 · 25,000원"),
      eImg("beat-marker", "비트 마커 예시"),
      e("킥 소리마다 M 키로 마커 찍고, 장면 전환을 마커에 스냅하면 끝이에요."),
      c("이렇게 간단한 걸 몰라서 몇 시간씩 붙잡고 있었네요 ㅠㅠ 감사합니다!"),
    ],
  },

  // ── 203 기타하는현우 — 통기타 ──
  {
    reviewId: 831,
    expertProfileId: 203,
    client: 퇴근후기타,
    ticketTitle: "통기타 F코드 잡는 법 원포인트 레슨",
    ticketType: "OFFLINE",
    status: "PUBLISHED",
    rating: 5,
    publishedDaysAgo: 5,
    helpfulCount: 14,
    metrics: { averageResponseMinutes: 10, firstResponseMinutes: 4 },
    reply: { content: "다음엔 핑거스타일도 같이 도전해봐요! 🎸", daysAgo: 5 },
    steps: [
      day(9, "19:30"),
      c("F코드만 나오면 소리가 다 죽어요 ㅠㅠ 한 번에 잡는 요령이 있을까요?"),
      e("F코드는 힘보다 각도 문제인 경우가 많아요. 손 사진 한 장 보내주실래요?"),
      cImg("f-chord-hand", "F코드 손 모양"),
      e("검지가 너무 평평하게 누워 있어요. 살짝 옆면으로 세우면 훨씬 덜 아프고 소리도 잘 나요."),
      agree("F코드 원포인트 대면 레슨 40분 · 망원역 연습실 · 30,000원"),
      day(7, "21:10"),
      c("레슨 끝나고 집에 와서 쳐봤는데 소리가 나요!! 진짜 신기해요"),
      e("알려드린 루틴대로 일주일만 해보세요. 바레 코드 전부 편해지실 거예요 🎸"),
    ],
  },
  {
    reviewId: 832,
    expertProfileId: 203,
    client: 기타입문자,
    ticketTitle: "스트로크 박자 밀림 교정",
    ticketType: "OFFLINE",
    status: "PUBLISHED",
    rating: 5,
    publishedDaysAgo: 13,
    helpfulCount: 6,
    metrics: { averageResponseMinutes: 9, firstResponseMinutes: 5 },
    steps: [
      day(16, "14:00"),
      c("스트로크가 항상 박자가 밀려요. 메트로놈을 켜도 잘 안 맞아요."),
      e("다운-업 할 때 손목이 아니라 팔꿈치로 치고 계실 가능성이 커요."),
      agree("스트로크 교정 대면 레슨 50분 · 35,000원"),
      day(15, "19:00"),
      e("오늘 알려드린 16비트 패턴은 60bpm 부터 천천히 올려보세요!"),
      eFile("16비트_스트로크_연습표.pdf", "strum-sheet"),
      c("손목 힘 빼니까 진짜 소리가 달라져요. 오늘 레슨 최고였어요"),
    ],
  },
  {
    reviewId: 833,
    expertProfileId: 203,
    client: 카페사장님,
    ticketTitle: "카페 공연용 통기타 반주 편곡 피드백",
    ticketType: "OFFLINE",
    status: "PUBLISHED",
    rating: 4,
    publishedDaysAgo: 22,
    helpfulCount: 2,
    metrics: { averageResponseMinutes: 15, firstResponseMinutes: 7 },
    steps: [
      day(25, "11:30"),
      c("주말에 카페에서 작은 공연을 하는데, 반주가 너무 단조로워서요."),
      e("곡 리스트 보내주시면 쉬운 리하모니 몇 가지 추천드릴게요."),
      c("'너의 의미'랑 '좋은 날' 두 곡이에요!"),
      agree("공연 반주 편곡 피드백 · 대면 1시간 · 40,000원"),
      day(23, "16:20"),
      e("베이스 워킹 두 마디만 넣어도 분위기가 확 살아요. 악보 정리해서 드렸어요."),
      c("덕분에 공연 잘 마쳤어요. 손님들이 반주 좋다고 해주셨어요 :)"),
    ],
  },

  // ── 204 필라테스민지 — 자세 교정 ──
  {
    reviewId: 841,
    expertProfileId: 204,
    client: 거북목탈출,
    ticketTitle: "거북목 자세 교정 1:1 필라테스",
    ticketType: "OFFLINE",
    status: "PUBLISHED",
    rating: 5,
    publishedDaysAgo: 6,
    helpfulCount: 10,
    metrics: { averageResponseMinutes: 11, firstResponseMinutes: 6 },
    reply: { content: "꾸준함이 제일 중요해요. 한 달 뒤 옆모습 사진 꼭 보여주세요!", daysAgo: 5 },
    steps: [
      day(10, "07:50"),
      c("개발자인데 거북목이 너무 심해졌어요. 한 번만 봐주셔도 될까요?"),
      e("그럼요! 옆모습 사진 한 장 보내주시면 상태부터 볼게요."),
      cImg("posture-side", "옆모습 자세"),
      e("귀가 어깨보다 5cm 정도 앞에 있네요. 흉추 가동성부터 풀어야 해요."),
      agree("자세 교정 1:1 레슨 50분 · 성남 스튜디오 · 50,000원"),
      day(8, "20:30"),
      e("오늘 알려드린 3가지 동작, 아침저녁 5분씩만 해주세요!"),
      c("레슨 받고 나서 목이 진짜 가벼워졌어요. 루틴 꾸준히 해볼게요 🙇"),
    ],
  },
  {
    reviewId: 842,
    expertProfileId: 204,
    client: 이직준비중,
    ticketTitle: "필라테스 입문 · 코어 호흡 원포인트",
    ticketType: "OFFLINE",
    status: "PUBLISHED",
    rating: 4,
    publishedDaysAgo: 15,
    helpfulCount: 3,
    metrics: { averageResponseMinutes: 13, firstResponseMinutes: 8 },
    steps: [
      day(18, "12:10"),
      c("필라테스는 처음인데 호흡이 제일 헷갈려요."),
      e("흉식 호흡부터 천천히 잡아드릴게요. 편한 시간대 알려주세요!"),
      agree("코어 호흡 원포인트 레슨 40분 · 40,000원"),
      day(16, "19:10"),
      c("호흡만 바꿨는데 배에 힘이 들어가는 게 느껴져요!"),
      e("잘하셨어요! 다음엔 롤업까지 해봐요 :)"),
    ],
  },
  {
    reviewId: 843,
    expertProfileId: 204,
    client: 취준생J,
    ticketTitle: "면접 전 라운드숄더 교정",
    ticketType: "OFFLINE",
    status: "PUBLISHED",
    rating: 5,
    publishedDaysAgo: 24,
    helpfulCount: 4,
    metrics: { averageResponseMinutes: 8, firstResponseMinutes: 4 },
    steps: [
      day(27, "18:00"),
      c("면접 때 자꾸 어깨가 말려서 자신감 없어 보인대요."),
      e("라운드숄더는 가슴 근육 이완이 먼저예요. 한 번에 잡아드릴게요!"),
      agree("어깨 라인 교정 레슨 50분 · 45,000원"),
      day(25, "20:40"),
      e("벽 스트레칭 영상 보내드렸어요. 면접 전날에도 꼭 해주세요!"),
      eFile("벽_스트레칭_루틴.mp4", "wall-stretch"),
      c("면접 날 어깨 쫙 펴고 들어갔어요. 결과도 좋았어요!! 감사합니다"),
    ],
  },

  // ── 205 디자인준호 — 로고 · 브랜드 (LOGO_REVIEW 801 포함) ──
  {
    reviewId: 851,
    expertProfileId: 205,
    client: 소품샵운영자,
    ticketTitle: "소품샵 로고 컬러 팔레트 정리",
    ticketType: "ONLINE",
    status: "PUBLISHED",
    rating: 5,
    publishedDaysAgo: 12,
    helpfulCount: 8,
    metrics: { averageResponseMinutes: 7, firstResponseMinutes: 3 },
    reply: { content: "포장지 나오면 사진 꼭 보여주세요 :)", daysAgo: 11 },
    steps: [
      day(15, "15:20"),
      c("로고는 있는데 쓰는 컬러가 너무 많아서 정리가 필요해요."),
      cImg("shop-logo", "현재 로고"),
      e("메인 1 + 보조 2 컬러로 줄이면 훨씬 브랜드처럼 보여요."),
      agree("브랜드 컬러 팔레트 피드백 · 35,000원"),
      day(14, "11:00"),
      eImg("palette", "컬러 팔레트 3안"),
      c("2안이 딱이에요! 포장지에도 바로 적용해볼게요"),
      deliver("컬러 가이드 PDF · HEX / CMYK 코드표"),
    ],
  },
  {
    reviewId: 852,
    expertProfileId: 205,
    client: 브랜드막내,
    ticketTitle: "사이드 프로젝트 워드마크 커닝 피드백",
    ticketType: "ONLINE",
    status: "PUBLISHED",
    rating: 5,
    publishedDaysAgo: 20,
    helpfulCount: 5,
    metrics: { averageResponseMinutes: 9, firstResponseMinutes: 4 },
    steps: [
      day(23, "21:40"),
      c("사이드 프로젝트 워드마크인데 글자 간격이 어색한 것 같아요."),
      e("커닝 문제 같네요. 글자 쌍별로 하나씩 맞춰볼게요."),
      agree("워드마크 커닝 피드백 · 25,000원"),
      eImg("kerning", "커닝 전후"),
      c("미세하게 바꾼 건데 완성도가 확 올라가네요 😮"),
      deliver("커닝 조정 AI 파일 · 적용 가이드"),
    ],
  },
  {
    reviewId: 853,
    expertProfileId: 205,
    client: 주말베이커,
    ticketTitle: "베이킹 클래스 손그림 로고 벡터화",
    ticketType: "ONLINE",
    status: "PUBLISHED",
    rating: 4,
    publishedDaysAgo: 33,
    helpfulCount: 1,
    metrics: { averageResponseMinutes: 16, firstResponseMinutes: 10 },
    steps: [
      day(36, "10:30"),
      c("손으로 그린 로고 스케치를 디지털로 옮기고 싶어요."),
      cImg("sketch", "손 스케치"),
      e("스케치 느낌을 살리려면 선을 너무 매끈하게 다듬지 않는 게 좋아요."),
      agree("스케치 벡터화 피드백 · 30,000원"),
      day(34, "17:00"),
      deliver("벡터 로고 · 손맛 살린 버전 / 깔끔한 버전"),
      c("손맛 버전이 저희 클래스랑 딱 맞아요. 감사합니다!"),
    ],
  },

  // ── 206 제니스잉글리시 — 영어 면접 ──
  {
    reviewId: 861,
    expertProfileId: 206,
    client: 이직준비중,
    ticketTitle: "외국계 이직 영어 면접 모의 인터뷰",
    ticketType: "ONLINE",
    status: "PUBLISHED",
    rating: 5,
    publishedDaysAgo: 4,
    helpfulCount: 13,
    metrics: { averageResponseMinutes: 6, firstResponseMinutes: 2 },
    reply: { content: "Congratulations! 정말 잘하실 줄 알았어요 :)", daysAgo: 3 },
    steps: [
      day(7, "21:00"),
      c("다음 주 외국계 면접인데 'Tell me about yourself' 에서 자꾸 막혀요."),
      e("답변 스크립트 먼저 보내주시면, 구조부터 같이 잡아볼게요!"),
      cFile("자기소개_스크립트_v2.docx", "intro-script"),
      e("경력 나열보다 '문제-행동-결과' 한 가지 스토리로 압축해보면 훨씬 기억에 남아요."),
      agree("모의 인터뷰 50분 + 피드백 리포트 · 45,000원"),
      day(6, "20:00"),
      deliver("모의 인터뷰 피드백 리포트 · 예상 질문 15선"),
      c("리포트에 정리해주신 표현 그대로 써먹었어요. 최종 합격했습니다!! 🎉"),
    ],
  },
  {
    reviewId: 862,
    expertProfileId: 206,
    client: 새내기PD,
    ticketTitle: "영어 th 발음 원포인트 교정",
    ticketType: "ONLINE",
    status: "PUBLISHED",
    rating: 5,
    publishedDaysAgo: 14,
    helpfulCount: 4,
    metrics: { averageResponseMinutes: 7, firstResponseMinutes: 3 },
    steps: [
      day(17, "22:15"),
      c("th 발음이 계속 s 로 나와요 ㅠㅠ"),
      e("혀끝 위치만 잡으면 금방 고쳐져요! 한 문장만 녹음해서 보내주실래요?"),
      agree("발음 교정 원포인트 30분 · 25,000원"),
      day(16, "21:00"),
      e("오늘 연습한 문장 10개 정리해서 보내드렸어요. 하루 세 번씩만!"),
      c("녹음해서 비교해보니까 확실히 달라졌어요. 감사합니다 :)"),
    ],
  },
  {
    reviewId: 863,
    expertProfileId: 206,
    client: 취준생J,
    ticketTitle: "영문 이력서 첨삭 + 면접 답변 점검",
    ticketType: "ONLINE",
    status: "PUBLISHED",
    rating: 5,
    publishedDaysAgo: 25,
    helpfulCount: 6,
    metrics: { averageResponseMinutes: 10, firstResponseMinutes: 5 },
    steps: [
      day(28, "13:30"),
      c("영문 이력서랑 면접 답변을 같이 봐주실 수 있나요?"),
      e("물론이죠! 지원하시는 직무 JD 도 함께 보내주세요."),
      agree("이력서 첨삭 + 답변 점검 · 50,000원"),
      day(26, "18:20"),
      deliver("첨삭본 · 직무 맞춤 표현 리스트"),
      c("동사 하나하나 바꿔주신 게 너무 좋았어요. 서류 합격했어요!"),
      e("축하드려요! 면접 준비도 언제든 불러주세요 :)"),
    ],
  },

  // ── 207 베이킹수아 — 홈베이킹 (805 포함) ──
  {
    reviewId: 871,
    expertProfileId: 207,
    client: 주말베이커,
    ticketTitle: "마카롱 꼬끄 갈라짐 원포인트",
    ticketType: "OFFLINE",
    status: "PUBLISHED",
    rating: 5,
    publishedDaysAgo: 8,
    helpfulCount: 9,
    metrics: { averageResponseMinutes: 12, firstResponseMinutes: 5 },
    reply: { content: "사진 보고 저도 너무 뿌듯했어요 🧁", daysAgo: 7 },
    steps: [
      day(11, "14:00"),
      c("마카롱 꼬끄가 매번 갈라져요 😭 사진 보여드릴게요"),
      cImg("macaron-crack", "갈라진 꼬끄"),
      e("마카로나주가 덜 됐거나 건조가 부족한 경우예요. 오븐 온도도 같이 볼게요!"),
      agree("마카롱 원포인트 대면 클래스 2시간 · 용산 공방 · 60,000원"),
      day(9, "17:30"),
      cImg("macaron-ok", "성공한 마카롱"),
      c("집에서 다시 구웠는데 피에가 예쁘게 올라왔어요!!"),
      e("완벽해요 👏 다음엔 필링 레시피도 알려드릴게요!"),
    ],
  },
  {
    reviewId: 872,
    expertProfileId: 207,
    client: 망원동집사,
    ticketTitle: "버터 없는 비건 스콘 클래스",
    ticketType: "OFFLINE",
    status: "PUBLISHED",
    rating: 4,
    publishedDaysAgo: 18,
    helpfulCount: 2,
    metrics: { averageResponseMinutes: 18, firstResponseMinutes: 9 },
    steps: [
      day(21, "10:00"),
      c("버터 없이도 바삭한 스콘이 가능할까요?"),
      e("식물성 오일 + 요거트 조합이면 충분히 가능해요!"),
      agree("비건 스콘 원포인트 클래스 · 45,000원"),
      day(19, "16:40"),
      eFile("비건_스콘_레시피.pdf", "vegan-scone"),
      c("생각보다 훨씬 바삭해서 놀랐어요. 집에서도 성공했어요!"),
    ],
  },

  // ── 208 포토태오 — 인물 보정 (804 포함) ──
  {
    reviewId: 881,
    expertProfileId: 208,
    client: 필름감성,
    ticketTitle: "인물 사진 피부 보정 라이트룸 원포인트",
    ticketType: "ONLINE",
    status: "PUBLISHED",
    rating: 5,
    publishedDaysAgo: 7,
    helpfulCount: 8,
    metrics: { averageResponseMinutes: 9, firstResponseMinutes: 4 },
    steps: [
      day(10, "20:20"),
      c("인물 보정만 하면 피부가 플라스틱처럼 돼요…"),
      cImg("portrait-raw", "보정 전 원본"),
      e("텍스처를 너무 낮추셔서 그래요. 마스크로 부분 보정하는 법 알려드릴게요."),
      agree("라이트룸 인물 보정 원포인트 40분 · 35,000원"),
      day(9, "21:00"),
      eImg("portrait-retouch", "보정 후"),
      deliver("보정 프리셋 2종 · 마스크 사용 가이드"),
      c("자연스러운데 깔끔해요. 프리셋 진짜 잘 쓸게요!"),
    ],
  },
  {
    reviewId: 882,
    expertProfileId: 208,
    client: 소품샵운영자,
    ticketTitle: "스마트스토어 제품 사진 색감 통일",
    ticketType: "ONLINE",
    status: "PUBLISHED",
    rating: 4,
    publishedDaysAgo: 21,
    helpfulCount: 3,
    metrics: { averageResponseMinutes: 13, firstResponseMinutes: 7 },
    steps: [
      day(24, "15:00"),
      c("스토어 제품 사진 색감이 다 제각각이에요."),
      e("화이트밸런스 기준 컷 하나 잡고 동기화하면 금방 맞춰져요!"),
      agree("제품 사진 색감 통일 피드백 · 30,000원"),
      day(22, "11:30"),
      deliver("제품용 프리셋 · 일괄 동기화 가이드"),
      c("스토어 메인 페이지가 훨씬 정돈돼 보여요. 감사합니다!"),
    ],
  },
]

const ALL_SEEDS: ReviewSeed[] = [LOGO_REVIEW, ...MY_CLIENT_REVIEWS, ...EXPERT_REVIEWS]
const SEED_BY_ID = new Map(ALL_SEEDS.map((s) => [s.reviewId, s]))

// ─── 파생 ────────────────────────────────────────────────────────────────────

type BuiltMessage = Line & { messageId: number; sequence: number; sentAt: string }

function buildMessages(seed: ReviewSeed): BuiltMessage[] {
  const out: BuiltMessage[] = []
  let clock = 0
  let gapIndex = 0
  let fresh = true
  for (const step of seed.steps) {
    if ("jump" in step) {
      clock = wallClock(step.jump.daysAgo, step.jump.time)
      fresh = true
      continue
    }
    if (!fresh) clock += GAPS[gapIndex++ % GAPS.length] * MINUTE
    fresh = false
    const sequence = out.length + 1
    out.push({
      ...step,
      messageId: seed.reviewId * 100 + sequence,
      sequence,
      sentAt: formatWall(clock),
    })
  }
  return out
}

const isPublic = (m: Line) => m.visibility === "PUBLIC"
const PRIVATE_PLACEHOLDER = "[비공개 메시지]"

function senderNickname(seed: ReviewSeed, sender: Sender): string {
  if (sender === "CLIENT") return seed.client.nickname
  if (sender === "EXPERT") return expertById(seed.expertProfileId).nickname
  return "원포인터"
}

function publishedAt(seed: ReviewSeed): string {
  return at(seed.publishedDaysAgo, "09:00")
}

function metrics(seed: ReviewSeed, messages: BuiltMessage[]) {
  const talk = messages.filter((m) => m.sender !== "SYSTEM")
  const hidden = messages.filter((m) => !isPublic(m)).length
  return {
    averageResponseMinutes: seed.metrics.averageResponseMinutes,
    firstResponseMinutes: seed.metrics.firstResponseMinutes,
    totalMessageCount: talk.length,
    clientMessageCount: talk.filter((m) => m.sender === "CLIENT").length,
    expertMessageCount: talk.filter((m) => m.sender === "EXPERT").length,
    totalMessages: messages.length,
    hiddenRatio: messages.length ? Math.round((hidden / messages.length) * 100) / 100 : 0,
  }
}

function expertReply(seed: ReviewSeed) {
  return seed.reply
    ? {
        id: seed.reviewId * 10,
        content: seed.reply.content,
        createdAt: at(seed.reply.daysAgo, "10:30"),
      }
    : null
}

export function reviewDetail(reviewId: number): ReviewDetailData {
  const seed = SEED_BY_ID.get(reviewId) ?? LOGO_REVIEW
  const messages = buildMessages(seed)
  const expert = expertById(seed.expertProfileId)
  return {
    reviewId,
    id: reviewId,
    ticketId: seed.ticketId,
    expertProfileId: seed.expertProfileId,
    status: seed.status,
    rating: seed.rating,
    publishedAt: publishedAt(seed),
    createdAt: at(seed.publishedDaysAgo, "08:30"),
    helpfulCount: seed.helpfulCount,
    isHelpful: false,
    ticketType: seed.ticketType,
    ticketTitle: seed.ticketTitle,
    clientProfile: seed.client,
    communicationMetrics: metrics(seed, messages),
    messages: messages.map((m) => ({
      messageId: m.messageId,
      id: m.messageId,
      senderId:
        m.sender === "CLIENT"
          ? seed.client.clientId
          : m.sender === "EXPERT"
            ? expert.userId
            : undefined,
      senderType: m.sender,
      senderNickname: senderNickname(seed, m.sender),
      messageType: m.type,
      content: isPublic(m) ? m.content : PRIVATE_PLACEHOLDER,
      attachmentUrl: isPublic(m) ? m.attachmentUrl : null,
      visibility: m.visibility,
      sentAt: m.sentAt,
    })),
    expertReply: expertReply(seed),
  }
}

function toFeed(seed: ReviewSeed): ReviewFeedData {
  const messages = buildMessages(seed)
  const publicTalk = messages.filter((m) => isPublic(m) && m.sender !== "SYSTEM")
  return {
    reviewId: seed.reviewId,
    rating: seed.rating,
    publishedAt: publishedAt(seed),
    helpfulCount: seed.helpfulCount,
    ticketType: seed.ticketType,
    ticketTitle: seed.ticketTitle,
    clientProfile: seed.client,
    communicationMetrics: metrics(seed, messages),
    messagePreview: publicTalk.slice(0, 3).map((m) => ({
      senderType: m.sender,
      senderNickname: senderNickname(seed, m.sender),
      messageType: m.type,
      content: m.content,
      attachmentUrl: m.attachmentUrl,
      visibility: m.visibility,
    })),
    totalPublicMessageCount: messages.filter(isPublic).length,
    expertReply: seed.reply
      ? { content: seed.reply.content, createdAt: at(seed.reply.daysAgo, "10:30") }
      : null,
  }
}

const PUBLISHED: ReadonlySet<ReviewStatus> = new Set(["PUBLISHED", "PUBLISHED_NO_RATING"])

/** 전문가 리뷰 피드 — 공개된 리뷰만, 최신순 */
export function expertReviewFeed(expertProfileId: number): ReviewFeedData[] {
  return ALL_SEEDS.filter((s) => s.expertProfileId === expertProfileId && PUBLISHED.has(s.status))
    .sort((a, b) => a.publishedDaysAgo - b.publishedDaysAgo)
    .map(toFeed)
}

/** 마이페이지 > 리뷰 관리 (의뢰인 시점 — ME 가 작성한 리뷰) */
export function myReviewCards(): MyReviewCardData[] {
  return [LOGO_REVIEW, ...MY_CLIENT_REVIEWS]
    .slice()
    .sort((a, b) => a.publishedDaysAgo - b.publishedDaysAgo)
    .map((seed) => {
      const messages = buildMessages(seed)
      const expert = expertById(seed.expertProfileId)
      const isPublished = PUBLISHED.has(seed.status)
      const filter = FILTER_STATE[seed.reviewId]
      return {
        reviewId: seed.reviewId,
        ticketTitle: seed.ticketTitle,
        ticketType: seed.ticketType,
        expertProfile: {
          expertId: expert.expertProfileId,
          nickname: expert.nickname,
          profileImageUrl: expert.profileImageUrl,
        },
        status: seed.status,
        rating: seed.rating,
        // 양쪽이 마감 전에 필터링을 끝내면 즉시 공개되므로, 공개 리뷰의 마감은 공개일 이후
        filteringDeadline: isPublished
          ? at(seed.publishedDaysAgo - 1, "23:59")
          : at(seed.publishedDaysAgo - 3, "23:59"),
        myFilteringCompleted: isPublished ? true : (filter?.myFilteringCompleted ?? false),
        totalMessageCount: messages.filter((m) => m.sender !== "SYSTEM").length,
        hiddenMessageCount: messages.filter((m) => !isPublic(m)).length,
        publishedAt: isPublished ? publishedAt(seed) : null,
        helpfulCount: seed.helpfulCount,
        createdAt: at(seed.publishedDaysAgo, "08:30"),
      }
    })
}

/**
 * 전문가 본인이 받은 리뷰 요약 — 백엔드 `GET /review/my-summary` 는 "[전문가] 내 리뷰 요약"
 * (받은 리뷰 평균 · 개수). ME 의 전문가 프로필(EXPERTS[0]) 수치와 일치시킨다.
 */
export function myReviewSummary(): MyReviewSummaryData {
  const me = EXPERTS[0]
  return {
    averageRating: me.rating,
    reviewCount: me.reviewCount,
    ratingDistribution: { "5": 34, "4": 4, "3": 0, "2": 0, "1": 0 },
  }
}

// ─── 필터링 뷰 ───────────────────────────────────────────────────────────────

/**
 * 필터링 페이지(`/reviews/{id}/filter`) 상태.
 * 801 은 상세에선 PUBLISHED 지만, 쇼케이스용으로 "공개 직전 필터링 단계" 를 재현한다 —
 * 상대(전문가)는 완료, 본인은 미완료 → 본인 메시지 토글 + "필터링 완료" 버튼이 보이는 상태.
 */
const FILTER_STATE: Record<
  number,
  {
    status: ReviewStatus
    myFilteringCompleted: boolean
    otherFilteringCompleted: boolean
    deadlineDaysLater: number
  }
> = {
  [LOGO.reviewId]: {
    status: "FILTERING",
    myFilteringCompleted: false,
    otherFilteringCompleted: true,
    deadlineDaysLater: 2,
  },
  802: {
    status: "FILTERING",
    myFilteringCompleted: false,
    otherFilteringCompleted: false,
    deadlineDaysLater: 2,
  },
  803: {
    status: "WAITING_RATING",
    myFilteringCompleted: true,
    otherFilteringCompleted: true,
    deadlineDaysLater: 1,
  },
}

const TOGGLEABLE: ReadonlySet<MessageType> = new Set(["TEXT", "IMAGE", "FILE"])

export function filteringView(reviewId: number): FilteringViewData {
  const seed = SEED_BY_ID.get(reviewId) ?? LOGO_REVIEW
  const messages = buildMessages(seed)
  const callerType: Sender =
    seed.client.clientId === ME.userId
      ? "CLIENT"
      : seed.expertProfileId === ME.expertProfileId
        ? "EXPERT"
        : "CLIENT"
  const state = FILTER_STATE[reviewId] ?? {
    status: seed.status,
    myFilteringCompleted: true,
    otherFilteringCompleted: true,
    deadlineDaysLater: -(seed.publishedDaysAgo - 1),
  }
  const isFiltering = state.status === "FILTERING"
  const mine = messages.filter((m) => m.sender === callerType)

  return {
    reviewId,
    status: state.status,
    filteringDeadline: at(-state.deadlineDaysLater, "23:59"),
    myFilteringCompleted: state.myFilteringCompleted,
    otherFilteringCompleted: state.otherFilteringCompleted,
    rating: seed.rating,
    callerType,
    totalMessageCount: messages.length,
    myMessageCount: mine.length,
    myHiddenCount: mine.filter((m) => !isPublic(m)).length,
    messages: messages.map((m) => {
      const own = m.sender === callerType
      // 상대가 가린 메시지는 원문 대신 placeholder, 내 메시지는 가려도 원문이 보인다.
      const redacted = !own && !isPublic(m)
      return {
        messageId: m.messageId,
        senderType: m.sender,
        senderNickname: senderNickname(seed, m.sender),
        content: redacted ? PRIVATE_PLACEHOLDER : m.content,
        attachmentUrl: redacted ? null : m.attachmentUrl,
        messageType: m.type,
        visibility: m.visibility,
        sentAt: m.sentAt,
        sequence: m.sequence,
        own,
        canToggle: own && isFiltering && TOGGLEABLE.has(m.type) && isPublic(m),
      }
    }),
  }
}
