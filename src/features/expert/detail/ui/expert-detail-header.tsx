"use client"

import { Share2 } from "lucide-react"
import { MobileHeader } from "@/shared/ui/mobile-header"
import { useShare } from "@/shared/hooks/use-share"

export function ExpertDetailHeader() {
  const share = useShare()

  return (
    <MobileHeader>
      <MobileHeader.BackButton />
      <MobileHeader.Title>전문가 프로필</MobileHeader.Title>
      <MobileHeader.Action>
        <button
          onClick={() => share()}
          className="flex h-9 w-9 items-center justify-center"
        >
          <Share2 className="h-5 w-5 text-foreground" />
        </button>
      </MobileHeader.Action>
    </MobileHeader>
  )
}
