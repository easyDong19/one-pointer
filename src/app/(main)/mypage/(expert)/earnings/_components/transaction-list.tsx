"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"

import type { TransactionStatus } from "@/entities/earnings/api/earnings.schema"
import { useEarningsTransactionsQuery } from "@/features/mypage/earnings"
import { Button } from "@/shared/ui/button"
import { Text } from "@/shared/ui/text"
import { cn } from "@/shared/lib/utils"

import { TransactionItemCard } from "./transaction-item-card"

const STATUS_TABS: { value: TransactionStatus; label: string }[] = [
  { value: "ALL", label: "전체" },
  { value: "SETTLED", label: "정산완료" },
  { value: "PENDING", label: "정산대기" },
]

export function TransactionList() {
  const [status, setStatus] = useState<TransactionStatus>("ALL")
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useEarningsTransactionsQuery(status)

  const items = data?.pages.flatMap((p) => p.content) ?? []

  return (
    <div className="flex flex-col gap-4">
      <Text typography="subtitle2-bold" className="text-foreground">
        거래 내역
      </Text>

      <div className="flex gap-1.5">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setStatus(tab.value)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
              status === tab.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-accent",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="text-primary h-6 w-6 animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Text typography="body2-medium" className="text-muted-foreground">
            거래 내역이 없어요
          </Text>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            {items.map((item) => (
              <TransactionItemCard key={item.paymentId} item={item} />
            ))}
          </div>

          {hasNextPage && (
            <Button
              variant="outline"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="w-full"
            >
              {isFetchingNextPage ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              더 보기
            </Button>
          )}
        </>
      )}
    </div>
  )
}
