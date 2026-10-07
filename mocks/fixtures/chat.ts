import type { z } from "zod/v4"

import type {
  chatMessageSchema,
  chatRoomDetailSchema,
  chatRoomSummarySchema,
  messageTypeSchema,
  stepInfoSchema,
} from "@/entities/chat/api/chat.schema"

import { asset } from "../lib/assets"
import { minutesAgo } from "../lib/time"
import { ME } from "../world"
import {
  DEALS,
  HYUN_WOO,
  JENNY,
  JUN_HO,
  SEO_YEON,
  SU_A,
  WEEKEND_VLOGGER,
  expertCategoryNames,
  kstAt,
  kstDateLabel,
  mockFile,
  won,
} from "./chat-scenario"

type ChatMessage = z.input<typeof chatMessageSchema>
type ChatRoomDetail = z.input<typeof chatRoomDetailSchema>
type ChatRoomSummary = z.input<typeof chatRoomSummarySchema>
type MessageType = z.infer<typeof messageTypeSchema>
type Step = z.input<typeof stepInfoSchema>

// ─── 메시지 빌더 ──────────────────────────────────────────────────────────────

type Line = {
  /** null = 시스템 메시지 */
  from: number | null
  type?: MessageType
  content: string
  at: string
  attachmentUrl?: string
  /** 기본값 true. 안읽은 상대 메시지 / 상대가 아직 안읽은 내 메시지만 false */
  read?: boolean
}

function buildMessages(roomId: string, lines: Line[]): ChatMessage[] {
  return lines.map((line, index) => ({
    id: `${roomId}-m${String(index + 1).padStart(3, "0")}`,
    roomId,
    senderId: line.from,
    messageType: line.type ?? (line.from == null ? "SYSTEM" : "TEXT"),
    content: line.content,
    attachmentUrl: line.attachmentUrl ?? null,
    isRead: line.read ?? true,
    createdAt: line.at,
  }))
}

const sys = (content: string, at: string): Line => ({ from: null, content, at })

// ─── 진행 단계 ────────────────────────────────────────────────────────────────

const ONLINE_STEPS = [
  { label: "매칭", status: "MATCHED" },
  { label: "합의 · 결제", status: "PAID" },
  { label: "작업 진행", status: "IN_PROGRESS" },
  { label: "검수", status: "DELIVERED" },
  { label: "거래 완료", status: "COMPLETED" },
] as const

const OFFLINE_STEPS = [
  { label: "모집", status: "OPEN" },
  { label: "매칭", status: "MATCHED" },
  { label: "레슨 진행", status: "IN_PROGRESS" },
  { label: "거래 완료", status: "COMPLETED" },
] as const

/** currentIndex 이전 단계는 완료, currentIndex 는 진행중. allDone 이면 전부 완료. */
function steps(
  defs: ReadonlyArray<{ label: string; status: Step["status"] }>,
  currentIndex: number,
  allDone = false,
): Step[] {
  return defs.map((def, index) => ({
    label: def.label,
    status: def.status,
    completed: allDone || index < currentIndex,
    current: !allDone && index === currentIndex,
  }))
}

// ─── room-301 HERO: 브이로그 편집 · 산출물 검수 대기 ────────────────────────

