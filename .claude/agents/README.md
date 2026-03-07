# One Pointer Web - Claude Subagents 사용 가이드

## 에이전트 목록

| # | 에이전트 | 역할 | 코드 작성 |
|---|---------|------|----------|
| 1 | **Thinking Agent** | 문제 분석, 근본 원인 파악, 해결 전략 수립 | X (분석만) |
| 2 | **API Agent** | API 연동 전체 파이프라인 (zod 스키마 → Service → Query Hook) | O |
| 3 | **UI Builder Agent** | 디자인 시스템 기반 화면 구현 (Tailwind + shadcn) | O |
| 4 | **Planning Agent** | 기획 관리, 영향 범위 분석, 사이드이펙트 감지 | X (분석만) |
| 5 | **Schema Generator Agent** | zod 스키마 (Request/Response), TypeScript 타입 생성 | O |
| 6 | **Code Review Agent** | 컨벤션/디자인 시스템 준수 검증, 코드 품질 리포트 | X (리포트만) |
| 7 | **Debug Agent** | 빌드/런타임/UI 에러 분석 및 수정 | O |
| 8 | **Routing & State Agent** | App Router 라우팅, 상태관리, 화면 흐름 설계 | O |
| 9 | **Refactor Agent** | 중복 제거, 컴포넌트 분리, 성능 최적화 | O |

## 빠른 사용법

모든 에이전트는 Claude Code의 **Task tool**로 호출합니다.

### 기본 호출 패턴

```
Task tool:
  subagent_type: "general-purpose"
  prompt: |
    [{에이전트 이름}]

    당신은 {에이전트 이름}입니다. {역할 한 줄 설명}

    ## 요청
    {구체적인 요청 내용}

    ## 프로젝트 경로
    /Users/easydong/one-pointer
```

---

## 시나리오별 사용 가이드

### 시나리오 1: 새 기능 개발 (처음부터 끝까지)

```
Step 1: Planning Agent → 기획 분석 + 영향 범위 파악
Step 2: Schema Generator Agent → zod 스키마 생성
Step 3: API Agent → Service + Query Hook 연동
Step 4: UI Builder Agent → 화면 구현
Step 5: Routing & State Agent → 라우팅 연결
Step 6: Code Review Agent → 최종 검증
```

### 시나리오 2: 버그 수정

```
Step 1: Thinking Agent → 문제 분석 + 원인 파악
Step 2: Debug Agent → 에러 수정
Step 3: Planning Agent → 사이드이펙트 확인
```

### 시나리오 3: 기존 코드 개선

```
Step 1: Code Review Agent → 문제점 파악
Step 2: Refactor Agent → 코드 정리/개선
Step 3: Code Review Agent → 개선 후 재검증
```

### 시나리오 4: API 변경 대응

```
Step 1: Planning Agent → 영향 범위 분석
Step 2: Schema Generator Agent → zod 스키마 수정
Step 3: API Agent → Service 함수 수정
Step 4: Debug Agent → 타입 에러 수정
```

### 시나리오 5: 화면 간 데이터 흐름 설계

```
Step 1: Routing & State Agent → 화면 흐름 + 상태 설계
Step 2: UI Builder Agent → 화면 구현
```

---

## 에이전트 조합 패턴

### "풀 파이프라인" (새 기능 전체)
4 → 5 → 2 → 3 → 8 → 6

### "핫픽스" (긴급 버그)
1 → 7

### "품질 개선" (리팩토링)
6 → 9 → 6

### "API 변경" (서버 스펙 변경)
4 → 5 → 2 → 7

---

## 병렬 실행 팁

독립적인 에이전트는 **동시에 실행**할 수 있습니다:

```
// 동시 실행 가능 (서로 의존성 없음)
- Schema Generator Agent (zod 스키마 생성)
- Planning Agent (사이드이펙트 분석)

// 순차 실행 필요 (의존성 있음)
- Schema Generator Agent → API Agent (스키마가 먼저 필요)
- API Agent → UI Builder Agent (API 훅이 먼저 필요)
```

## 아키텍처 레이어 참고

```
clientFetch (HTTP) → Service (zod validate) → Query Hook (TanStack Query) → UI (React)
```

```
src/
├── app/                  # Next.js App Router (라우팅, 레이아웃, providers)
├── shared/
│   ├── api/http/*        # clientFetch (transport only)
│   ├── ui/               # Text, Button 등 공통 컴포넌트
│   └── config/           # env.ts
├── entities/
│   └── <domain>/
│       ├── api/          # zod 스키마 + service 함수
│       └── model/        # query-keys.ts
└── features/
    └── <domain>/
        └── <use-case>/
            ├── model/    # useQuery/useMutation 훅
            └── ui/       # 컴포넌트
```
