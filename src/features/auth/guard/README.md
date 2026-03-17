# AuthGuard — 인증 기반 라우트 보호

인증이 필요한 페이지나 액션을 보호하는 컴포넌트와 유틸리티.

## 구성

| 파일 | 역할 |
|------|------|
| `ui/auth-guard.tsx` | 보호 페이지 래퍼 컴포넌트 |
| `ui/login-prompt-modal.tsx` | 로그인 확인 다이얼로그 |
| `lib/open-login-prompt.tsx` | overlay-kit 명령형 오프너 |

## 사용법

### 1. 보호 페이지 전체를 래핑

비인증 사용자가 접근하면 로그인 모달을 표시한다.

```tsx
import { AuthGuard } from "@/features/auth/guard"

export default function TicketCreatePage() {
  return (
    <AuthGuard>
      <TicketCreateContent />
    </AuthGuard>
  )
}
```

**동작 흐름:**

1. `status === "idle" | "loading"` → 로딩 스피너 표시
2. `status === "unauthenticated"` → 로그인 모달 표시
   - "로그인하기" 클릭 → `/login?next=<현재경로>` 이동
   - "돌아가기" 클릭 → 이전 페이지로 복귀
3. `status === "authenticated"` → children 정상 렌더

### 2. 공개 페이지에서 특정 액션만 보호

페이지 자체는 공개이지만, 특정 버튼/액션만 인증이 필요한 경우.

```tsx
import { useAuthStore } from "@/entities/auth/model/auth-store"
import { openLoginPrompt } from "@/features/auth/guard"
import { buildLoginRedirectPath } from "@/shared/lib/redirect"

const handleAction = async () => {
  if (useAuthStore.getState().status !== "authenticated") {
    const result = await openLoginPrompt()
    if (result === "login") {
      router.push(buildLoginRedirectPath(pathname))
    }
    return
  }

  // 인증된 상태에서의 로직
}
```

## AuthRedirectWatcher

`src/app/providers.tsx`에 포함된 전역 감시 컴포넌트.

인증 상태에서 401 에러가 발생하여 `authenticated → unauthenticated`로 전환되면 자동으로 `/login?next=<현재경로>`로 리다이렉트한다.

별도 설정 없이 Providers 내부에서 동작한다.
