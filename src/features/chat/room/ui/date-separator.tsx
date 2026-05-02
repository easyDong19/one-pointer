"use client"

import { Text } from "@/shared/ui/text"

import { formatDateSeparator } from "../lib/format-bubble-time"

type Props = {
  date: string | null | undefined
}

/** 메시지 사이의 날짜 구분선. */
export function DateSeparator({ date }: Props) {
  const label = formatDateSeparator(date)
  if (!label) return null

  return (
    <div className="my-3 flex items-center gap-3">
      <span aria-hidden className="bg-border h-px flex-1" />
      <Text
        as="span"
        typography="caption2-medium"
        className="text-muted-foreground shrink-0"
      >
        {label}
      </Text>
      <span aria-hidden className="bg-border h-px flex-1" />
    </div>
  )
}
