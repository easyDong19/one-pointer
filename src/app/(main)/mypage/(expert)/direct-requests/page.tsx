"use client"

import { Text } from "@/shared/ui/text"
import { ReceivedDirectRequestList } from "@/features/ticket/direct-request-received"

export default function ReceivedDirectRequestsPage() {
  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <Text as="h1" typography="title-bold" className="text-foreground">
          받은 직접 요청
        </Text>
        <Text typography="caption1-medium" className="text-muted-foreground">
          의뢰인이 직접 보낸 요청을 확인하고 거절할 수 있어요
        </Text>
      </header>

      <ReceivedDirectRequestList />
    </section>
  )
}
