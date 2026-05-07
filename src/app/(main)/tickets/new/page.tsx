"use client"

import { Suspense } from "react"

import { AuthGuard } from "@/features/auth/guard"

import { TicketCreateContent } from "./_components/ticket-create-content"

export default function Page() {
  return (
    <AuthGuard>
      <Suspense>
        <TicketCreateContent />
      </Suspense>
    </AuthGuard>
  )
}
