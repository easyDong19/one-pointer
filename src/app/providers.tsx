"use client"

import { QueryClientProvider } from "@tanstack/react-query"
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
    void useAuthStore.getState().bootstrap()
  }, [])

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