function heroMessages(): ChatMessage[] {
  const me = ME.userId
  const ex = SEO_YEON.userId
  const deadline = kstDateLabel(DEALS.hero.deadlineDayOffset)

  return buildMessages(DEALS.hero.roomId, [
    // D-3 오전: 인사 + 요구사항
    sys("서연필름님의 제안서가 선택되었어요. 대화를 시작해보세요!", kstAt(-3, 10, 12)),
    {
      from: ex,
      content: "안녕하세요 원포인터님! 서연필름입니다 😊\n제안서 선택해주셔서 감사해요.",
      at: kstAt(-3, 10, 15),
    },
    {
      from: ex,
      content:
        "편집하실 원본 영상은 총 몇 분 정도 되나요? 원하시는 분위기가 있으면 같이 알려주세요!",
      at: kstAt(-3, 10, 16),
    },
    {
      from: me,
      content:
        "안녕하세요! 제주도 3박 4일 여행 브이로그고, 클립 40개 정도에 합치면 1시간 20분쯤 돼요.",
      at: kstAt(-3, 10, 31),
    },
    {
      from: me,
      content: "잔잔한 감성 톤에 자막은 깔끔하게, 컷 전환은 너무 빠르지 않았으면 좋겠어요.",
      at: kstAt(-3, 10, 32),
    },
    {
      from: me,
      type: "IMAGE",
      content: "",
      attachmentUrl: asset("cover", "hero-ref-thumbnail", "제주 브이로그 레퍼런스"),
      at: kstAt(-3, 10, 34),
    },
    { from: me, content: "썸네일도 이런 느낌으로 같이 부탁드려도 될까요?", at: kstAt(-3, 10, 35) },
    {
      from: ex,
      content: "네 가능해요! 썸네일 시안 2종 포함해서 진행할게요.",
      at: kstAt(-3, 10, 41),
    },
    {
      from: ex,
      type: "FILE",
      content: "브이로그_편집_진행가이드.pdf",
      attachmentUrl: mockFile("브이로그_편집_진행가이드.pdf"),
      at: kstAt(-3, 10, 43),
    },
    {
      from: ex,
      content: "원본 전달 방법이랑 컷 구성 예시를 정리해둔 가이드예요. 한 번 훑어봐 주세요!",
      at: kstAt(-3, 10, 44),
    },
    {
      from: me,
      content: "가이드 꼼꼼하네요 👍 원본은 구글 드라이브 링크로 공유드렸어요.",
      at: kstAt(-3, 11, 20),
    },

    // D-3 오후: 합의 → 확정 → 결제
    {
      from: ex,
      content: "원본 확인했어요. 말씀하신 범위로 합의서 작성해서 보내드릴게요.",
      at: kstAt(-3, 15, 2),
    },
    {
      from: ex,
      type: "AGREEMENT",
      content: `최종 금액 ${won(DEALS.hero.price)} · ${deadline} 마감 · 수정 ${DEALS.hero.maxRevisions}회\n컷편집 · 자막 · 색보정 · BGM + 썸네일 시안 2종`,
      at: kstAt(-3, 15, 5),
    },
    { from: me, content: "내용 확인했어요. 이대로 진행할게요!", at: kstAt(-3, 15, 30) },
    sys("합의서가 확정되었어요. 결제를 진행해주세요.", kstAt(-3, 15, 31)),
    sys(
      `${won(DEALS.hero.price)} 결제가 완료되었어요. 결제 금액은 거래 완료 시까지 원포인터가 안전하게 보호해요.`,
      kstAt(-3, 15, 38),
    ),
    {
      from: ex,
      content: "결제 확인했습니다! 오늘부터 바로 작업 들어갈게요 🎬",
      at: kstAt(-3, 15, 40),
    },

    // D-2: 진행 공유
    {
      from: ex,
      content: "컷편집 1차 끝났어요. 오프닝은 공항 도착 장면으로 시작하는 게 어떨까요?",
      at: kstAt(-2, 13, 20),
    },
    {
      from: ex,
      type: "IMAGE",
      content: "",
      attachmentUrl: asset("cover", "hero-progress-cut", "오프닝 컷 구성안"),
      at: kstAt(-2, 13, 22),
    },
    {
      from: me,
      content: "좋아요! 오프닝 음악만 조금 더 밝은 걸로 부탁드려요.",
      at: kstAt(-2, 13, 47),
    },
    {
      from: ex,
      content: "넵 저작권 걱정 없는 음원으로 후보 3개 골라서 적용해볼게요.",
      at: kstAt(-2, 13, 50),
    },

    // D-1: 마무리 중
    {
      from: ex,
      content: "자막이랑 색보정 마무리 중이에요. 늦어도 내일 오전까지는 전달드릴게요!",
      at: kstAt(-1, 18, 10),
    },
    { from: me, content: "와 생각보다 빠르네요. 기대하고 있을게요 ☺️", at: kstAt(-1, 18, 25) },

    // 오늘: 산출물 제출 → 검수 대기
    {
      from: ex,
      type: "DELIVERY",
      content: "1차 완성본 전달드립니다. 10분 32초 분량이고, 썸네일 시안 2종도 함께 올렸어요.",
      at: minutesAgo(170),
    },
    sys("작업물이 제출되었어요. 확인 후 승인하거나 수정을 요청해주세요.", minutesAgo(169)),
    {
      from: ex,
      content: "확인해보시고 수정할 부분 있으면 편하게 말씀해주세요! 수정은 2회까지 가능해요 🙂",
      at: minutesAgo(168),
    },
    { from: me, content: "확인해볼게요!", at: minutesAgo(4), read: false },
  ])
}

