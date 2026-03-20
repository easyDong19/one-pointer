"use client"

import { Share2 } from "lucide-react"
import { DetailPageHeader } from "@/shared/ui/detail-page-header"

export function ExpertDetailHeader() {
  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ url: window.location.href })
    } else {
      await navigator.clipboard.writeText(window.location.href)
    }
  }

  return (
    <DetailPageHeader
      title="전문가 프로필"
      rightAction={
        <button
          onClick={handleShare}
          className="flex h-9 w-9 items-center justify-center"
        >
          <Share2 className="text-foreground h-5 w-5" />
        </button>
      }
    />
  )
}
