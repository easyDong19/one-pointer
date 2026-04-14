"use client"

import { Share2 } from "lucide-react"
import { MobileHeader } from "@/shared/ui/mobile-header"

export function ExpertDetailHeader() {
  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ url: window.location.href })
    } else {
      await navigator.clipboard.writeText(window.location.href)
    }
  }

  return (
    <MobileHeader>
      <MobileHeader.BackButton />
      <MobileHeader.Title>전문가 프로필</MobileHeader.Title>
      <MobileHeader.Action>
        <button
          onClick={handleShare}
          className="flex h-9 w-9 items-center justify-center"
        >
          <Share2 className="h-5 w-5 text-foreground" />
        </button>
      </MobileHeader.Action>
    </MobileHeader>
  )
}