function heroDetail(): ChatRoomDetail {
  return {
    myRole: "CLIENT",
    reviewId: null,
    reviewStatus: null,
    opponent: {
      userId: SEO_YEON.userId,
      expertProfileId: SEO_YEON.expertProfileId,
      nickname: SEO_YEON.nickname,
      profileImageUrl: SEO_YEON.profileImageUrl,
      expertCategoryNames: expertCategoryNames(SEO_YEON),
    },
    ticketProgress: {
      ticketId: DEALS.hero.ticketId,
      ticketType: "ONLINE",
      currentStatus: "DELIVERED",
      steps: steps(ONLINE_STEPS, 3),
    },
    banner: {
      type: "DELIVERY_SUBMITTED",
      ticketId: DEALS.hero.ticketId,
      agreementId: DEALS.hero.agreementId,
      amount: DEALS.hero.price,
      existingDeliveryId: DEALS.hero.deliveryId,
      canRequestRefund: false,
      currentRefundZone: null,
    },
    messages: heroMessages(),
  }
}

// ─── room-311 EXPERT SIDE: ME 가 전문가 · 작업 진행중 ───────────────────────

function expertSideMessages(): ChatMessage[] {
  const me = ME.userId
  const cl = WEEKEND_VLOGGER.userId
  const deal = DEALS.expertSide
  const deadline = kstDateLabel(deal.deadlineDayOffset)

  return buildMessages(deal.roomId, [
    sys("원포인터님의 제안서가 선택되었어요. 대화를 시작해보세요!", kstAt(-2, 9, 40)),
    {
      from: cl,
      content: "안녕하세요! 제안서 보고 바로 연락드려요. 가평 캠핑 다녀온 영상이에요 🏕️",
      at: kstAt(-2, 9, 52),
    },
    {
      from: me,
      content:
        "안녕하세요 주말브이로거님! 원포인터입니다. 원본 분량이랑 원하시는 길이 알려주시면 범위 잡아볼게요.",
      at: kstAt(-2, 10, 5),
    },
    {
      from: cl,
      content: "원본은 50분 정도고 15분 내외로 줄이고 싶어요. 불멍 장면은 길게 살려주세요!",
      at: kstAt(-2, 10, 9),
    },
    {
      from: cl,
      type: "FILE",
      content: "캠핑_원본클립_목록.pdf",
      attachmentUrl: mockFile("캠핑_원본클립_목록.pdf"),
      at: kstAt(-2, 10, 11),
    },
    {
      from: me,
      type: "AGREEMENT",
      content: `최종 금액 ${won(deal.price)} · ${deadline} 마감 · 수정 ${deal.maxRevisions}회\n컷편집 · 한글 자막 · 감성 BGM`,
      at: kstAt(-2, 10, 40),
    },
    { from: cl, content: "좋아요 확정할게요!", at: kstAt(-2, 11, 2) },
    sys("합의서가 확정되었어요. 결제를 진행해주세요.", kstAt(-2, 11, 2)),
    sys(
      `${won(deal.price)} 결제가 완료되었어요. 결제 금액은 거래 완료 시까지 원포인터가 안전하게 보호해요.`,
      kstAt(-2, 11, 9),
    ),
    { from: me, content: "결제 확인했어요. 작업 시작하겠습니다!", at: kstAt(-2, 11, 15) },
    {
      from: me,
      content: "가편집 중간 컷 공유드려요. 텐트 피칭 장면은 타임랩스로 줄였어요.",
      at: kstAt(-1, 16, 30),
    },
    {
      from: me,
      type: "IMAGE",
      content: "",
      attachmentUrl: asset("cover", "expert-311-timelapse", "텐트 피칭 타임랩스"),
      at: kstAt(-1, 16, 31),
    },
    { from: cl, content: "와 타임랩스 너무 좋아요 👍", at: kstAt(-1, 17, 4) },
    {
      from: cl,
      content: "혹시 엔딩에 구독 버튼 애니메이션도 넣어주실 수 있을까요?",
      at: minutesAgo(62),
      read: false,
    },
  ])
}

