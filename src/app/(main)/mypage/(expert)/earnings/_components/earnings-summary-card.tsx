"use client"

import { Wallet, ArrowRightLeft } from "lucide-react"
import Link from "next/link"

import type { EarningsSummary } from "@/entities/earnings/api/earnings.schema"
import { getBankName } from "@/shared/data/bank-codes"
import { Text } from "@/shared/ui/text"

type Props = {
  summary: EarningsSummary
}

function formatAmount(n: number) {
  return n.toLocaleString("ko-KR") + "원"
}

export function EarningsSummaryCard({ summary }: Props) {
  return (
    <div className="bg-card border-border rounded-xl border p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
          <Wallet className="text-primary h-4 w-4" />
        </div>
        <Text typography="subtitle2-bold" className="text-foreground">
          수익 요약
        </Text>
      </div>

      <div className="mb-4">
        <Text typography="caption1-medium" className="text-muted-foreground">
          순수익
        </Text>
        <Text typography="h2-bold" className="text-foreground tabular-nums">
          {formatAmount(summary.totalNetEarnings)}
        </Text>
      </div>

      <div className="bg-muted grid grid-cols-2 gap-3 rounded-lg p-3">
        <div>
          <Text typography="caption2-medium" className="text-muted-foreground">
            정산 완료
          </Text>
          <Text typography="body2-bold" className="text-foreground tabular-nums">
            {formatAmount(summary.settledAmount)}
          </Text>
        </div>
        <div>
          <Text typography="caption2-medium" className="text-muted-foreground">
            정산 대기
          </Text>
          <Text typography="body2-bold" className="text-foreground tabular-nums">
            {formatAmount(summary.pendingAmount)}
          </Text>
        </div>
      </div>

      <div className="border-border mt-3 flex items-center justify-between border-t pt-3">
        <div className="flex items-center gap-1.5">
          <ArrowRightLeft className="text-muted-foreground h-3.5 w-3.5" />
          <Text typography="caption2-medium" className="text-muted-foreground">
            수수료 합계
          </Text>
        </div>
        <Text typography="caption1-medium" className="text-foreground tabular-nums">
          {formatAmount(summary.totalFee)}
        </Text>
      </div>

      {summary.bankAccount ? (
        <div className="bg-muted mt-3 rounded-lg px-3 py-2">
          <Text typography="caption2-medium" className="text-muted-foreground">
            정산 계좌: {getBankName(summary.bankAccount.bankCode)} {summary.bankAccount.accountNumber}
          </Text>
        </div>
      ) : (
        <Link
          href="/mypage/bank-account"
          className="bg-primary/5 text-primary mt-3 block rounded-lg px-3 py-2 text-center text-sm font-medium transition-colors hover:bg-primary/10"
        >
          정산 계좌를 등록해주세요
        </Link>
      )}
    </div>
  )
}
