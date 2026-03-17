"use client"

import { QueryClientProvider } from "@tanstack/react-query"
import { OverlayProvider } from "overlay-kit"
import { useEffect, useState } from "react"
import { getQueryClient } from "@/shared/lib/query-client"
import { useAuthStore } from "@/entities/auth/model/auth-store"

export default function Providers({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [queryClient] = useState(() => getQueryClient())

  useEffect(() => {
    useAuthStore.getState().bootstrap().catch(console.error)
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <OverlayProvider>{children}</OverlayProvider>
    </QueryClientProvider>
  )
}
