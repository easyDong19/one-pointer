"use client"

import { RouteError } from "@/shared/ui/route-error"

export default function Error(props: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <RouteError {...props} message="마이페이지를 불러오지 못했어요." />
}
