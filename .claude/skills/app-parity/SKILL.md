---
name: app-parity
description: 웹 구현·디버깅 중 막혔을 때 모바일 앱(one-pointer-mobile)이 같은 비즈니스 로직을 어떻게 풀었는지 먼저 확인하고 웹 적용 계획을 세우는 워크플로. 데이터가 안 오거나(null/누락), API request/response 모양이 불명확하거나, 화면 전환·상태 흐름이 안 잡히거나, "웹만 안 되는" 버그가 생겼을 때 반드시 이 스킬을 먼저 쓴다. "앱은 어떻게 했지", "모바일은 되는데 웹은 안 됨", "이 값 어디서 가져와", "흐름 모르겠다" 같은 상황이면 무조건 발동.
---

# app-parity — 막히면 앱부터 본다

웹과 모바일 앱(`one-pointer-mobile`)은 **같은 백엔드를 쓰는 형제 클라이언트**다. 같은 도메인, 같은 API, 같은 비즈니스 규칙. 그래서 웹에서 막히는 문제는 **거의 항상 앱이 이미 풀어놨다.** 추측하거나 백엔드부터 의심하기 전에, 앱이 같은 지점을 어떻게 처리했는지 먼저 읽는 게 가장 빠르고 정확하다.

핵심 마인드셋: **백엔드/스펙을 바꿀 생각을 하기 전에, 앱이라는 "정답지"가 옆에 있다는 걸 기억한다.** 앱은 read-only지만 읽는 건 자유다.

## 언제 이 스킬을 쓰나

다음 중 하나라도 해당하면 발동한다:

- **데이터가 안 온다 / null이다** — 응답의 어떤 필드가 비어서 기능이 안 돈다. (예: 배너 `ticketId`가 null)
- **API 모양을 모르겠다** — request body / response 필드, enum 값, 필수/옵션이 불명확하다.
- **흐름을 모르겠다** — 어느 화면에서 어느 화면으로, 무슨 순서로, 성공 후 뭘 하는지.
- **웹만 안 된다** — "모바일은 되는데 웹은 안 됨" 류의 버그.
- **어디서 값을 가져오는지 모른다** — 이 파라미터를 무슨 응답의 어느 필드에서 채우는지.

## 워크플로

### 1. 막힌 지점을 한 문장으로 특정한다
"무엇이, 어디서, 왜 막혔는가"를 먼저 명확히 한다. 추측 금지. (디버깅이라면 `systematic-debugging`으로 root cause부터.) 막힌 게 데이터인지, 흐름인지, API 모양인지 분류한다 — 그래야 앱에서 어디를 볼지 정해진다.

### 2. 앱에서 대응 코드를 찾는다
도메인 이름으로 아래 매핑을 따라간다. `one-pointer-mobile`은 GetX + Freezed 구조다.

| 무엇이 궁금한가 | 웹 | 모바일 (`one-pointer-mobile/lib/`) |
|---|---|---|
| API 경로 | `src/entities/<d>/api/service.ts` | `rest-api/<d>/*Api.dart`, 경로 모음은 `rest-api/ApiUrls.dart` |
| request/response 모양·enum | `src/entities/<d>/api/schema.ts` | `model/<d>/{request,response,enum}/*.dart` (Freezed — `.freezed.dart`/`.g.dart`는 생성물이니 무시, 원본 `.dart`만 읽는다) |
| 화면 UI | `src/features/<d>/ui/*.tsx` | `main/<d>/.../view/*.dart`, `.../widgets/*.dart` (별도 큰 기능은 `purchase/`, `mypage/`, `onboarding/` 등 최상위에 있기도) |
| 상태·로직·"값 어디서 오나" | `src/features/<d>/model/use-*.ts` | `main/<d>/.../controller/*Controller.dart` |

**값의 출처를 찾을 땐 Controller가 정답지다.** GetX Controller의 getter(`int? get ticketId => ...`)가 "이 값을 무슨 응답의 어느 필드에서 꺼내는지"를 그대로 보여준다.

