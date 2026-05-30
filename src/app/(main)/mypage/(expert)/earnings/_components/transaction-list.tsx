"use client"

import { useState } from "react"
import { Loader2, Receipt } from "lucide-react"

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

      <div className="bg-muted inline-flex gap-1 self-start rounded-full p-1">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setStatus(tab.value)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-all",
              status === tab.value
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
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
        <div className="border-border bg-card flex flex-col items-center justify-center rounded-2xl border border-dashed py-16">
          <div className="bg-muted mb-3 flex h-12 w-12 items-center justify-center rounded-full">
            <Receipt className="text-muted-foreground h-5 w-5" />
          </div>
          <Text typography="body2-medium" className="text-muted-foreground">
            거래 내역이 없어요
          </Text>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-2.5">
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
