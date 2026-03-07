---
name: form
description: 폼(Form) 구현 규칙. react-hook-form + zod v4 조합, 유효성 검사, 에러 표시, submit 처리 등 모든 폼 관련 작업 시 참고한다. /form 으로 호출하거나 폼 UI를 새로 만들 때 반드시 읽는다.
---

# Form 구현 규칙

모든 폼은 **react-hook-form + zod v4** 조합으로 구현한다.

## 기술 스택

| 라이브러리 | 용도 |
|---|---|
| `react-hook-form` | 폼 상태 관리, register, handleSubmit |
| `zod/v4` | 스키마 정의 및 유효성 검사 |
| `@hookform/resolvers/zod` | zod 스키마를 react-hook-form resolver로 연결 |

## 스키마 위치

폼에서 사용하는 zod 스키마는 해당 도메인의 **Service Layer 스키마 파일**에 정의한다.

```
src/entities/<domain>/api/<domain>.schema.ts
```

- 요청 스키마: `<action>RequestSchema` (예: `loginRequestSchema`, `signupRequestSchema`)
- 타입 export: `export type LoginRequest = z.infer<typeof loginRequestSchema>`

## FSD 파일 구조

```
src/
├── entities/<domain>/api/
│   └── <domain>.schema.ts      # zod 스키마 + 타입 (Request/Response)
│
└── features/<domain>/<use-case>/
    ├── model/
    │   └── use-<action>-mutation.ts   # useMutation (비즈니스 로직)
    └── ui/
        └── <name>-form.tsx            # 폼 UI (react-hook-form 연결)
```

## 구현 패턴

### 1. 스키마 정의 (entities layer)

```typescript
// src/entities/auth/api/auth.schema.ts
import { z } from "zod/v4"

export const loginRequestSchema = z.object({
  email: z.string().email("유효한 이메일 형식이 아닙니다."),
  password: z.string().min(1, "비밀번호를 입력해주세요."),
})

export type LoginRequest = z.infer<typeof loginRequestSchema>
```

### 2. Mutation Hook (features/model layer)

폼 submit의 비즈니스 로직(API 호출, 캐시 무효화, 상태 전환)은 mutation hook에서만 처리한다.

```typescript
// src/features/auth/sign-in/model/use-login-mutation.ts
export function useLoginMutation() {
  return useMutation({
    mutationFn: login,
    onSuccess: (response) => {
      setAuthenticated(response.data.user)
      queryClient.invalidateQueries({ queryKey: authQueryKeys.me })
    },
  })
}
```

### 3. 폼 UI (features/ui layer)

UI 컴포넌트는 레이아웃·입력 렌더링·에러 표시만 담당한다. 비즈니스 로직은 mutation hook에 위임한다.

```typescript
// src/features/auth/sign-in/ui/login-form.tsx
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { loginRequestSchema, type LoginRequest } from "@/entities/auth/api/auth.schema"
import { useLoginMutation } from "@/features/auth/sign-in/model/use-login-mutation"

export function LoginForm() {
  const loginMutation = useLoginMutation()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginRequest>({
    resolver: zodResolver(loginRequestSchema as never),
    mode: "onBlur",
    defaultValues: { email: "", password: "" },
  })

  const onSubmit = handleSubmit(async (values) => {
    await loginMutation.mutateAsync(values)
  })

  const isPending = loginMutation.isPending || isSubmitting

  return (
    <form onSubmit={onSubmit}>
      {/* 입력 필드 */}
    </form>
  )
}
```

## 필드 에러 표시

각 필드 바로 아래에 `caption1-medium` + `text-destructive`로 표시한다.

```tsx
{errors.email ? (
  <Text as="p" typography="caption1-medium" className="text-destructive">
    {errors.email.message}
  </Text>
) : null}
```

## API 에러 표시

mutation 에러(API 오류)는 submit 버튼 위에 별도 블록으로 표시한다.

```tsx
{errorMessage ? (
  <Text
    as="p"
    typography="caption1-medium"
    className="border-destructive/25 bg-destructive/10 text-destructive rounded-md border px-3 py-2"
  >
    {errorMessage}
  </Text>
) : null}
```

에러 메시지 resolve 함수는 폼 파일 하단에 로컬로 정의한다.

```typescript
function resolveSubmitErrorMessage(error: unknown): string | null {
  if (!error) return null
  if (error instanceof ApiError) return error.message
  if (error instanceof ZodError) return "응답 데이터 형식이 올바르지 않습니다."
  if (error instanceof Error) return error.message
  return "요청 처리 중 알 수 없는 오류가 발생했습니다."
}
```

## useForm 옵션 기본값

| 옵션 | 값 | 이유 |
|---|---|---|
| `resolver` | `zodResolver(schema as never)` | zod v4 타입 호환 |
| `mode` | `"onBlur"` | 입력 중 에러 방지, 포커스 벗어날 때 검사 |
| `defaultValues` | 모든 필드 빈 값 명시 | 비제어 → 제어 컴포넌트 경고 방지 |

## isPending 처리

`isSubmitting`(react-hook-form)과 `isPending`(mutation) 둘 다 고려한다.

```typescript
const isPending = mutation.isPending || isSubmitting
```

## 공유 UI 컴포넌트

| 컴포넌트 | 경로 | 용도 |
|---|---|---|
| `Input` | `@/shared/ui/input` | 일반 텍스트 입력 |
| `PasswordInput` | `@/shared/ui/password-input` | 비밀번호 입력 (눈 아이콘 토글) |
| `Button` | `@/shared/ui/button` | 제출 버튼 |
| `Text` | `@/shared/ui/text` | 라벨, 에러 텍스트 |

## 금지 사항

- 폼 UI 컴포넌트 안에서 직접 API 호출 금지 → mutation hook 위임
- `mode: "onChange"` 사용 금지 → 타이핑 중 에러 표시로 UX 저하
- 스키마를 UI 파일 안에 인라인으로 정의 금지 → 반드시 entities layer에 위치