function expertSideDetail(): ChatRoomDetail {
  return {
    myRole: "EXPERT",
    reviewId: null,
    reviewStatus: null,
    opponent: {
      userId: WEEKEND_VLOGGER.userId,
      expertProfileId: null,
      nickname: WEEKEND_VLOGGER.nickname,
      profileImageUrl: WEEKEND_VLOGGER.profileImageUrl,
      expertCategoryNames: null,
    },
    ticketProgress: {
      ticketId: DEALS.expertSide.ticketId,
      ticketType: "ONLINE",
      currentStatus: "IN_PROGRESS",
      steps: steps(ONLINE_STEPS, 2),
    },
    banner: {
      type: "DELIVERY_NEEDED",
      ticketId: DEALS.expertSide.ticketId,
      agreementId: DEALS.expertSide.agreementId,
      amount: DEALS.expertSide.price,
      canRequestRefund: false,
    },
    messages: expertSideMessages(),
  }
}

// ─── room-302 GUITAR: 모집중 의뢰 · 기타하는현우 사전 문의 ──────────────────

function guitarHyunWooMessages(): ChatMessage[] {
  const me = ME.userId
  const ex = HYUN_WOO.userId
  return buildMessages(DEALS.guitar.roomIdHyunWoo, [
    sys("기타하는현우님이 제안서를 보냈어요. 궁금한 점을 먼저 물어보세요.", kstAt(-1, 19, 2)),
    {
      from: me,
      content: "안녕하세요! 제안서 잘 봤어요. 완전 초보는 아니고 코드 몇 개는 잡을 줄 알아요.",
      at: kstAt(-1, 19, 30),
    },
    {
      from: ex,
      content:
        "반갑습니다! 그럼 C-G-Am-F 전환 속도 올리는 거랑 8비트 스트로크 위주로 잡아드리면 좋을 것 같아요.",
      at: kstAt(-1, 19, 41),
    },
    {
      from: me,
      content: "딱 그게 고민이었어요. F코드에서 자꾸 소리가 먹혀요 😢",
      at: kstAt(-1, 19, 45),
    },
    {
      from: ex,
      type: "IMAGE",
      content: "",
      attachmentUrl: asset("cover", "guitar-f-chord", "F코드 운지 팁"),
      at: minutesAgo(27),
      read: false,
    },
    {
      from: ex,
      content:
        "F코드는 검지 각도만 바꿔도 금방 좋아져요. 토요일 오후 2시 합정역 근처 연습실 어떠세요?",
      at: minutesAgo(25),
      read: false,
    },
  ])
}

function guitarHyunWooDetail(): ChatRoomDetail {
  return {
    myRole: "CLIENT",
    opponent: {
      userId: HYUN_WOO.userId,
      expertProfileId: HYUN_WOO.expertProfileId,
      nickname: HYUN_WOO.nickname,
      profileImageUrl: HYUN_WOO.profileImageUrl,
      expertCategoryNames: expertCategoryNames(HYUN_WOO),
    },
    ticketProgress: {
      ticketId: DEALS.guitar.ticketId,
      ticketType: "OFFLINE",
      currentStatus: "OPEN",
      steps: steps(OFFLINE_STEPS, 0),
    },
    banner: { type: "NONE", ticketId: DEALS.guitar.ticketId, canRequestRefund: false },
    messages: guitarHyunWooMessages(),
  }
}

// ─── room-302-206 GUITAR: 제니스잉글리시 사전 문의 ──────────────────────────

