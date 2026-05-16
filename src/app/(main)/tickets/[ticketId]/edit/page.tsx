"use client"

import { Suspense } from "react"
import { notFound } from "next/navigation"

import { AuthGuard } from "@/features/auth/guard"

import { TicketEditContent } from "./_components/ticket-edit-content"

type Props = {
  params: Promise<{ ticketId: string }>
}

export default async function TicketEditPage({ params }: Props) {
  const { ticketId } = await params
  const id = Number(ticketId)

  if (!Number.isInteger(id) || id <= 0) notFound()

  return (
    <AuthGuard>
      <Suspense>
        <TicketEditContent ticketId={id} />
      </Suspense>
    </AuthGuard>
  )
}
