"use client"

import { Text } from "@/shared/ui/text"
import { PortfolioList } from "./_components/portfolio-list"

export default function PortfoliosPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Text as="h1" typography="h3-bold">
          포트폴리오 관리
        </Text>
        <Text as="p" typography="body3-regular" className="mt-1 text-muted-foreground">
          작업물이나 서비스 사례를 등록하세요
        </Text>
      </div>

      <PortfolioList />
    </div>
  )
}