function guitarJennyMessages(): ChatMessage[] {
  const me = ME.userId
  const ex = JENNY.userId
  return buildMessages(DEALS.guitar.roomIdJenny, [
    sys("제니스잉글리시님이 제안서를 보냈어요. 궁금한 점을 먼저 물어보세요.", kstAt(-1, 20, 10)),
    {
      from: ex,
      content:
        "안녕하세요! 저는 팝송 반주로 기타를 가르쳐드리고 있어요. 좋아하는 노래 한 곡으로 레슨하면 훨씬 재밌어요 🎶",
      at: kstAt(-1, 20, 12),
    },
    { from: me, content: "오 좋네요! 혹시 레슨 장소는 어디서 하세요?", at: kstAt(-1, 21, 5) },
    {
      from: ex,
      content: "성수역 근처 스튜디오에서 진행해요. 기타는 제가 준비해드릴 수 있어요!",
      at: kstAt(-1, 21, 40),
      read: false,
    },
  ])
}

function guitarJennyDetail(): ChatRoomDetail {
  return {
    myRole: "CLIENT",
    opponent: {
      userId: JENNY.userId,
      expertProfileId: JENNY.expertProfileId,
      nickname: JENNY.nickname,
      profileImageUrl: JENNY.profileImageUrl,
      expertCategoryNames: expertCategoryNames(JENNY),
    },
    ticketProgress: {
      ticketId: DEALS.guitar.ticketId,
      ticketType: "OFFLINE",
      currentStatus: "OPEN",
      steps: steps(OFFLINE_STEPS, 0),
    },
    banner: { type: "NONE", ticketId: DEALS.guitar.ticketId, canRequestRefund: false },
    messages: guitarJennyMessages(),
  }
}

// ─── room-303 LOGO: 거래 완료 + 리뷰 공개 ───────────────────────────────────

function logoMessages(): ChatMessage[] {
  const me = ME.userId
  const ex = JUN_HO.userId
  const deal = DEALS.logo
  return buildMessages(deal.roomId, [
    sys("디자인준호님의 제안서가 선택되었어요. 대화를 시작해보세요!", kstAt(-16, 11, 0)),
    {
      from: ex,
      content: "안녕하세요, 디자인준호입니다. 카페 이름과 분위기 키워드 3개만 알려주시겠어요?",
      at: kstAt(-16, 11, 8),
    },
    {
      from: me,
      content: "카페 이름은 '오후세시'예요! 키워드는 따뜻함, 미니멀, 빈티지요.",
      at: kstAt(-16, 11, 30),
    },
    {
      from: ex,
      type: "AGREEMENT",
      content: `최종 금액 ${won(deal.price)} · ${kstDateLabel(-9)} 마감 · 수정 3회\n로고 시안 3종 + 최종 AI/PNG 파일`,
      at: kstAt(-16, 14, 20),
    },
    sys("합의서가 확정되었어요. 결제를 진행해주세요.", kstAt(-16, 15, 1)),
    sys(
      `${won(deal.price)} 결제가 완료되었어요. 결제 금액은 거래 완료 시까지 원포인터가 안전하게 보호해요.`,
      kstAt(-16, 15, 6),
    ),
    {
      from: ex,
      type: "IMAGE",
      content: "",
      attachmentUrl: asset("cover", "logo-draft-a", "오후세시 시안 A"),
      at: kstAt(-13, 18, 2),
    },
    {
      from: ex,
      content: "시안 A는 손글씨 느낌, B는 세리프 로고타입이에요. 편하게 골라주세요!",
      at: kstAt(-13, 18, 4),
    },
    {
      from: me,
      content: "A안으로 갈게요! 커피잔 아이콘만 조금 더 단순하게 부탁드려요.",
      at: kstAt(-13, 19, 10),
    },
    {
      from: ex,
      type: "DELIVERY",
      content: "최종 로고 파일 전달드립니다. AI 원본, 투명 PNG, 컬러 가이드 포함이에요.",
      at: kstAt(-11, 10, 30),
    },
    sys("작업물이 승인되었어요. 거래가 완료되었습니다.", kstAt(-11, 13, 2)),
    {
      from: me,
      content: "로고 너무 마음에 들어요! 간판에 바로 쓸게요. 감사합니다 🙏",
      at: kstAt(-11, 13, 5),
    },
    { from: ex, content: "오픈 축하드려요! 번창하세요 ☕️", at: kstAt(-11, 13, 20) },
    sys("리뷰가 공개되었어요. 대화 내용이 리뷰로 소개됩니다.", kstAt(-10, 9, 0)),
  ])
}

