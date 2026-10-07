# 목업 모드 & 스크린샷 캡처

백엔드 없이 전체 화면을 띄우고, README·기능 문서의 스크린샷을 **명령 한 번으로 다시 찍기 위한** 구성.

```bash
pnpm capture                 # 목업 서버 + Next dev 기동 → 전체 시나리오 캡처 → 종료
pnpm capture chat-room home  # 이름(또는 feature)이 일치하는 시나리오만
```

결과는 `docs/screenshots/<feature>/<screen>.<desktop|mobile>.png` 에 저장된다.

---

## 구조

```
mocks/
├─ server.ts          # express + @mswjs/http-middleware — 독립 MSW 서버 (:9090)
├─ world.ts           # 모든 도메인이 공유하는 인물·카테고리·시나리오 ID
├─ handlers/          # 도메인 그룹별 MSW 핸들러 (auth, category, ticket, expert, chat, review)
├─ fixtures/          # 핸들러가 내려주는 목업 데이터
└─ lib/
   ├─ respond.ts      # mock(): 앱의 Zod 응답 스키마로 목업 응답을 타입·런타임 검증
   ├─ assets.ts       # 외부 이미지 호스트 없이 SVG 플레이스홀더 생성
   ├─ time.ts         # 요청 시점 기준 상대 시각 ("3분 전", "D-2" 가 항상 자연스럽게)
   ├─ session.ts      # mock_session=guest 쿠키 → 비로그인 상태 재현
   └─ stomp.ts        # 채팅 STOMP CONNECT 에만 응답하는 WebSocket 스텁

scripts/
├─ dev-mock.mjs       # BASE_URL 을 목업 서버로 돌린 Next dev 서버
└─ capture/
   ├─ scenarios.ts    # 캡처 시나리오 (경로 · 역할 · 다이얼로그 열기 등)
   └─ run.ts          # Playwright 러너 (desktop 1440 / mobile 390@2x)
```

## 왜 브라우저 MSW 가 아니라 독립 서버인가

이 앱은 페이지 대부분이 **RSC 에서 `serverFetch` 로 데이터를 가져온다.**
브라우저 Service Worker 기반 MSW 는 Node 쪽 요청을 가로챌 수 없고, `instrumentation.ts` 에 `msw/node` 를 심는 방식은 앱 코드에 목업 분기를 남긴다.

그래서 MSW 핸들러를 `@mswjs/http-middleware` 로 **실제 HTTP 서버**로 띄우고, `BASE_URL` · `NEXT_PUBLIC_BASE_URL` 만 그쪽으로 돌렸다.

```
Next RSC (serverFetch) ─┐
                        ├─▶ http://localhost:9090  (MSW handlers)
Browser (clientFetch) ──┘
```

- 앱 코드 변경 0줄 — 목업 관련 코드는 전부 `mocks/`, `scripts/` 에 격리
- SSR · CSR 이 **같은 목업 데이터**를 보므로 hydration 불일치가 없다
- 쿠키 기반 인증도 그대로 동작 (localhost 쿠키는 포트를 구분하지 않음)

## 목업 응답 = 앱 스키마로 검증

```ts
mock(
  "get",
  "/v1/api/ticket/:ticketId",
  ticketDetailResponseSchema,
  ({ params }) => findTicketDetail(Number(params.ticketId))!,
)
```

- 픽스처는 `z.input<typeof schema>["data"]` 로 타입이 잡혀 **tsc 단계에서 1차 검증**
- 응답 직전 `schema.safeParse` 로 **런타임 2차 검증** — 어긋나면 서버 콘솔에 `[mock] schema mismatch` 경고
- 앱의 `parseSchemaOrThrow` 가 500 으로 터지기 전에 목업 쪽에서 먼저 잡는다

## 하나의 세계관 (`mocks/world.ts`)

도메인 핸들러가 제각각 데이터를 만들면 화면 간 이동 시 ID·이름이 어긋난다.
의뢰 ↔ 제안서 ↔ 채팅방 ↔ 합의서 ↔ 결제 ↔ 작업물 ↔ 리뷰가 같은 ID 로 엮이도록 시나리오를 한 곳에 고정했다.

| 시나리오                   | 내용                                                                           |
| -------------------------- | ------------------------------------------------------------------------------ |
| HERO (의뢰 301)            | 브이로그 편집 의뢰 → 제안 선택 → 합의 → 에스크로 결제 → 작업물 제출(검수 대기) |
| GUITAR (의뢰 302)          | 모집 중인 통기타 레슨 의뢰, 제안서 3건 도착                                    |
| LOGO (의뢰 303)            | 완료된 로고 피드백 → 채팅 스냅샷 리뷰(801) 공개                                |
| EXPERT SIDE (의뢰 311~314) | 같은 사용자가 전문가 모드로 진행 중인 거래 · 받은 직접 요청                    |

## 캡처 시나리오 추가

`scripts/capture/scenarios.ts` 에 한 줄 추가하면 된다.

```ts
{ feature: "chat", name: "delivery-review-dialog", path: "/chat/room-301",
  action: openBubble("작업물 확인하기") }
```

- `role: "expert"` — localStorage `one-pointer-role` 로 전문가 모드 진입
- `guest: true` — 비로그인 화면
- `fullPage: true` — 데스크톱 전체 스크롤 캡처 (모바일은 항상 첫 화면)
- 캡처 시 애니메이션·토스트·Next dev 인디케이터·홈 푸터는 숨긴다

## 수동으로 띄워보기

```bash
pnpm mock       # 목업 서버 :9090
pnpm dev:mock   # 목업 서버를 바라보는 Next dev :3000
```
