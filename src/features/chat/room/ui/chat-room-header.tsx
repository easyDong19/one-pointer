"use client"

import { MoreHorizontal, User } from "lucide-react"

import type { OpponentInfo } from "@/entities/chat/api/chat.schema"
import { MobileHeader } from "@/shared/ui/mobile-header"
import { Text } from "@/shared/ui/text"

type Props = {
  opponent: OpponentInfo | null | undefined
}

/**
 * 채팅방 상단 헤더.
 * - 모바일: MobileHeader (back + 닉네임 + spacer).
 * - 데스크탑: AppBar (avatar + 닉네임/카테고리 + 옵션 메뉴 placeholder).
 *
 * 환불 버튼 / 다이얼로그 등 실제 옵션 액션은 Wave 2 (배너 시스템) 에서.
 */
export function ChatRoomHeader({ opponent }: Props) {
  const nickname = opponent?.nickname ?? "상대방"
  const categories = opponent?.expertCategoryNames ?? []

  return (
    <>
      <MobileHeader>
        <MobileHeader.BackButton />
        <MobileHeader.Title>{nickname}</MobileHeader.Title>
        <MobileHeader.Spacer />
      </MobileHeader>

      <div className="bg-background/90 border-border sticky top-14 z-30 hidden items-center gap-3 border-b px-6 py-3 backdrop-blur-md md:flex lg:px-10">
        <Avatar imageUrl={opponent?.profileImageUrl} nickname={nickname} />

        <div className="min-w-0 flex-1">
          <Text
            as="div"
            typography="body2-bold"
            className="text-foreground truncate"
          >
            {nickname}
          </Text>
          {categories.length > 0 && (
            <Text
              as="p"
              typography="caption2-medium"
              className="text-muted-foreground truncate"
            >
              {categories.join(" · ")}
            </Text>
          )}
        </div>

        <button
          type="button"
          aria-label="채팅방 옵션"
          className="text-muted-foreground hover:text-foreground rounded-md p-2 transition-colors"
        >
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>
    </>
  )
}

function Avatar({
  imageUrl,
  nickname,
}: {
  imageUrl: string | null | undefined
  nickname: string
}) {
  return (
    <div className="bg-muted flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full">
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt={nickname} className="h-full w-full object-cover" />
      ) : (
        <User className="text-muted-foreground/40 h-4 w-4" />
      )}
    </div>
  )
}
