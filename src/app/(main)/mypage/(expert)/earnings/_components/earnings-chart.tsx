"use client"

import type { EarningsGraphPoint } from "@/entities/earnings/api/earnings.schema"
import { Text } from "@/shared/ui/text"

type Props = {
  data: EarningsGraphPoint[]
}

export function EarningsChart({ data }: Props) {
  if (data.length === 0) return null

  const maxAmount = Math.max(
    ...data.map((d) => d.settledAmount + d.pendingAmount),
    1,
  )

  return (
    <div className="bg-card border-border rounded-xl border p-5 shadow-sm">
      <Text typography="subtitle2-bold" className="text-foreground mb-4">
        수익 추이
      </Text>

      <div className="flex items-end gap-1.5" style={{ height: 120 }}>
        {data.map((point) => {
          const total = point.settledAmount + point.pendingAmount
          const heightPercent = (total / maxAmount) * 100
          const settledPercent =
            total > 0 ? (point.settledAmount / total) * 100 : 0

          return (
            <div
              key={point.label}
              className="flex min-w-0 flex-1 flex-col items-center gap-1"
            >
              <div
                className="relative w-full min-w-[8px] max-w-[40px] overflow-hidden rounded-t"
                style={{ height: `${Math.max(heightPercent, 2)}%` }}
              >
                <div className="bg-primary/30 absolute inset-0" />
                <div
                  className="bg-primary absolute bottom-0 left-0 right-0"
                  style={{ height: `${settledPercent}%` }}
                />
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

      <div className="mt-3 flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className="bg-primary h-2.5 w-2.5 rounded-sm" />
          <Text typography="caption2-medium" className="text-muted-foreground">
            정산 완료
          </Text>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="bg-primary/30 h-2.5 w-2.5 rounded-sm" />
          <Text typography="caption2-medium" className="text-muted-foreground">
            정산 대기
          </Text>
        </div>
      </div>
    </div>
  )
}
