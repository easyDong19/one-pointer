"use client"

import { Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/tabs"
import { Text } from "@/shared/ui/text"
import { RouteLoading } from "@/shared/ui/route-loading"
import { MyProposalsList } from "@/features/proposal/ui/my-proposals-list"

type Tab = "in-progress" | "completed"

function MyProposalsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const rawTab = searchParams.get("tab")
  const tab: Tab = rawTab === "completed" ? "completed" : "in-progress"

  const handleTabChange = (next: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", next)
    router.replace(`/mypage/proposals?${params.toString()}`)
  }

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <Text as="h1" typography="title-bold" className="text-foreground">
          보낸 제안
        </Text>
        <Text typography="caption1-medium" className="text-muted-foreground">
          내가 보낸 제안서를 확인하고 철회할 수 있어요
        </Text>
      </header>

      <Tabs value={tab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="in-progress">진행중</TabsTrigger>
          <TabsTrigger value="completed">완료</TabsTrigger>
        </TabsList>
      </Tabs>

      <MyProposalsList tab={tab} />
    </section>
  )
}

export default function MyProposalsPage() {
  return (
    <Suspense fallback={<RouteLoading label="보낸 제안을 불러오는 중" />}>
      <MyProposalsContent />
    </Suspense>
  )
}
