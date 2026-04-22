"use client"

import { useRouter } from "next/navigation"
import { useRef, useState, type FormEvent, type KeyboardEvent } from "react"
import { Search, Trash2 } from "lucide-react"
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/shared/ui/popover"
import { Text } from "@/shared/ui/text"
import { cn } from "@/shared/lib/utils"
import { useSearchHistory } from "../model/use-search-history"
import { SearchHistoryList } from "./search-history-list"

/**
 * 데스크탑 헤더 검색 — Input + Popover(히스토리).
 *
 * - Input focus 시 Popover open
 * - 포커스만으로는 URL 이동 X
 * - Enter 또는 히스토리 클릭 시 /search?keyword=... 로 이동 + 히스토리 저장
 * - IME 조합 중 Enter 는 무시
 */
export function HeaderSearchPopover() {
  const router = useRouter()
  const { history, add, remove, clear } = useSearchHistory()
  const [keyword, setKeyword] = useState("")
  const [open, setOpen] = useState(false)
  const isComposingRef = useRef(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const navigate = (kw: string) => {
    const trimmed = kw.trim()
    if (!trimmed) return
    add(trimmed)
    setOpen(false)
    inputRef.current?.blur()
    router.push(`/search?keyword=${encodeURIComponent(trimmed)}`)
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    navigate(keyword)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setOpen(false)
      inputRef.current?.blur()
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <form
          onSubmit={handleSubmit}
          className="relative w-full"
          role="search"
        >
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <input
            ref={inputRef}
            type="search"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            onCompositionStart={() => {
              isComposingRef.current = true
            }}
            onCompositionEnd={() => {
              isComposingRef.current = false
            }}
            onKeyDownCapture={(e) => {
              if (e.key === "Enter" && isComposingRef.current) {
                e.preventDefault()
                e.stopPropagation()
              }
            }}
            placeholder="의뢰 검색"
            aria-label="의뢰 검색"
            className={cn(
              "border-input bg-background/60 placeholder:text-muted-foreground h-10 w-full rounded-full border py-2 pr-4 pl-10 text-sm shadow-xs outline-none transition-colors",
              "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
            )}
          />
        </form>
      </PopoverAnchor>

      <PopoverContent
        align="start"
        sideOffset={8}
        className="w-(--radix-popover-trigger-width) p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
        onInteractOutside={(e) => {
          // Input 쪽 클릭은 anchor 이므로 정상적으로 유지됨
          if (e.target === inputRef.current) e.preventDefault()
        }}
      >
        <div className="border-border/50 flex items-center justify-between border-b px-4 py-2.5">
          <Text as="span" typography="caption1-bold" className="text-muted-foreground">
            최근 검색
          </Text>
        </div>
        <div className="max-h-64 overflow-y-auto">
          <SearchHistoryList
            history={history}
            onSelect={navigate}
            onRemove={remove}
          />
        </div>
        {history.length > 0 && (
          <div className="border-border/50 flex items-center justify-end border-t px-2 py-1.5">
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
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
