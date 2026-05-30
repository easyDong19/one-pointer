"use client"

import { Wallet, ArrowRightLeft, ArrowRight } from "lucide-react"
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
    <div className="from-primary relative flex h-full flex-col overflow-hidden rounded-2xl bg-gradient-to-br to-[#5b4bd6] p-6 text-white shadow-[0_12px_40px_-12px_rgba(108,92,231,0.55)]">
      {/* 장식용 광원 */}
      <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-10 h-56 w-56 rounded-full bg-black/10 blur-3xl" />

      <div className="relative flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 ring-1 ring-inset ring-white/20">
          <Wallet className="h-4.5 w-4.5" />
        </div>
        <Text typography="subtitle2-bold" className="text-white">
          수익 요약
        </Text>
      </div>

      <div className="relative mt-6">
        <Text as="p" typography="caption1-medium" className="text-white/70">
          순수익
        </Text>
        <Text
          as="p"
          typography="h1-bold"
          className="mt-1 text-white tabular-nums"
        >
          {formatAmount(summary.totalNetEarnings)}
        </Text>
      </div>

      <div className="relative mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-white/10 p-3.5 ring-1 ring-inset ring-white/15">
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
            <Text as="p" typography="caption2-medium" className="text-white/70">
              정산 완료
            </Text>
          </div>
          <Text
            as="p"
            typography="body1-bold"
            className="mt-1 text-white tabular-nums"
          >
            {formatAmount(summary.settledAmount)}
          </Text>
        </div>
        <div className="rounded-xl bg-white/10 p-3.5 ring-1 ring-inset ring-white/15">
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
            <Text as="p" typography="caption2-medium" className="text-white/70">
              정산 대기
            </Text>
          </div>
          <Text
            as="p"
            typography="body1-bold"
            className="mt-1 text-white tabular-nums"
          >
            {formatAmount(summary.pendingAmount)}
          </Text>
        </div>
      </div>

      <div className="relative mt-4 flex items-center justify-between border-t border-white/15 pt-4">
        <div className="flex items-center gap-1.5 text-white/70">
          <ArrowRightLeft className="h-3.5 w-3.5" />
          <Text typography="caption1-medium" className="text-white/70">
            수수료 합계
          </Text>
        </div>
        <Text typography="body3-medium" className="text-white tabular-nums">
          {formatAmount(summary.totalFee)}
        </Text>
      </div>

      <div className="relative mt-auto pt-4">
        {summary.bankAccount?.bankCode && summary.bankAccount.accountNumber ? (
          <div className="rounded-xl bg-white/10 px-3.5 py-2.5 ring-1 ring-inset ring-white/15">
            <Text as="p" typography="caption2-medium" className="text-white/60">
              정산 계좌
            </Text>
            <Text
              as="p"
              typography="caption1-medium"
              className="text-white tabular-nums"
            >
              {getBankName(summary.bankAccount.bankCode)}{" "}
              {summary.bankAccount.accountNumber}
            </Text>
          </div>
        ) : (
          <Link
            href="/mypage/bank-account"
            className="group flex items-center justify-between rounded-xl bg-white px-3.5 py-2.5 transition-colors hover:bg-white/90"
          >
            <Text
              typography="caption1-medium"
              className="text-primary font-semibold"
            >
              정산 계좌를 등록해주세요
            </Text>
            <ArrowRight className="text-primary h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>
    </div>
  )
}
