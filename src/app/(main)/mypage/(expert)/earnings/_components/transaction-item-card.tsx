"use client"

import type { TransactionItem } from "@/entities/earnings/api/earnings.schema"
import { Badge } from "@/shared/ui/badge"
import { Text } from "@/shared/ui/text"

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
    <div className="border-border flex flex-col gap-2 rounded-lg border p-4">
      <div className="flex items-start justify-between gap-2">
        <Text typography="body3-medium" className="text-foreground line-clamp-1 flex-1">
          {item.ticketTitle}
        </Text>
        <Text typography="body2-bold" className="text-foreground shrink-0 tabular-nums">
          {formatAmount(item.netAmount ?? item.originalAmount)}
        </Text>
      </div>

      <div className="flex items-center gap-2">
        <Text typography="caption2-medium" className="text-muted-foreground">
          {item.clientNickname}
        </Text>
        <span className="text-border">·</span>
        <Text typography="caption2-medium" className="text-muted-foreground tabular-nums">
          {formatDate(item.paidAt)}
        </Text>
      </div>

      <div className="flex items-center justify-between">
        <Text typography="caption2-medium" className="text-muted-foreground tabular-nums">
          수수료 {formatAmount(item.fee ?? 0)}
        </Text>
        <Badge variant={isSettled ? "secondary" : "outline"}>
          {isSettled ? "정산완료" : "정산대기"}
        </Badge>
      </div>

      {!isSettled && item.estimatedSettlementDate && (
        <Text typography="caption2-medium" className="text-muted-foreground tabular-nums">
          예상 정산일: {formatDate(item.estimatedSettlementDate)}
        </Text>
      )}
    </div>
  )
}
