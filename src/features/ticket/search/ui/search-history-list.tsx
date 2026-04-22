"use client"

import { Clock, X } from "lucide-react"
import { Text } from "@/shared/ui/text"

type SearchHistoryListProps = {
  history: string[]
  onSelect: (keyword: string) => void
  onRemove: (keyword: string) => void
  /** 빈 상태 placeholder (default: "최근 검색한 내역이 없습니다") */
  emptyText?: string
}

export function SearchHistoryList({
  history,
  onSelect,
  onRemove,
  emptyText = "최근 검색한 내역이 없습니다",
}: SearchHistoryListProps) {
  if (history.length === 0) {
    return (
      <div className="flex items-center justify-center px-5 py-10">
        <Text as="p" typography="body3-regular" className="text-muted-foreground">
          {emptyText}
        </Text>
      </div>
    )
  }

  return (
    <ul role="listbox" className="flex flex-col">
      {history.map((keyword) => (
        <li key={keyword} role="option" aria-selected="false">
          <div className="hover:bg-muted/50 group flex items-center gap-3 px-4 py-2.5 transition-colors">
            <button
              type="button"
              onClick={() => onSelect(keyword)}
              className="flex min-w-0 flex-1 items-center gap-3 text-left"
            >
              <Clock className="text-muted-foreground h-4 w-4 shrink-0" />
              <Text
                as="span"
                typography="body3-medium"
                className="text-foreground truncate"
              >
                {keyword}
              </Text>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onRemove(keyword)
              }}
              aria-label={`검색어 삭제: ${keyword}`}
              className="text-muted-foreground hover:text-foreground flex h-6 w-6 shrink-0 items-center justify-center rounded transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}
