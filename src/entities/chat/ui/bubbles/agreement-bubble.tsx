"use client"

import { ChevronRight, FileSignature } from "lucide-react"

import { Text } from "@/shared/ui/text"
import { cn } from "@/shared/lib/utils"

type Props = {
  content: string
  isMine: boolean
  /** 카드 클릭 핸들러. 미지정 시 disabled — 리뷰 스냅샷 reuse 시. */
  onClick?: () => void
}

/**
 * 합의서 카드 메시지. 클릭 시 호출처가 합의서 상세 다이얼로그를 연다 (Wave 3a 에서 wiring).
 * 리뷰 스냅샷에서 reuse 시엔 onClick 없이 disabled 로 표시.
 */
export function AgreementBubble({ content, isMine, onClick }: Props) {
  const isInteractive = onClick != null

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!isInteractive}
      className={cn(
        "border-border flex max-w-[260px] flex-col items-stretch gap-2 rounded-2xl border bg-background p-3 text-left md:max-w-[320px]",
        isMine ? "rounded-br-sm" : "rounded-bl-sm",
        isInteractive && "hover:bg-accent transition-colors",
      )}
    >
      <div className="flex items-center gap-2">
        <div className="bg-primary-light flex h-7 w-7 items-center justify-center rounded-md">
          <FileSignature className="text-primary h-4 w-4" />
        </div>
        <Text typography="caption1-bold" className="text-foreground">
          합의서
        </Text>
      </div>

      {content && (
        <Text
          as="p"
          typography="caption1-medium"
          className="text-muted-foreground line-clamp-2"
        >
          {content}
        </Text>
      )}

      <div className="border-border/50 mt-1 flex items-center justify-between border-t pt-2">
        <Text
          as="span"
          typography="caption2-medium"
          className="text-muted-foreground"
        >
          합의서 확인하기
        </Text>
        <ChevronRight className="text-muted-foreground h-3.5 w-3.5" />
      </div>
    </button>
  )
}
