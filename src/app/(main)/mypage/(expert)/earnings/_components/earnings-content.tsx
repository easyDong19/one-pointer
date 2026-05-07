"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"

import type { EarningsPeriod } from "@/entities/earnings/api/earnings.schema"
import { useEarningsSummaryQuery } from "@/features/mypage/earnings"
import { Text } from "@/shared/ui/text"
import { cn } from "@/shared/lib/utils"

import { EarningsChart } from "./earnings-chart"
import { EarningsSummaryCard } from "./earnings-summary-card"
import { TransactionList } from "./transaction-list"

const PERIOD_TABS: { value: EarningsPeriod; label: string }[] = [
  { value: "DAILY", label: "일간" },
  { value: "WEEKLY", label: "주간" },
  { value: "MONTHLY", label: "월간" },
]

function getDateRange(period: EarningsPeriod) {
  const end = new Date()
  const start = new Date()

  switch (period) {
    case "DAILY":
      start.setDate(end.getDate() - 7)
      break
    case "WEEKLY":
      start.setDate(end.getDate() - 28)
      break
    case "MONTHLY":
      start.setMonth(end.getMonth() - 6)
      break
  }

  const fmt = (d: Date) => d.toISOString().split("T")[0]
  return { startDate: fmt(start), endDate: fmt(end) }
}

export function EarningsContent() {
  const [period, setPeriod] = useState<EarningsPeriod>("MONTHLY")
  const { startDate, endDate } = getDateRange(period)

  const { data: summary, isLoading } = useEarningsSummaryQuery({
    period,
    startDate,
    endDate,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-1.5">
        {PERIOD_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setPeriod(tab.value)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
              period === tab.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-accent",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {summary ? (
        <>
          <EarningsSummaryCard summary={summary} />
          <EarningsChart data={summary.earningsGraph} />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-12">
          <Text typography="body2-medium" className="text-muted-foreground">
            수익 데이터가 없어요
          </Text>
        </div>
      )}

      <TransactionList />
    </div>
  )
}
