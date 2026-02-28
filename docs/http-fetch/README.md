# HTTP Fetch Layer Guide

이 문서는 `src/lib/http/*` 커스텀 fetch 레이어 사용법을 설명합니다.

## 목적

- 서버/클라이언트 fetch 호출 규칙을 분리
- 공통 에러(`ApiError`)로 표준화
- 클라이언트 401 발생 시 refresh + 재시도 자동화
- Next.js 서버 캐시 옵션(`revalidate`, `noStore`, `tags`) 지원

## 파일 구조

```txt
src/lib/http/
  api-error.ts
  core.ts
  server-fetch.ts
  client-fetch.ts
  index.ts
```

## 기본 import

```ts
import { clientFetch, serverFetch, ApiError } from "@/src/lib/http"
```

## 1) serverFetch 사용법 (RSC / Route Handler / Server Action)

`serverFetch`는 기본적으로 `BASE_URL`(`env.ts`)을 사용하고, 필요하면 `baseUrl`로 덮어쓸 수 있습니다.

### 기본 GET + revalidate

```ts
const tickets = await serverFetch<TicketListItem[]>({
  path: "/tickets",
  method: "GET",
  revalidate: 60,
  tags: ["tickets"],
})
```

### noStore(항상 최신)

```ts
const me = await serverFetch<UserProfile>({
  path: "/user/me",
  method: "GET",
  noStore: true,
})
```

### POST/PUT/PATCH/DELETE

```ts
const created = await serverFetch<Ticket, CreateTicketInput>({
  path: "/tickets",
  method: "POST",
  body: {
    title: "골프 레슨 문의",
    ticketType: "OFFLINE",
  },
})
```

### query string

```ts
const list = await serverFetch<TicketListItem[]>({
  path: "/tickets",
  query: { status: "OPEN", page: 1, sort: "latest" },
  revalidate: 30,
})
```

## 2) clientFetch 사용법 (Client Component)

`clientFetch`는 항상 `credentials: "include"`로 실행됩니다.

- 401 응답 -> `POST /auth/refresh` 1회 시도
- refresh 성공 -> 원요청 1회 재시도
- 동시 401 다발 요청 -> refresh는 lock으로 1회만 실행

### 기본 GET

```ts
const rooms = await clientFetch<ChatRoom[]>({
  path: "/chats",
  method: "GET",
})
```

### mutation

```ts
await clientFetch<Proposal, CreateProposalInput>({
  path: "/proposals",
  method: "POST",
  body: payload,
})
```

### refresh 동작 제외가 필요한 경우

```ts
await clientFetch({
  path: "/auth/refresh",
  method: "POST",
  skipAuthRefresh: true,
})
```

## 3) 에러 처리 방식 (`ApiError`)

모든 네트워크/HTTP 에러는 `ApiError`로 throw 됩니다.

```ts
try {
  const data = await clientFetch<MyData>({ path: "/my/data" })
} catch (error) {
  if (error instanceof ApiError) {
    console.error(error.status, error.message, error.path)
    // status 기반 분기 처리 (예: 403 -> 권한 없음 UI)
    return
  }
  throw error
}
```

`ApiError` 필드:

- `status`: HTTP status (네트워크 계열은 `0`)
- `message`: 응답에서 추출한 메시지
- `path`: 요청 경로
- `method`: HTTP 메서드
- `details`: 원본 응답 payload

## 4) 도메인 서비스 레이어 패턴

도메인별 함수는 `src/services/<domain>/`에 배치하는 것을 권장합니다.

예시:

```ts
// src/services/tickets/tickets.service.ts
import { clientFetch, serverFetch } from "@/src/lib/http"

export function getTicketsServer() {
  return serverFetch<Ticket[]>({
    path: "/tickets",
    revalidate: 60,
    tags: ["tickets"],
  })
}

export function getTicketsClient() {
  return clientFetch<Ticket[]>({
    path: "/tickets",
  })
}

export function createTicket(input: CreateTicketInput) {
  return clientFetch<Ticket, CreateTicketInput>({
    path: "/tickets",
    method: "POST",
    body: input,
  })
}
```

## 5) TanStack Query 예시

```ts
"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createTicket, getTicketsClient } from "@/src/services/tickets/tickets.service"

const ticketQueryKeys = {
  all: ["tickets"] as const,
}

export function useTicketsQuery() {
  return useQuery({
    queryKey: ticketQueryKeys.all,
    queryFn: getTicketsClient,
  })
}

export function useCreateTicketMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createTicket,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ticketQueryKeys.all,
      })
    },
  })
}
```

## 6) 환경변수

- 서버 base URL: `BASE_URL`
- 클라이언트 base URL(선택): `NEXT_PUBLIC_BASE_URL`

`env.ts`에서 타입/검증을 담당합니다.
