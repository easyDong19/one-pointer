import { Suspense } from "react"
import { SearchContent } from "./_components/search-content"

/**
 * /search — 의뢰 키워드 검색 결과 페이지.
 *
 * `SearchContent` 가 `useSearchParams()` 를 사용하므로 Next 의 규약에 따라
 * Suspense 경계로 감싼다.
 */
export default function SearchPage() {
  return (
    <Suspense fallback={<SearchFallback />}>
      <SearchContent />
    </Suspense>
  )
}

function SearchFallback() {
  return (
    <div className="bg-background flex min-h-dvh items-center justify-center">
      <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
    </div>
  )
}
