"use client"

import { Plus, Send } from "lucide-react"

import { cn } from "@/shared/lib/utils"

type Props = {
  isConnected: boolean
}

/**
 * Phase 05 placeholder.
 *
 * sticky bottom-0 — body window 스크롤 컨텍스트에서 viewport 하단 고정.
 * iOS safe-area 는 BottomNav 가 모바일에서 관리하므로 데스크탑에선 추가 처리 X.
 *
 * Phase 07 에서 실제 textarea + 전송 + 첨부 + 타이핑 송신 로직으로 교체된다.
 */
export function ChatInputPlaceholder({ isConnected }: Props) {
  return (
    <div className="bg-background/95 border-border sticky bottom-0 z-20 border-t backdrop-blur-md">
      <div className="flex items-center gap-2 px-4 py-3 md:px-6 lg:px-10">
        <button
          type="button"
          aria-label="첨부 (Phase 07)"
          disabled
          className="text-muted-foreground hover:bg-muted/40 flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors disabled:opacity-50"
        >
          <Plus className="h-5 w-5" />
        </button>

        <div
          className={cn(
            "border-border flex-1 rounded-full border px-4 py-2 text-sm",
            "text-muted-foreground bg-muted/30 cursor-not-allowed select-none",
          )}
        >
          {isConnected
            ? "메시지 입력 영역 — Phase 07 에서 활성화"
            : "연결 중..."}
        </div>

        <button
          type="button"
          aria-label="전송 (Phase 07)"
          disabled
          className="bg-primary/40 text-primary-foreground flex h-9 w-9 shrink-0 items-center justify-center rounded-full disabled:cursor-not-allowed"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
