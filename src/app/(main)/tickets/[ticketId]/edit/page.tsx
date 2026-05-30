"use client"

import { Suspense, use } from "react"
import { notFound } from "next/navigation"

import { AuthGuard } from "@/features/auth/guard"
import { RouteLoading } from "@/shared/ui/route-loading"

import { TicketEditContent } from "./_components/ticket-edit-content"

type Props = {
  params: Promise<{ ticketId: string }>
}

/**
 * 본인 의뢰 수정 — 소유자만 접근 가능한 사설 화면이라 CSR.
 * 서버는 ID validation 만 하고 의뢰 데이터는 client 에서 인증된 호출로 fetch.
 */
export default function TicketEditPage({ params }: Props) {
  const { ticketId } = use(params)
  const id = Number(ticketId)

  if (!Number.isInteger(id) || id <= 0) notFound()

  return (
    <AuthGuard>
      <Suspense fallback={<RouteLoading label="의뢰 수정 화면을 불러오는 중" />}>
        <TicketEditContent ticketId={id} />
      </Suspense>
    </AuthGuard>
  )
}