function logoDetail(): ChatRoomDetail {
  return {
    myRole: "CLIENT",
    reviewId: DEALS.logo.reviewId,
    reviewStatus: "PUBLISHED",
    opponent: {
      userId: JUN_HO.userId,
      expertProfileId: JUN_HO.expertProfileId,
      nickname: JUN_HO.nickname,
      profileImageUrl: JUN_HO.profileImageUrl,
      expertCategoryNames: expertCategoryNames(JUN_HO),
    },
    ticketProgress: {
      ticketId: DEALS.logo.ticketId,
      ticketType: "ONLINE",
      currentStatus: "COMPLETED",
      steps: steps(ONLINE_STEPS, 4, true),
    },
    banner: {
      type: "NONE",
      ticketId: DEALS.logo.ticketId,
      reviewId: DEALS.logo.reviewId,
      canRequestRefund: false,
    },
    messages: logoMessages(),
  }
}

// ─── room-310 DISPUTE: 마감 초과 → 분쟁 → 전액 환불 ─────────────────────────

function disputeMessages(): ChatMessage[] {
  const me = ME.userId
  const ex = SU_A.userId
  const deal = DEALS.dispute
  return buildMessages(deal.roomId, [
    sys("베이킹수아님의 제안서가 선택되었어요. 대화를 시작해보세요!", kstAt(-40, 10, 0)),
    {
      from: ex,
      content: "안녕하세요! 마카롱 3종 레시피랑 원가표까지 정리해서 드릴게요.",
      at: kstAt(-40, 10, 20),
    },
    {
      from: ex,
      type: "AGREEMENT",
      content: `최종 금액 ${won(deal.price)} · ${kstDateLabel(-33)} 마감 · 수정 1회\n마카롱 3종 레시피 + 원가 계산표`,
      at: kstAt(-40, 11, 0),
    },
    sys(
      `${won(deal.price)} 결제가 완료되었어요. 결제 금액은 거래 완료 시까지 원포인터가 안전하게 보호해요.`,
      kstAt(-40, 11, 30),
    ),
    { from: me, content: "마감일이 지났는데 진행 상황 공유 부탁드려요.", at: kstAt(-32, 10, 0) },
    { from: me, content: "답변이 없으셔서 환불 요청드렸어요.", at: kstAt(-30, 14, 0) },
    sys("전문가가 환불 요청을 거절했어요. 분쟁을 신청할 수 있어요.", kstAt(-29, 18, 0)),
    sys("분쟁이 접수되었어요. 원포인터가 양측 내용을 확인할게요.", kstAt(-29, 18, 30)),
    sys(
      `분쟁이 종결되었어요. 결제 금액 ${won(deal.price)}이 전액 환불되었어요.`,
      kstAt(-25, 15, 0),
    ),
  ])
}

function disputeDetail(): ChatRoomDetail {
  const deal = DEALS.dispute
  return {
    myRole: "CLIENT",
    opponent: {
      userId: SU_A.userId,
      expertProfileId: SU_A.expertProfileId,
      nickname: SU_A.nickname,
      profileImageUrl: SU_A.profileImageUrl,
      expertCategoryNames: expertCategoryNames(SU_A),
    },
    ticketProgress: {
      ticketId: deal.ticketId,
      ticketType: "ONLINE",
      currentStatus: "CANCELLED",
      steps: [
        { label: "매칭", status: "MATCHED", completed: true, current: false },
        { label: "합의 · 결제", status: "PAID", completed: true, current: false },
        { label: "작업 진행", status: "IN_PROGRESS", completed: true, current: false },
        { label: "분쟁 · 환불", status: "CANCELLED", completed: true, current: true },
      ],
    },
    banner: {
      type: "DISPUTE_RESOLVED",
      ticketId: deal.ticketId,
      refundRequestId: deal.refundId,
      refundStatus: "DISPUTE_FULL_REFUND",
      disputeId: deal.disputeId,
      disputeStatus: "RESOLVED",
      resolutionType: "FULL_REFUND",
      totalAmount: deal.price,
      canRequestRefund: false,
    },
    messages: disputeMessages(),
  }
}

