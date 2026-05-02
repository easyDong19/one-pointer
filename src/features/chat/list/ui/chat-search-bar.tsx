"use client"

import { Search, X } from "lucide-react"

import { cn } from "@/shared/lib/utils"

type Props = {
  value: string
  onChange: (next: string) => void
  className?: string
}

export function ChatSearchBar({ value, onChange, className }: Props) {
  return (
    <div
      className={cn(
        "border-border bg-background focus-within:border-primary flex h-10 items-center gap-2 rounded-lg border px-3 transition-colors",
        className,
      )}
    >
      <Search className="text-muted-foreground h-4 w-4 shrink-0" />
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="닉네임 · 의뢰 · 메시지 검색"
        className="placeholder:text-muted-foreground text-foreground flex-1 bg-transparent text-sm outline-none"
      />
      {value.length > 0 && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="검색어 지우기"
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
