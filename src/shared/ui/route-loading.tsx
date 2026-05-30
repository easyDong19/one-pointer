/**
 * 라우트 세그먼트 로딩 폴백 (App Router `loading.tsx` 용 공용 UI).
 * 서버 컴포넌트 await / Suspense 스트리밍 중 표시된다.
 */
export function RouteLoading({ label }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-4"
    >
      <div className="border-primary size-8 animate-spin rounded-full border-4 border-t-transparent" />
      <span className="sr-only">{label ?? "불러오는 중"}</span>
    </div>
  )
}
