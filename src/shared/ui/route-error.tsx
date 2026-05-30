"use client"

import { useEffect } from "react"
import { Button } from "@/shared/ui/button"
import { Text } from "@/shared/ui/text"

type RouteErrorProps = {
  /** App Router error.tsx 가 주입하는 에러 객체 */
  error: Error & { digest?: string }
  /** 해당 세그먼트를 다시 렌더 시도 */
  reset: () => void
  /** 사용자에게 보일 안내 문구 (기본: 일반 메시지) */
  message?: string
}

/**
 * 라우트 세그먼트 에러 바운더리 공용 UI (App Router `error.tsx` 용).
 * 각 라우트의 error.tsx 는 이 컴포넌트를 얇게 감싸기만 한다.
 */
export function RouteError({ error, reset, message }: RouteErrorProps) {
  useEffect(() => {
    // 운영 환경에서는 추후 에러 리포팅(Sentry 등)으로 대체 가능.
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <Text as="h1" typography="h2-bold" className="text-foreground">
        문제가 발생했어요
      </Text>
      <Text as="p" typography="body2-regular" className="text-muted-foreground">
        {message ?? "잠시 후 다시 시도해 주세요."}
      </Text>
      <Button variant="outline" onClick={reset}>
        다시 시도
      </Button>
    </div>
  )
}
