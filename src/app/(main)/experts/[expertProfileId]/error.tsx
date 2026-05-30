"use client"

import { RouteError } from "@/shared/ui/route-error"

export default function Error(props: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <RouteError {...props} message="전문가 정보를 불러오지 못했어요." />
}