### 3. 앱 구현을 분석해 웹과의 차이를 뽑는다
앱이 그 값을/흐름을 어떻게 얻고 처리하는지 읽고, 웹이 다르게 한 지점을 짚는다. 보통 차이는 **"같은 값을 다른 출처에서 꺼낸다"** 거나 **"흐름의 한 단계가 웹에 빠졌다"** 다.

### 4. 웹 컨벤션으로 번역해 적용 계획을 세운다
앱 코드를 그대로 베끼지 않는다. **로직은 같게, 표현은 웹 방식으로** 옮긴다:
- GetX Controller getter/state → React 훅 / 컴포넌트 prop / 셀렉터
- 화면 push(`Get.to`) → 라우트 이동 **또는 `overlay-kit` 명령형 다이얼로그** (프로젝트 모달 정책)
- Freezed 모델 → `zod/v4` 스키마 (`src/entities/<d>/api/schema.ts`)
- FSD 계층(entities/features/shared) 유지

### 5. "앱의 특수성"인지 판별한다 — 그제서야 백엔드/대안
2~4에서 답이 안 나오면, 그게 **앱에만 있는 것**인지 본다:
- 네이티브 전용 (디스크 토큰+Bearer 헤더, 네이티브 결제 SDK, 푸시, 권한 등)
- 앱에만 있는 화면/플로우, 앱 전용 분기

앱 특수성이 맞다면 그때 비로소: 웹 대안 로직 모색 → 그래도 안 되면 **백엔드 변경 제안**(read-only라 직접 수정 X, 백엔드 팀에 보고). 이 순서를 건너뛰고 백엔드부터 의심하지 않는다.

## 절대 원칙 (프로젝트 정책과 동기화)

- **모바일·백엔드는 read-only.** 거기 코드는 절대 수정하지 않는다. 읽기만 한다.
- **Source of truth는 "웹이 관찰한 실제 API 응답".** 앱 코드가 실측과 다르면 실측이 우선. 앱은 "정답지"가 아니라 "참고서"다 — 빠른 힌트를 주지만, 최종 확정은 웹이 본 실체로 한다.
- 앱이 쓰는 값이 실측 응답에 실제로 있는지 확인하고 적용한다.

## 실제 사례 — 결제 배너 `ticketId`

**증상:** 채팅 `PAYMENT_PENDING` 배너에서 "결제하기"를 눌러도 모달이 안 뜸. 모바일은 정상.

1. **특정:** 클릭 핸들러 가드 `if (ticketId == null) return`에서 막힘. 콘솔 확인 결과 `banner.ticketId === null` (amount는 정상).
2. **앱 확인:** `main/chat/room/controller/ChatRoomController.dart`
   ```dart
   int? get ticketId => ticketProgress.value?.ticketId;   // 배너가 아니라 ticketProgress에서!
   int get agreementAmount => banner.value?.amount ?? 0;   // amount만 배너에서
   ```
3. **차이:** 앱은 ticketId를 **`ticketProgress.ticketId`** 에서 꺼낸다. 웹은 `banner.ticketId`(null)를 직접 썼다. 결제 API가 ticketId 필수인 건 양쪽 동일.
4. **웹 적용:** 웹에도 같은 출처가 이미 있었다(`detail.ticketProgress?.ticketId`). `BannerDispatcher`에서 배너의 null ticketId를 `ticketProgress.ticketId`로 보정 주입 → 결제뿐 아니라 ticketId 의존 배너 전체 복구.
5. **백엔드:** 배너가 ticketId를 null로 주는 건 백엔드 이슈로 별도 보고(앱 특수성 아님 — 그냥 웹이 출처를 잘못 골랐던 것).

이 한 사례가 워크플로 전체를 압축한다: **막힘 → 앱 Controller에서 값 출처 확인 → 웹에 같은 출처 적용 → 백엔드는 마지막.**
