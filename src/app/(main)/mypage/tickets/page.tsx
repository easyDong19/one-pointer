"use client"

import { Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/tabs"
import { Text } from "@/shared/ui/text"
import { RouteLoading } from "@/shared/ui/route-loading"
import { MyTicketsList, type Tab } from "@/features/ticket/my-list/ui/my-tickets-list"

const TABS: { value: Tab; label: string }[] = [
  { value: "recruiting", label: "모집중" },
  { value: "in-progress", label: "진행중" },
  { value: "completed", label: "완료" },
]

function MyTicketsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const rawTab = searchParams.get("tab")
  const tab: Tab =
    rawTab === "in-progress" || rawTab === "completed" ? rawTab : "recruiting"

  const handleTabChange = (next: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", next)
    router.replace(`/mypage/tickets?${params.toString()}`)
  }

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <Text as="h1" typography="title-bold" className="text-foreground">
          나의 의뢰
        </Text>
        <Text typography="caption1-medium" className="text-muted-foreground">
          등록한 의뢰의 진행 상태를 확인할 수 있어요
        </Text>
      </header>

      <Tabs value={tab} onValueChange={handleTabChange}>
        <TabsList>
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <MyTicketsList tab={tab} />
    </section>
  )
}

export default function MyTicketsPage() {
  return (
    <Suspense fallback={<RouteLoading label="나의 의뢰를 불러오는 중" />}>
      <MyTicketsContent />
    </Suspense>
  )
}
