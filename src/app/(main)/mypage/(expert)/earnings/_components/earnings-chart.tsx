"use client"

import { TrendingUp } from "lucide-react"

import type { EarningsGraphPoint } from "@/entities/earnings/api/earnings.schema"
import { Text } from "@/shared/ui/text"

type Props = {
  data: EarningsGraphPoint[]
}

function formatAmount(n: number) {
  return n.toLocaleString("ko-KR") + "원"
}

export function EarningsChart({ data }: Props) {
  if (data.length === 0) return null

  const maxAmount = Math.max(
    ...data.map((d) => d.settledAmount + d.pendingAmount),
    1,
  )

  return (
    <div className="bg-card border-border flex h-full flex-col rounded-2xl border p-6 shadow-sm">
      <div className="flex items-center gap-2.5">
        <div className="bg-primary-light flex h-9 w-9 items-center justify-center rounded-xl">
          <TrendingUp className="text-primary h-4.5 w-4.5" />
        </div>
        <Text typography="subtitle2-bold" className="text-foreground">
          수익 추이
        </Text>
      </div>

      <div className="mt-6 flex flex-1 items-end gap-2" style={{ minHeight: 140 }}>
        {data.map((point) => {
          const total = point.settledAmount + point.pendingAmount
          const heightPercent = (total / maxAmount) * 100
          const settledPercent =
            total > 0 ? (point.settledAmount / total) * 100 : 0

          return (
            <div
              key={point.label}
              className="group flex min-w-0 flex-1 flex-col items-center gap-2"
            >
              <div className="relative flex w-full flex-1 items-end justify-center">
                <div
                  className="relative w-full min-w-[8px] max-w-[36px] overflow-hidden rounded-md transition-opacity group-hover:opacity-100 [&:not(:hover)]:opacity-90"
                  style={{ height: `${Math.max(heightPercent, 3)}%` }}
                  title={`${point.label} · ${formatAmount(total)}`}
                >
                  <div className="bg-primary/25 absolute inset-0" />
                  <div
                    className="bg-primary absolute inset-x-0 bottom-0 transition-[height]"
                    style={{ height: `${settledPercent}%` }}
                  />
                </div>
              </div>
              <Text
                typography="caption2-medium"
                className="text-muted-foreground w-full truncate text-center"
              >
                {point.label}
              </Text>
            </div>
          )
        })}
      </div>

      <div className="border-border mt-5 flex items-center gap-4 border-t pt-4">
        <div className="flex items-center gap-1.5">
          <div className="bg-primary h-2.5 w-2.5 rounded-sm" />
          <Text typography="caption2-medium" className="text-muted-foreground">
            정산 완료
          </Text>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="bg-primary/25 h-2.5 w-2.5 rounded-sm" />
          <Text typography="caption2-medium" className="text-muted-foreground">
            정산 대기
          </Text>
        </div>
      </div>
    </div>
  )
}
