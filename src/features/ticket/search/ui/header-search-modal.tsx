"use client"

import { useRouter } from "next/navigation"
import { useRef, useState, type FormEvent } from "react"
import { ArrowLeft, Search, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog"
import { Text } from "@/shared/ui/text"
import { cn } from "@/shared/lib/utils"
import { useSearchHistory } from "../model/use-search-history"
import { SearchHistoryList } from "./search-history-list"

/**
 * 모바일 헤더 검색 — Search 아이콘 버튼 → 풀스크린 Dialog.
 *
 * - 아이콘 탭 시 풀사이즈 모달 open (`h-dvh w-screen`)
 * - Input autofocus
 * - Enter / 검색 아이콘 탭 시 /search?keyword=... 이동 + 모달 닫힘 + 히스토리 저장
 * - IME 조합 중 Enter 무시
 */
export function HeaderSearchModal() {
  const router = useRouter()
  const { history, add, remove, clear } = useSearchHistory()
  const [open, setOpen] = useState(false)
  const [keyword, setKeyword] = useState("")
  const isComposingRef = useRef(false)

  const navigate = (kw: string) => {
    const trimmed = kw.trim()
    if (!trimmed) return
    add(trimmed)
    setOpen(false)
    setKeyword("")
    router.push(`/search?keyword=${encodeURIComponent(trimmed)}`)
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (isComposingRef.current) return
    navigate(keyword)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label="검색 열기"
          className="text-foreground hover:bg-muted flex h-9 w-9 items-center justify-center rounded-full transition-colors"
        >
          <Search className="h-5 w-5" />
        </button>
      </DialogTrigger>

      <DialogContent
        showCloseButton={false}
        className={cn(
          "bg-background flex h-dvh w-screen max-w-none translate-x-0 translate-y-0 flex-col gap-0 rounded-none border-0 p-0",
          "top-0 left-0",
          // 기본 zoom 대신 위에서 아래로 슬라이드 다운 애니메이션
          "duration-300",
          "data-[state=open]:zoom-in-100 data-[state=open]:slide-in-from-top-full",
          "data-[state=closed]:zoom-out-100 data-[state=closed]:slide-out-to-top-full",
        )}
      >
        <DialogTitle className="sr-only">의뢰 검색</DialogTitle>
        <DialogDescription className="sr-only">
          키워드를 입력한 뒤 Enter 또는 검색 버튼으로 검색 결과 페이지로 이동합니다
        </DialogDescription>

        {/* 상단 바 */}
        <form
          onSubmit={handleSubmit}
          role="search"
          className="border-border/50 flex items-center gap-2 border-b px-3 py-2"
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="닫기"
            className="text-foreground hover:bg-muted flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="relative flex-1">
            <input
              type="search"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onCompositionStart={() => {
                isComposingRef.current = true
              }}
              onCompositionEnd={() => {
                isComposingRef.current = false
              }}
              placeholder="의뢰 검색"
              aria-label="의뢰 검색"
              autoFocus
              className={cn(
                "border-input placeholder:text-muted-foreground h-10 w-full rounded-full border bg-transparent py-2 pr-4 pl-4 text-sm shadow-xs outline-none transition-colors",
                "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
              )}
            />
          </div>
          <button
            type="submit"
            aria-label="검색"
            className="text-foreground hover:bg-muted flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors"
          >
            <Search className="h-5 w-5" />
          </button>
        </form>

        {/* 히스토리 */}
        <div className="flex flex-1 flex-col overflow-y-auto">
          <div className="border-border/50 flex items-center justify-between border-b px-4 py-2.5">
            <Text as="span" typography="caption1-bold" className="text-muted-foreground">
              최근 검색
            </Text>
            {history.length > 0 && (
              <button
                type="button"
                onClick={clear}
                className="text-muted-foreground hover:text-foreground flex items-center gap-1 rounded px-2 py-1 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <Text as="span" typography="caption1-medium">
                  전체 삭제
                </Text>
              </button>
            )}
          </div>
          <SearchHistoryList
            history={history}
            onSelect={navigate}
            onRemove={remove}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
