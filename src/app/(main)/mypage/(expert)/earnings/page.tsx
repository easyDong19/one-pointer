"use client"

import { Text } from "@/shared/ui/text"

import { EarningsContent } from "./_components/earnings-content"

export default function EarningsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Text as="h1" typography="h3-bold">
          수익 관리
        </Text>
        <Text as="p" typography="body3-regular" className="text-muted-foreground mt-1">
          수익 현황과 거래 내역을 확인하세요
        </Text>
      </div>

      <EarningsContent />
    </div>
  )
}
