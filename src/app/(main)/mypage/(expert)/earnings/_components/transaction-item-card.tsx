"use client"

import type { TransactionItem } from "@/entities/earnings/api/earnings.schema"
import { Text } from "@/shared/ui/text"
import { cn } from "@/shared/lib/utils"

type Props = {
  item: TransactionItem
}

function formatAmount(n: number) {
  return n.toLocaleString("ko-KR") + "원"
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`
}

export function TransactionItemCard({ item }: Props) {
  const isSettled = item.status === "SETTLED"

  return (
    <div className="border-border bg-card hover:border-primary/30 flex flex-col gap-2.5 rounded-xl border p-4 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <Text
          typography="body3-medium"
          className="text-foreground line-clamp-1 flex-1"
        >
          {item.ticketTitle}
        </Text>
        <Text
          typography="body2-bold"
          className="text-foreground shrink-0 tabular-nums"
        >
          {formatAmount(item.netAmount ?? item.originalAmount)}
        </Text>
      </div>

      <div className="flex items-center gap-2">
        <Text typography="caption2-medium" className="text-muted-foreground">
          {item.clientNickname}
        </Text>
        <span className="bg-border h-2.5 w-px" />
        <Text
          typography="caption2-medium"
          className="text-muted-foreground tabular-nums"
        >
          {formatDate(item.paidAt)}
        </Text>
      </div>

      <div className="border-border/60 flex items-center justify-between border-t pt-2.5">
        <Text
          typography="caption2-medium"
          className="text-muted-foreground tabular-nums"
        >
          수수료 {formatAmount(item.fee ?? 0)}
        </Text>
        <div
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1",
            isSettled
              ? "bg-emerald-50 text-emerald-700"
              : "bg-amber-50 text-amber-700",
          )}
        >
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              isSettled ? "bg-emerald-500" : "bg-amber-500",
            )}
          />
          <Text typography="caption2-medium" className="text-current">
            {isSettled ? "정산완료" : "정산대기"}
          </Text>
        </div>
      </div>

      {!isSettled && item.estimatedSettlementDate && (
        <Text
          typography="caption2-medium"
          className="text-muted-foreground tabular-nums"
        >
          예상 정산일: {formatDate(item.estimatedSettlementDate)}
        </Text>
      )}
    </div>
  )
}
