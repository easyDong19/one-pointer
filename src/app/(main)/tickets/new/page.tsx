"use client"

import { Suspense } from "react"

import { AuthGuard } from "@/features/auth/guard"
import { RouteLoading } from "@/shared/ui/route-loading"

import { TicketCreateContent } from "./_components/ticket-create-content"

export default function Page() {
  return (
    <AuthGuard>
      <Suspense fallback={<RouteLoading label="의뢰 작성 화면을 불러오는 중" />}>
        <TicketCreateContent />
      </Suspense>
    </AuthGuard>
  )
}
