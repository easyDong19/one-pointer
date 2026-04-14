"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useExpertExistsQuery } from "@/features/mypage"

export default function ExpertLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { data: exists, isLoading } = useExpertExistsQuery()

  useEffect(() => {
    if (!isLoading && exists === false) {
      router.replace("/mypage")
    }
  }, [exists, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="border-primary size-8 animate-spin rounded-full border-4 border-t-transparent" />
      </div>
    )
  }

  if (exists === false) {
    return null
  }

  return <>{children}</>
}
