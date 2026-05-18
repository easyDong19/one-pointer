"use client"

import { User } from "lucide-react"

import type {
  ChatBannerResponse,
  OpponentInfo,
} from "@/entities/chat/api/chat.schema"
import type { SenderType } from "@/entities/review/api/review.schema"
import { MobileHeader } from "@/shared/ui/mobile-header"
import { Text } from "@/shared/ui/text"

import { ChatRoomOptionsMenu } from "./chat-room-options-menu"

type Props = {
  opponent: OpponentInfo | null | undefined
  banner: ChatBannerResponse | null | undefined
  myRole: SenderType | null | undefined
  ticketId: number | null
}

/**
 * 채팅방 상단 헤더.
 * - 모바일: MobileHeader (back + 닉네임 + spacer).
 * - 데스크탑: AppBar (avatar + 닉네임/카테고리 + 옵션 드롭다운).
 *
 * 옵션 드롭다운은 `canRequestRefund=true` 일 때 환불 요청 항목 노출 (wave-3b).
 */
export function ChatRoomHeader({ opponent, banner, myRole, ticketId }: Props) {
  const nickname = opponent?.nickname ?? "상대방"
  const categories = opponent?.expertCategoryNames ?? []

  return (
    <>
      <MobileHeader>
        <MobileHeader.BackButton />
        <MobileHeader.Title>{nickname}</MobileHeader.Title>
        <MobileHeader.Spacer />
      </MobileHeader>

      <div className="bg-background/90 border-border sticky top-14 z-30 hidden items-center gap-3 border-b px-4 py-3 backdrop-blur-md md:flex">
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

        <ChatRoomOptionsMenu
          banner={banner}
          myRole={myRole}
          ticketId={ticketId}
        />
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
