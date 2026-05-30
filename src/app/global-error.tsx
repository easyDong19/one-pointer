"use client"

import { useEffect } from "react"
import "./globals.css"

/**
 * 루트 layout 자체에서 발생한 에러를 처리하는 최상위 바운더리.
 * 루트 layout 을 대체하므로 자체 <html>/<body> 를 렌더해야 한다.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/variable/pretendardvariable.css"
        />
      </head>
      <body className="antialiased">
        <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
          <h1 className="text-foreground text-2xl font-bold">문제가 발생했어요</h1>
          <p className="text-muted-foreground text-sm">
            잠시 후 다시 시도해 주세요.
          </p>
          <button
            type="button"
            onClick={reset}
            className="border-input hover:bg-accent rounded-md border px-4 py-2 text-sm font-medium"
          >
            다시 시도
          </button>
        </div>
      </body>
    </html>
  )
}
