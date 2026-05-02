"use client"

import { Text } from "@/shared/ui/text"

type Props = {
  visible: boolean
  nickname: string | null | undefined
}

/**
 * 입력창 바로 위에 노출되는 "상대방이 입력 중..." 인디케이터.
 * 3초 후 자동 해제는 useTypingIndicator 훅이 책임.
 */
export function TypingIndicator({ visible, nickname }: Props) {
  if (!visible) return null
  const name = nickname?.trim() || "상대방"

  return (
    <div className="px-4 py-1.5 md:px-6 lg:px-10">
      <Text
        as="span"
        typography="caption2-medium"
        className="text-muted-foreground italic"
      >
        {name}님이 입력 중<DotPulse />
      </Text>
    </div>
  )
}

function DotPulse() {
  return (
    <span aria-hidden className="ml-0.5 inline-flex gap-0.5">
      <Dot delay="0ms" />
      <Dot delay="150ms" />
      <Dot delay="300ms" />
    </span>
  )
}

function Dot({ delay }: { delay: string }) {
  return (
    <span
      className="inline-block h-1 w-1 animate-bounce rounded-full bg-current"
      style={{ animationDelay: delay }}
    />
  )
}