// ─── 레지스트리 ───────────────────────────────────────────────────────────────

type RoomEntry = {
  ticketId: number
  ticketTitle: string
  ticketType: "ONLINE" | "OFFLINE"
  statusLabel: string
  reviewPending: boolean
  detail: () => ChatRoomDetail
}

const ROOMS: Record<string, RoomEntry> = {
  [DEALS.hero.roomId]: {
    ticketId: DEALS.hero.ticketId,
    ticketTitle: DEALS.hero.title,
    ticketType: "ONLINE",
    statusLabel: "검수 대기",
    reviewPending: false,
    detail: heroDetail,
  },
  [DEALS.guitar.roomIdHyunWoo]: {
    ticketId: DEALS.guitar.ticketId,
    ticketTitle: DEALS.guitar.title,
    ticketType: "OFFLINE",
    statusLabel: "모집중",
    reviewPending: false,
    detail: guitarHyunWooDetail,
  },
  [DEALS.expertSide.roomId]: {
    ticketId: DEALS.expertSide.ticketId,
    ticketTitle: DEALS.expertSide.title,
    ticketType: "ONLINE",
    statusLabel: "작업 중",
    reviewPending: false,
    detail: expertSideDetail,
  },
  [DEALS.guitar.roomIdJenny]: {
    ticketId: DEALS.guitar.ticketId,
    ticketTitle: DEALS.guitar.title,
    ticketType: "OFFLINE",
    statusLabel: "모집중",
    reviewPending: false,
    detail: guitarJennyDetail,
  },
  [DEALS.logo.roomId]: {
    ticketId: DEALS.logo.ticketId,
    ticketTitle: DEALS.logo.title,
    ticketType: "ONLINE",
    statusLabel: "거래 완료",
    reviewPending: false,
    detail: logoDetail,
  },
  [DEALS.dispute.roomId]: {
    ticketId: DEALS.dispute.ticketId,
    ticketTitle: DEALS.dispute.title,
    ticketType: "ONLINE",
    statusLabel: "분쟁 종결",
    reviewPending: false,
    detail: disputeDetail,
  },
}

/** GET /v1/api/chat/rooms/{roomId}/messages */
export function chatRoomDetail(roomId: string): ChatRoomDetail | null {
  return ROOMS[roomId]?.detail() ?? null
}

/** GET /v1/api/chat/rooms/by-ticket/{ticketId} — 의뢰당 대표 채팅방 */
export function roomIdByTicket(ticketId: number): string | null {
  const found = Object.entries(ROOMS).find(([, room]) => room.ticketId === ticketId)
  return found?.[0] ?? null
}

/** GET /v1/api/chat/rooms — 상세 데이터에서 요약을 파생해 목록/상세가 항상 일치하게 한다. */
export function chatRoomList(): ChatRoomSummary[] {
  const summaries = Object.entries(ROOMS).map(([roomId, room]): ChatRoomSummary => {
    const detail = room.detail()
    const messages = detail.messages ?? []
    const last = messages[messages.length - 1]
    const unreadCount = messages.filter(
      (m) => m.senderId != null && m.senderId !== ME.userId && m.isRead === false,
    ).length

    return {
      roomId,
      ticketId: room.ticketId,
      opponentNickname: detail.opponent?.nickname ?? null,
      opponentProfileImageUrl: detail.opponent?.profileImageUrl ?? null,
      ticketTitle: room.ticketTitle,
      ticketType: room.ticketType,
      ticketStatus: detail.ticketProgress?.currentStatus ?? null,
      statusLabel: room.statusLabel,
      lastMessageType: last?.messageType ?? null,
      lastMessage: last?.content ?? null,
      lastMessageAt: last?.createdAt ?? null,
      unreadCount,
      reviewPending: room.reviewPending,
    }
  })

  return summaries.sort((a, b) => String(b.lastMessageAt).localeCompare(String(a.lastMessageAt)))
}
