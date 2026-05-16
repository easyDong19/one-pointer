"use client"

import { Pencil, Share2 } from "lucide-react"
import { MobileHeader } from "@/shared/ui/mobile-header"

type Props = {
  /** 본인 + 편집 가능 상태일 때 전달. 없으면 수정 버튼 미노출 */
  onEdit?: () => void
}

export function TicketDetailHeader({ onEdit }: Props = {}) {
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
      <MobileHeader.Title>의뢰 상세</MobileHeader.Title>
      <MobileHeader.Action>
        <div className="flex items-center">
          {onEdit && (
            <button
              onClick={onEdit}
              aria-label="의뢰 수정"
              className="flex h-9 w-9 items-center justify-center"
            >
              <Pencil className="h-5 w-5 text-foreground" />
            </button>
          )}
          <button
            onClick={handleShare}
            aria-label="공유"
            className="flex h-9 w-9 items-center justify-center"
          >
            <Share2 className="h-5 w-5 text-foreground" />
          </button>
        </div>
      </MobileHeader.Action>
    </MobileHeader>
  )
}
